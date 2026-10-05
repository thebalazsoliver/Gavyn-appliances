import { business } from '../data/site';

export function initializeContactForm() {
  const form = document.querySelector<HTMLFormElement>('#service-request');
  const status = document.querySelector<HTMLParagraphElement>('#form-status');
  const button = form?.querySelector<HTMLButtonElement>('button[type="submit"]');
  if (!form || !status || !button) return;
  const label = button.querySelector<HTMLSpanElement>('span');
  let submitting = false;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submitting || !form.reportValidity()) return;
    submitting = true;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    if (label) label.textContent = 'Sending your request…';
    status.hidden = true;
    const timeout = new AbortController();
    const timeoutId = window.setTimeout(() => timeout.abort(), 20000);

    try {
      const response = await fetch(business.formEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
        signal: timeout.signal,
      });
      const result = await response.json();
      if (!response.ok || (result.success !== true && result.success !== 'true')) {
        throw new Error('The form provider did not accept the request.');
      }
      const providerMessage = typeof result.message === 'string' ? result.message : '';
      if (/activat|confirm.*email|check.*inbox/i.test(providerMessage)) {
        status.dataset.state = 'error';
        status.textContent =
          'Online requests are awaiting email setup. Please call (905) 505-4287 or email gavyn.robinson@gmail.com to arrange service.';
      } else {
        status.dataset.state = 'success';
        status.textContent =
          'Your request has been submitted. We’ll follow up to discuss service and availability. An appointment is not yet confirmed.';
        form.reset();
      }
    } catch {
      status.dataset.state = 'error';
      status.textContent =
        'We couldn’t confirm that your request was submitted. Your details are still here. Please try again, call (905) 505-4287 or email gavyn.robinson@gmail.com.';
    } finally {
      window.clearTimeout(timeoutId);
      submitting = false;
      button.disabled = false;
      button.removeAttribute('aria-busy');
      if (label) label.textContent = 'Send service request';
      status.hidden = false;
      status.focus({ preventScroll: true });
    }
  });
}
