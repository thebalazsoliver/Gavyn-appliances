import { business, services } from '../../src/data/site.ts';

interface Env {
  BREVO_API_KEY?: string;
  BREVO_FROM_EMAIL?: string;
  BREVO_TO_EMAIL?: string;
}

interface ContactContext {
  request: Request;
  env: Env;
}

const DEFAULT_EMAIL = 'balazsoliver.hu@gmail.com';
const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';
const MAX_BODY_BYTES = 48 * 1024;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const APPLIANCES = new Set<string>([
  ...services.map((service) => service.name),
  'Other household appliance',
]);
const SUCCESS_MESSAGE =
  'Your request has been submitted. We’ll follow up to discuss service and availability. An appointment is not yet confirmed.';
const FAILURE_MESSAGE = `We couldn’t confirm that your request was submitted. Please try again, call ${business.phone} or email ${business.email}.`;

class FormError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

function respond(request: Request, status: number, success: boolean, message: string): Response {
  const headers = new Headers({
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex',
  });
  if (status === 405) headers.set('Allow', 'POST');

  if (request.headers.get('Accept')?.includes('application/json')) {
    headers.set('Content-Type', 'application/json; charset=utf-8');
    return new Response(JSON.stringify({ success, message }), { status, headers });
  }

  const title = success ? 'Request submitted' : 'Request not submitted';
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set(
    'Content-Security-Policy',
    "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'",
  );
  return new Response(
    `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title} | ${escapeHtml(business.name)}</title>
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 32px 20px; background: #202123; color: #f5f2eb; font: 16px/1.7 system-ui, sans-serif; }
      main { max-width: 560px; margin: 8vh auto; }
      h1 { line-height: 1.2; }
      a { color: #e2bd78; overflow-wrap: anywhere; }
      .brand { color: #e2bd78; font-weight: 700; }
    </style>
  </head>
  <body>
    <main>
      <p class="brand">${escapeHtml(business.name)}</p>
      <h1>${title}</h1>
      <p>${escapeHtml(message)}</p>
      ${success ? '' : '<p>Use your browser’s Back button to return to your entered details, or contact us directly.</p>'}
      <p>Call <a href="${escapeHtml(business.phoneHref)}">${escapeHtml(business.phone)}</a> or email <a href="mailto:${escapeHtml(business.email)}">${escapeHtml(business.email)}</a>.</p>
      <a href="/#contact">Back to the website</a>
    </main>
  </body>
</html>`,
    { status, headers },
  );
}

async function readBody(request: Request): Promise<string> {
  const reader = request.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder();
  let bytes = 0;
  let body = '';

  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) return body + decoder.decode();
      bytes += chunk.value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new FormError(
          413,
          'Your request is too long. Please shorten your message and try again.',
        );
      }
      body += decoder.decode(chunk.value, { stream: true });
    }
  } finally {
    reader.releaseLock();
  }
}

async function readSubmission(request: Request): Promise<Record<string, unknown>> {
  const type = request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase();
  if (type !== 'application/json' && type !== 'application/x-www-form-urlencoded') {
    throw new FormError(415, 'Please submit your request using the website contact form.');
  }
  const body = await readBody(request);
  if (type === 'application/x-www-form-urlencoded') {
    return Object.fromEntries(new URLSearchParams(body));
  }

  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    throw new FormError(400, 'Please check your details and submit the form again.');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new FormError(400, 'Please check your details and submit the form again.');
  }
  return data as Record<string, unknown>;
}

function field(
  data: Record<string, unknown>,
  name: string,
  maxLength: number,
  minLength = 0,
): string {
  const raw = data[name] ?? '';
  if (typeof raw !== 'string') {
    throw new FormError(400, 'Please check your details and submit the form again.');
  }
  const value = raw.trim();
  if (value.length < minLength || value.length > maxLength) {
    throw new FormError(400, 'Please complete the required fields and check their length.');
  }
  if (name !== 'message' && /[\u0000-\u001f\u007f]/.test(value)) {
    throw new FormError(400, 'Please remove line breaks from your contact details.');
  }
  return value;
}

export async function onRequest({ request, env }: ContactContext): Promise<Response> {
  if (request.method !== 'POST') {
    return respond(request, 405, false, 'Please use the contact form to send a service request.');
  }
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) {
    return respond(
      request,
      403,
      false,
      'Please submit your request from the website contact form.',
    );
  }

  try {
    const data = await readSubmission(request);
    if (field(data, '_honey', MAX_BODY_BYTES)) {
      return respond(request, 200, true, SUCCESS_MESSAGE);
    }
    const name = field(data, 'name', 100, 1);
    const email = field(data, 'email', 254, 1);
    const phone = field(data, 'phone', 40);
    const location = field(data, 'location', 100, 1);
    const appliance = field(data, 'appliance', 100, 1);
    const message = field(data, 'message', 3000, 10);
    if (!EMAIL_PATTERN.test(email) || !APPLIANCES.has(appliance)) {
      throw new FormError(400, 'Please enter a valid email address and select an appliance.');
    }

    const apiKey = env.BREVO_API_KEY?.trim();
    const sender = env.BREVO_FROM_EMAIL?.trim() || DEFAULT_EMAIL;
    const recipient = env.BREVO_TO_EMAIL?.trim() || DEFAULT_EMAIL;
    if (!apiKey || !EMAIL_PATTERN.test(sender) || !EMAIL_PATTERN.test(recipient)) {
      return respond(
        request,
        503,
        false,
        `Online requests are temporarily unavailable. Please call ${business.phone} or email ${business.email}.`,
      );
    }

    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 15000);
    try {
      const response = await fetch(BREVO_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          sender: { name: business.name, email: sender },
          to: [{ email: recipient }],
          replyTo: { name, email },
          subject: 'New Gavyn Appliances service request',
          textContent: [
            `Name: ${name}`,
            `Email: ${email}`,
            `Phone: ${phone || 'Not provided'}`,
            `City or postal code: ${location}`,
            `Appliance: ${appliance}`,
            '',
            'Message:',
            message,
          ].join('\n'),
        }),
        signal: abort.signal,
      });
      if (response.status !== 201) {
        console.error('Brevo did not accept the service request.', { status: response.status });
        return respond(request, 502, false, FAILURE_MESSAGE);
      }
      const result: { messageId?: string } = await response.json();
      if (typeof result?.messageId !== 'string' || !result.messageId) {
        return respond(request, 502, false, FAILURE_MESSAGE);
      }
      return respond(request, 200, true, SUCCESS_MESSAGE);
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    if (error instanceof FormError) {
      return respond(request, error.status, false, error.message);
    }
    console.error('The service request could not be submitted.');
    return respond(request, 502, false, FAILURE_MESSAGE);
  }
}
