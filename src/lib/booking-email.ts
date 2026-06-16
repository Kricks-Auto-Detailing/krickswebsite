import { BookingPayload, selectedAddOnLabels } from "@/lib/booking";
import { getServiceById } from "@/lib/services";

export async function sendBookingEmail(payload: BookingPayload, depositStatus: "paid" | "pending" = "paid") {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.BOOKING_TO_EMAIL || "zacharykrick3@gmail.com";
  const fromEmail = process.env.BOOKING_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    throw new Error("Email is not configured. Set RESEND_API_KEY and BOOKING_FROM_EMAIL on the server.");
  }

  const service = getServiceById(payload.serviceId);
  const addOnLabels = selectedAddOnLabels(payload.addOns);
  const serviceTitle = service?.title ?? payload.serviceId;
  const subjectPrefix = depositStatus === "paid" ? "Deposit paid" : "Deposit pending";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: payload.email,
      subject: `${subjectPrefix}: ${serviceTitle}`,
      html: buildEmailHtml(payload, serviceTitle, addOnLabels, depositStatus),
      text: buildEmailText(payload, serviceTitle, addOnLabels, depositStatus),
    }),
  });

  if (!response.ok) {
    throw new Error("Email provider rejected the booking request.");
  }
}

function buildEmailHtml(
  payload: BookingPayload,
  serviceTitle: string,
  addOnLabels: string[],
  depositStatus: "paid" | "pending",
) {
  const rows = [
    ["Deposit", depositStatus === "paid" ? "$20 paid through Square" : "$20 checkout started"],
    ["Customer", payload.fullName],
    ["Email", payload.email],
    ["Phone", payload.phone],
    ["Address", `${payload.address}, ${payload.city}`],
    ["Vehicle", `${payload.vehicleSize} ${payload.vehicleType}`],
    ["Service", serviceTitle],
    ["Add-ons", addOnLabels.join(", ") || "None"],
    ["Preferred date/time", `${payload.preferredDate} at ${payload.preferredTime}`],
    ["Overnight drop-off", payload.overnightDropoff ? "Requested" : "No"],
    ["Notes", payload.notes || "None"],
  ];

  return `
    <div style="background:#050505;color:#ffffff;font-family:Arial,sans-serif;padding:28px">
      <div style="border:1px solid #6D28D9;background:#0B0B0E;padding:24px">
        <p style="color:#FACC15;text-transform:uppercase;letter-spacing:2px;font-weight:700;margin:0 0 8px">New Booking Request</p>
        <h1 style="margin:0 0 20px;font-size:28px;text-transform:uppercase">Krick's Auto Detailing</h1>
        <table style="width:100%;border-collapse:collapse">
          ${rows
            .map(
              ([label, value]) => `
                <tr>
                  <td style="border-top:1px solid rgba(255,255,255,.12);padding:12px;color:#FACC15;font-weight:700;width:180px">${escapeHtml(label)}</td>
                  <td style="border-top:1px solid rgba(255,255,255,.12);padding:12px;color:#ffffff">${escapeHtml(value)}</td>
                </tr>
              `,
            )
            .join("")}
        </table>
        <p style="color:#bdbdbd;line-height:1.6;margin-top:22px">
          Deposit policy: the $20 deposit applies toward the final service total. Cancellations made less than 24 hours before the appointment or no-shows forfeit the deposit.
        </p>
        <p style="color:#bdbdbd;line-height:1.6;margin-top:8px">
          Travel policy: locations more than 30 minutes from Decatur, Indiana require an additional $20 travel fee.
        </p>
      </div>
    </div>
  `;
}

function buildEmailText(
  payload: BookingPayload,
  serviceTitle: string,
  addOnLabels: string[],
  depositStatus: "paid" | "pending",
) {
  return [
    "New booking request for Krick's Auto Detailing",
    `Deposit: ${depositStatus === "paid" ? "$20 paid through Square" : "$20 checkout started"}`,
    `Customer: ${payload.fullName}`,
    `Email: ${payload.email}`,
    `Phone: ${payload.phone}`,
    `Address: ${payload.address}, ${payload.city}`,
    `Vehicle: ${payload.vehicleSize} ${payload.vehicleType}`,
    `Service: ${serviceTitle}`,
    `Add-ons: ${addOnLabels.join(", ") || "None"}`,
    `Preferred date/time: ${payload.preferredDate} at ${payload.preferredTime}`,
    `Overnight drop-off: ${payload.overnightDropoff ? "Requested" : "No"}`,
    `Notes: ${payload.notes || "None"}`,
    "Customer accepted the $20 deposit policy and travel fee policy.",
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
