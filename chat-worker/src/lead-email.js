/**
 * Branded Tech Phase lead emails. User content is escaped before it is
 * placed in HTML. Nothing here names a third-party mail tool.
 */

export const LOGO_URL = "https://techphase.net/assets/img/logo-header.png";
export const AUTO_REPLY_SUBJECT = "Thanks for contacting TechPhase";

const FONT = "'Onest', 'Segoe UI', Helvetica, Arial, sans-serif";
const SITE = "https://techphase.net";
const INBOX = "info@techphase.net";

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function htmlText(value) {
  return escapeHtml(value).replace(/\r\n|\r|\n/g, "<br>");
}

export function notificationSubject(service) {
  const clean = String(service || "Enquiry").replace(/[\r\n]+/g, " ").trim() || "Enquiry";
  return `New project request — ${clean}`;
}

function detailRows(lead) {
  const rows = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone],
    ["Service", lead.service],
    ["Form", lead.source],
    ["Project", lead.project],
  ];
  if (lead.transcript) rows.push(["Transcript", lead.transcript]);
  return rows;
}

function detailTable(lead) {
  const rows = detailRows(lead).map(([label, value], index) => {
    const border = index ? "border-top:1px solid #e6e5e2;" : "";
    return `<tr>
      <td style="${border}padding:12px 14px 12px 0;font-family:${FONT};font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#8a8a8a;width:108px;vertical-align:top;">${escapeHtml(label)}</td>
      <td style="${border}padding:12px 0;font-family:${FONT};font-size:15px;line-height:1.5;color:#111111;vertical-align:top;">${htmlText(value)}</td>
    </tr>`;
  }).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows}</table>`;
}

function plainDetails(lead) {
  const lines = [
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    `Service: ${lead.service}`,
    `Form: ${lead.source}`,
    "Project:",
    lead.project,
  ];
  if (lead.transcript) lines.push("", "Transcript:", lead.transcript);
  return lines.join("\n");
}

function layout({ preheader, content }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>Tech Phase</title>
</head>
<body style="margin:0;padding:0;background:#f1f0ee;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f0ee;margin:0;padding:0;width:100%;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #e6e5e2;border-radius:24px;">
        <tr>
          <td style="padding:28px 32px 0;font-family:${FONT};">
            <img src="${LOGO_URL}" width="120" height="116" alt="Tech Phase" style="display:block;border:0;outline:none;text-decoration:none;width:120px;height:auto;">
            <div style="height:3px;width:48px;background:#b15f2c;border-radius:999px;margin-top:20px;line-height:3px;font-size:0;">&nbsp;</div>
          </td>
        </tr>
        ${content}
        <tr>
          <td style="padding:8px 32px 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;border-radius:16px;">
              <tr>
                <td style="padding:20px 22px;font-family:${FONT};">
                  <p style="margin:0;font-size:14px;font-weight:600;letter-spacing:-.01em;color:#ffffff;">Tech Phase</p>
                  <p style="margin:8px 0 0;font-size:13px;line-height:1.5;color:#d0d0d0;">
                    <a href="${SITE}" style="color:#cf8047;text-decoration:underline;">techphase.net</a>
                    &nbsp;&middot;&nbsp;
                    <a href="mailto:${INBOX}" style="color:#cf8047;text-decoration:underline;">${INBOX}</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

export function buildNotificationEmail(lead) {
  const subject = notificationSubject(lead.service);
  const intro = `A visitor sent this from the ${lead.source} on techphase.net.`;
  const html = layout({
    preheader: escapeHtml(`${subject}. ${intro}`),
    content: `<tr>
      <td style="padding:22px 32px 8px;font-family:${FONT};">
        <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#b15f2c;">New enquiry</p>
        <h1 style="margin:10px 0 0;font-size:28px;line-height:1.15;letter-spacing:-.02em;font-weight:600;color:#111111;">${escapeHtml(subject)}</h1>
        <p style="margin:14px 0 0;font-size:15px;line-height:1.55;color:#5c5c5c;">${escapeHtml(intro)}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 32px 20px;">
        ${detailTable(lead)}
      </td>
    </tr>`,
  });
  const text = [
    subject,
    "",
    intro,
    "",
    plainDetails(lead),
    "",
    "Tech Phase",
    SITE,
    INBOX,
  ].join("\n");
  return { subject, html, text };
}

export function buildAutoReplyEmail(lead) {
  const subject = AUTO_REPLY_SUBJECT;
  const greeting = `Hi ${lead.name},`;
  const html = layout({
    preheader: escapeHtml("We've received your project request and will reply within one business day."),
    content: `<tr>
      <td style="padding:22px 32px 8px;font-family:${FONT};">
        <p style="margin:0;font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:#b15f2c;">Tech Phase</p>
        <h1 style="margin:10px 0 0;font-size:28px;line-height:1.15;letter-spacing:-.02em;font-weight:600;color:#111111;">Thanks for contacting Tech Phase</h1>
        <p style="margin:16px 0 0;font-size:16px;line-height:1.55;color:#111111;">${escapeHtml(greeting)}</p>
        <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#5c5c5c;">Thanks for getting in touch. We've received your project request, and a member of the team will reply within one business day.</p>
        <p style="margin:18px 0 0;font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;color:#8a8a8a;">What you sent</p>
      </td>
    </tr>
    <tr>
      <td style="padding:4px 32px 20px;">
        ${detailTable(lead)}
      </td>
    </tr>`,
  });
  const text = [
    "Thanks for contacting Tech Phase",
    "",
    greeting,
    "",
    "Thanks for getting in touch. We've received your project request, and a member of the team will reply within one business day.",
    "",
    "What you sent",
    plainDetails(lead),
    "",
    "Tech Phase",
    SITE,
    INBOX,
  ].join("\n");
  return { subject, html, text };
}
