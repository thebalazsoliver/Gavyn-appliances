import { business } from '../data/site.ts';

export interface ServiceRequestDetails {
  name: string;
  email: string;
  phone: string;
  location: string;
  appliance: string;
  message: string;
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

function detailRow(label: string, value: string): string {
  return `<tr>
    <td class="details-label" width="110" valign="top" style="width:110px;padding:12px 12px 12px 0;border-bottom:1px solid #eeeae2;color:#72716b;font-size:12px;line-height:22px;">${label}</td>
    <td valign="top" style="padding:12px 0;border-bottom:1px solid #eeeae2;color:#242628;font-size:15px;line-height:22px;word-break:break-word;word-wrap:break-word;">${value}</td>
  </tr>`;
}

export function createServiceRequestEmail(details: ServiceRequestDetails) {
  const subject = 'New Gavyn Appliances service request';
  const replyHref = `mailto:${encodeURIComponent(details.email)}?subject=${encodeURIComponent(`Re: ${subject}`)}`;
  const phoneNumber = details.phone.replace(/[^\d+]/g, '');
  const phone = /^\+?\d{7,15}$/.test(phoneNumber)
    ? `<a href="tel:${phoneNumber}" style="color:#242628;text-decoration:none;">${escapeHtml(details.phone)}</a>`
    : escapeHtml(details.phone || 'Not provided');
  const rows = [
    detailRow(
      'Email',
      `<a href="${escapeHtml(replyHref)}" style="color:#765b28;text-decoration:underline;word-break:break-all;">${escapeHtml(details.email)}</a>`,
    ),
    detailRow('Phone', phone),
    detailRow('Location', escapeHtml(details.location)),
  ].join('\n');
  const message = escapeHtml(details.message).replace(/\r\n|\r|\n/g, '<br>');
  const preheader = escapeHtml(`${details.name} · ${details.appliance} · ${details.location}`);

  const htmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${subject}</title>
    <style>
      @media only screen and (max-width:480px) {
        .email-padding { padding:24px 20px !important; }
        .email-header { padding:28px 20px !important; }
        .email-title { font-size:28px !important; line-height:34px !important; }
        .details-label { width:80px !important; }
        .reply-button { display:block !important; text-align:center !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f1ec;color:#242628;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;mso-hide:all;">${preheader}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f3f1ec" style="width:100%;background-color:#f3f1ec;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border:1px solid #e4dfd4;border-radius:12px;">
            <tr>
              <td class="email-header" bgcolor="#242628" style="padding:32px 36px;background-color:#242628;border-radius:11px 11px 0 0;border-bottom:4px solid #d6b677;">
                <p style="margin:0 0 22px;color:#dfc085;font-size:12px;line-height:18px;font-weight:bold;letter-spacing:2px;">GAVYN APPLIANCES</p>
                <h1 class="email-title" style="margin:0;color:#ffffff;font-size:32px;line-height:38px;font-weight:bold;">New service request.</h1>
                <p style="margin:12px 0 0;color:#d2d0c9;font-size:14px;line-height:22px;">A customer has reached out through your website.</p>
              </td>
            </tr>
            <tr>
              <td class="email-padding" bgcolor="#ffffff" style="padding:32px 36px;background-color:#ffffff;border-radius:0 0 11px 11px;">
                <p style="margin:0 0 10px;color:#765b28;font-size:11px;line-height:16px;font-weight:bold;letter-spacing:1.5px;">CUSTOMER DETAILS</p>
                <h2 style="margin:0 0 8px;color:#242628;font-size:24px;line-height:32px;font-weight:bold;word-break:break-word;word-wrap:break-word;">${escapeHtml(details.name)}</h2>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;">
                  ${rows}
                </table>

                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;margin-top:24px;">
                  <tr>
                    <td bgcolor="#f5efdf" style="padding:16px 18px;background-color:#f5efdf;border:1px solid #e7d8b7;border-radius:8px;">
                      <p style="margin:0 0 4px;color:#765b28;font-size:10px;line-height:16px;font-weight:bold;letter-spacing:1.2px;">APPLIANCE</p>
                      <p style="margin:0;color:#242628;font-size:17px;line-height:24px;font-weight:bold;">${escapeHtml(details.appliance)}</p>
                    </td>
                  </tr>
                </table>

                <h3 style="margin:26px 0 12px;color:#242628;font-size:16px;line-height:24px;font-weight:bold;">Customer’s message</h3>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;table-layout:fixed;">
                  <tr>
                    <td bgcolor="#f8f7f3" style="padding:18px 20px;background-color:#f8f7f3;border-left:3px solid #d6b677;color:#333534;font-size:15px;line-height:25px;word-break:break-word;word-wrap:break-word;">${message}</td>
                  </tr>
                </table>

                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:26px;">
                  <tr>
                    <td bgcolor="#d6b677" style="background-color:#d6b677;border-radius:6px;mso-padding-alt:14px 24px;">
                      <a class="reply-button" href="${escapeHtml(replyHref)}" style="display:inline-block;padding:14px 24px;border:1px solid #d6b677;border-radius:6px;color:#242628;font-size:15px;line-height:20px;font-weight:bold;text-decoration:none;">Reply to customer</a>
                    </td>
                  </tr>
                </table>
                <p style="margin:12px 0 0;color:#72716b;font-size:12px;line-height:20px;">You can also use Reply in your inbox to contact this customer.</p>
              </td>
            </tr>
          </table>
          <!--[if mso]></td></tr></table><![endif]-->
          <p style="max-width:560px;margin:18px 12px 0;color:#77746d;font-size:11px;line-height:18px;">${escapeHtml(business.name)} · Website enquiry<br>Service and appointment availability are still to be confirmed.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const textContent = [
    `Name: ${details.name}`,
    `Email: ${details.email}`,
    `Phone: ${details.phone || 'Not provided'}`,
    `City or postal code: ${details.location}`,
    `Appliance: ${details.appliance}`,
    '',
    'Message:',
    details.message,
  ].join('\n');

  return { subject, htmlContent, textContent };
}
