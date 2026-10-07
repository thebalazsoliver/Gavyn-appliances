import assert from 'node:assert/strict';
import { afterEach, mock, test } from 'node:test';
import { onRequest } from '../functions/api/contact.ts';

const valid = {
  name: 'Test Visitor',
  email: 'visitor@example.com',
  phone: '(905) 000-0000',
  location: 'Toronto',
  appliance: 'Air conditioning',
  message: 'The air conditioner needs maintenance.',
  _honey: '',
};
const configured = { BREVO_API_KEY: 'test-only-not-a-real-key' };

function request(data = valid, headers = {}) {
  return new Request('https://gavyn-appliances.pages.dev/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Origin: 'https://gavyn-appliances.pages.dev',
      ...headers,
    },
    body: JSON.stringify(data),
  });
}

function acceptEmail() {
  return mock.method(globalThis, 'fetch', async () =>
    Response.json({ messageId: '<test@example.com>' }, { status: 201 }),
  );
}

afterEach(() => mock.restoreAll());

test('sends a valid request with a fixed sender, recipient and subject', async () => {
  const send = acceptEmail();
  const response = await onRequest({
    request: request({ ...valid, to: 'attacker@example.com', _subject: 'Injected subject' }),
    env: configured,
  });
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.success, true);
  assert.ok(!JSON.stringify(result).includes(configured.BREVO_API_KEY));
  assert.equal(send.mock.callCount(), 1);
  const [url, options] = send.mock.calls[0].arguments;
  const payload = JSON.parse(options.body);
  assert.equal(url, 'https://api.brevo.com/v3/smtp/email');
  assert.equal(options.headers['api-key'], configured.BREVO_API_KEY);
  assert.ok(options.signal instanceof AbortSignal);
  assert.deepEqual(payload.sender, {
    name: 'Gavyn Appliances',
    email: 'balazsoliver.hu@gmail.com',
  });
  assert.deepEqual(payload.to, [{ email: 'balazsoliver.hu@gmail.com' }]);
  assert.deepEqual(payload.replyTo, { name: valid.name, email: valid.email });
  assert.equal(payload.subject, 'New Gavyn Appliances service request');
  for (const value of Object.values(valid).filter(Boolean)) {
    assert.ok(payload.textContent.includes(value));
  }
});

test('uses server-side sender and recipient overrides', async () => {
  const send = acceptEmail();
  const response = await onRequest({
    request: request(),
    env: {
      ...configured,
      BREVO_FROM_EMAIL: 'sender@example.com',
      BREVO_TO_EMAIL: 'business@example.com',
    },
  });
  assert.equal(response.status, 200);
  const payload = JSON.parse(send.mock.calls[0].arguments[1].body);
  assert.equal(payload.sender.email, 'sender@example.com');
  assert.deepEqual(payload.to, [{ email: 'business@example.com' }]);
});

test('supports a native form submission without JavaScript', async () => {
  const send = acceptEmail();
  const nativeRequest = new Request('https://gavyn-appliances.pages.dev/api/contact', {
    method: 'POST',
    headers: { Accept: 'text/html', Origin: 'https://gavyn-appliances.pages.dev' },
    body: new URLSearchParams(valid),
  });
  const response = await onRequest({ request: nativeRequest, env: configured });
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Content-Type'), /text\/html/);
  assert.match(await response.text(), /Request submitted/);
  assert.equal(send.mock.callCount(), 1);
});

test('validates required fields, lengths, email and appliance on the server', async () => {
  const send = acceptEmail();
  const invalidRequests = [
    { ...valid, name: '' },
    { ...valid, name: 'x'.repeat(101) },
    { ...valid, name: 'A name\r\nInjected header' },
    { ...valid, email: 'invalid' },
    { ...valid, email: 'visitor@example.com\r\nBcc: attacker@example.com' },
    { ...valid, phone: 'x'.repeat(41) },
    { ...valid, location: '' },
    { ...valid, appliance: 'Unknown service' },
    { ...valid, message: 'Too short' },
    { ...valid, message: 'x'.repeat(3001) },
    { ...valid, message: { text: 'Unexpected object' } },
    null,
    [],
  ];
  for (const data of invalidRequests) {
    const response = await onRequest({ request: request(data), env: configured });
    assert.equal(response.status, 400);
    assert.equal((await response.json()).success, false);
  }
  assert.equal(send.mock.callCount(), 0);
});

