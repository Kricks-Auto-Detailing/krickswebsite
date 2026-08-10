export async function sendAdminPasswordResetEmail(resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.BOOKING_FROM_EMAIL;
  const toEmail = process.env.ADMIN_RESET_EMAIL || "zacharykrick3@gmail.com";

  if (!apiKey || !fromEmail) {
    throw new Error("Email is not configured. Set RESEND_API_KEY and BOOKING_FROM_EMAIL on the server.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      subject: "Krick's Auto Detailing admin password reset",
      html: buildResetHtml(resetUrl),
      text: buildResetText(resetUrl),
    }),
  });

  if (!response.ok) {
    throw new Error("Email provider rejected the password reset request.");
  }
}

function buildResetHtml(resetUrl: string) {
  return `
    <div style="background:#050505;color:#ffffff;font-family:Arial,sans-serif;padding:28px">
      <div style="border:1px solid #6D28D9;background:#0B0B0E;padding:24px">
        <p style="color:#FACC15;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin:0 0 8px">Admin Password Reset</p>
        <h1 style="margin:0 0 16px;font-size:28px;text-transform:uppercase">Krick's Auto Detailing</h1>
        <p style="color:#d4d4d8;line-height:1.6">Use the button below to reset the gallery admin password. This link expires in 30 minutes.</p>
        <p style="margin:26px 0">
          <a href="${escapeHtml(resetUrl)}" style="background:#FACC15;color:#050505;display:inline-block;font-weight:800;padding:14px 20px;text-decoration:none;text-transform:uppercase;letter-spacing:1px">Reset Admin Password</a>
        </p>
        <p style="color:#a1a1aa;line-height:1.6">If you did not request this, you can ignore this email.</p>
      </div>
    </div>
  `;
}

function buildResetText(resetUrl: string) {
  return [
    "Krick's Auto Detailing admin password reset",
    "Use this link to reset the gallery admin password. It expires in 30 minutes.",
    resetUrl,
    "If you did not request this, ignore this email.",
  ].join("\n");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