test('rejects malformed JSON, unsupported content types and oversized streamed bodies', async () => {
  const send = acceptEmail();
  for (const [body, contentType, status] of [
    ['{not json}', 'application/json', 400],
    ['plain text', 'text/plain', 415],
    ['x'.repeat(49 * 1024), 'application/json', 413],
  ]) {
    const badRequest = new Request('https://gavyn-appliances.pages.dev/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': contentType, Accept: 'application/json' },
      body,
    });
    const response = await onRequest({ request: badRequest, env: configured });
    assert.equal(response.status, status);
    assert.equal((await response.json()).success, false);
  }
  assert.equal(send.mock.callCount(), 0);
});

test('rejects cross-origin browser requests and unsupported methods', async () => {
  const send = acceptEmail();
  const crossOrigin = await onRequest({
    request: request(valid, { Origin: 'https://other.example.com' }),
    env: configured,
  });
  assert.equal(crossOrigin.status, 403);
  const get = await onRequest({
    request: new Request('https://gavyn-appliances.pages.dev/api/contact'),
    env: configured,
  });
  assert.equal(get.status, 405);
  assert.equal(get.headers.get('Allow'), 'POST');
  assert.equal(send.mock.callCount(), 0);
});

test('silently discards honeypot submissions without sending email', async () => {
  const send = acceptEmail();
  const response = await onRequest({ request: request({ _honey: 'bot' }), env: {} });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).success, true);
  assert.equal(send.mock.callCount(), 0);
});

test('missing or invalid configuration fails without sending email', async () => {
  const send = acceptEmail();
  for (const env of [{}, { ...configured, BREVO_FROM_EMAIL: 'invalid' }]) {
    const response = await onRequest({ request: request(), env });
    assert.equal(response.status, 503);
    const result = await response.json();
    assert.equal(result.success, false);
    assert.match(result.message, /temporarily unavailable/);
  }
  assert.equal(send.mock.callCount(), 0);
});

test('Brevo rejection never reports success or exposes provider error details', async () => {
  mock.method(console, 'error', () => {});
  mock.method(globalThis, 'fetch', async () =>
    Response.json({ message: 'private provider detail' }, { status: 403 }),
  );
  const response = await onRequest({ request: request(), env: configured });
  assert.equal(response.status, 502);
  const result = await response.json();
  assert.equal(result.success, false);
  assert.ok(!result.message.includes('private provider detail'));
  assert.ok(!result.message.includes(configured.BREVO_API_KEY));
});

test('network failures and aborted requests produce an error response', async () => {
  mock.method(console, 'error', () => {});
  let failure;
  const send = mock.method(globalThis, 'fetch', async () => {
    throw failure;
  });
  for (const error of [
    new TypeError('Test network failure'),
    new DOMException('Test timeout', 'AbortError'),
  ]) {
    failure = error;
    const response = await onRequest({ request: request(), env: configured });
    assert.equal(response.status, 502);
    assert.equal((await response.json()).success, false);
  }
  assert.equal(send.mock.callCount(), 2);
});

test('a 201 without a message ID does not confirm a submitted request', async () => {
  mock.method(globalThis, 'fetch', async () => Response.json({}, { status: 201 }));
  const response = await onRequest({ request: request(), env: configured });
  assert.equal(response.status, 502);
  assert.equal((await response.json()).success, false);
});

test('a native submission with missing configuration shows an error page', async () => {
  const send = acceptEmail();
  const response = await onRequest({
    request: new Request('https://gavyn-appliances.pages.dev/api/contact', {
      method: 'POST',
      body: new URLSearchParams(valid),
    }),
    env: {},
  });
  assert.equal(response.status, 503);
  assert.match(await response.text(), /Request not submitted/);
  assert.equal(send.mock.callCount(), 0);
});
