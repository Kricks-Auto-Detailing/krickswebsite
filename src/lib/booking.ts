import { addOns, getServiceById, services } from "./services";

export type BookingPayload = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  vehicleType: string;
  vehicleSize: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleColor?: string;
  serviceId: string;
  addOns: string[];
  preferredDate: string;
  preferredTime: string;
  overnightDropoff: boolean;
  notes: string;
  cancellationPolicy: boolean;
  travelFeePolicy: boolean;
};

export type BookingValidation = {
  ok: boolean;
  errors: Record<string, string>;
};

const requiredTextFields: Array<keyof BookingPayload> = [
  "fullName",
  "email",
  "phone",
  "address",
  "city",
  "vehicleType",
  "vehicleSize",
  "serviceId",
  "preferredDate",
  "preferredTime",
];

type BookingValidationOptions = {
  serviceIds?: string[];
  addOnIds?: string[];
};

export function validateBooking(payload: BookingPayload, options: BookingValidationOptions = {}): BookingValidation {
  const errors: Record<string, string> = {};

  for (const field of requiredTextFields) {
    if (!String(payload[field] ?? "").trim()) {
      errors[field] = "Required";
    }
  }

  if (payload.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    errors.email = "Enter a valid email";
  }

  const validServiceIds = options.serviceIds ?? services.map((service) => service.id);

  if (payload.serviceId && !validServiceIds.includes(payload.serviceId)) {
    errors.serviceId = "Select a valid service";
  }

  const selectedAddOns = new Set(options.addOnIds ?? addOns.map((addOn) => addOn.id));
  for (const addOn of payload.addOns) {
    if (!selectedAddOns.has(addOn as (typeof addOns)[number]["id"])) {
      errors.addOns = "Select valid add-ons";
    }
  }

  if (payload.preferredTime && !isBookableTime(payload.preferredTime)) {
    errors.preferredTime = "Appointments must start between 9:00 AM and 8:00 PM";
  }

  if (payload.preferredDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.preferredDate)) {
      errors.preferredDate = "Enter a valid appointment date";
    } else if (payload.preferredDate < getServiceTodayDate()) {
      errors.preferredDate = "Choose today or a future date";
    }
  }

  if (!payload.cancellationPolicy) {
    errors.cancellationPolicy = "Cancellation policy confirmation is required";
  }

  if (!payload.travelFeePolicy) {
    errors.travelFeePolicy = "Travel fee policy confirmation is required";
  }

  return { ok: Object.keys(errors).length === 0, errors };
}

export function isBookableTime(time: string) {
  const [hourValue, minuteValue] = time.split(":").map(Number);
  if (Number.isNaN(hourValue) || Number.isNaN(minuteValue)) return false;
  const minutes = hourValue * 60 + minuteValue;
  return minutes >= 9 * 60 && minutes <= 20 * 60;
}

export function isLikelyOutsideCoreRadius(city: string) {
  const normalized = city.trim().toLowerCase();
  const coreCities = new Set([
    "decatur",
    "monroe",
    "berne",
    "bluffton",
    "ossian",
    "willshire",
    "pleasant mills",
    "monroeville",
    "van wert",
  ]);
  return normalized.length > 2 && !coreCities.has(normalized);
}

export function getServiceTodayDate() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Indiana/Indianapolis",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

export function selectedAddOnLabels(ids: string[]) {
  return ids
    .map((id) => addOns.find((addOn) => addOn.id === id))
    .filter(Boolean)
    .map((addOn) => `${addOn!.label} (${addOn!.price})`);
}

type CalendarDisplayOptions = {
  serviceTitle?: string;
  addOnLabels?: string[];
};

export function buildIcsFile(payload: BookingPayload, options: CalendarDisplayOptions = {}) {
  const service = getServiceById(payload.serviceId);
  const startsAt = new Date(`${payload.preferredDate}T${payload.preferredTime}:00`);
  const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);
  const stamp = formatIcsDate(new Date());
  const start = formatIcsDate(startsAt);
  const end = formatIcsDate(endsAt);
  const address = `${payload.address}, ${payload.city}`;
  const serviceTitle = options.serviceTitle ?? service?.title ?? payload.serviceId;
  const addOnLabels = options.addOnLabels ?? selectedAddOnLabels(payload.addOns);
  const description = [
    `Service: ${serviceTitle}`,
    `Vehicle: ${payload.vehicleSize} ${payload.vehicleType}`,
    `Add-ons: ${addOnLabels.join(", ") || "None"}`,
    `Notes: ${payload.notes || "None"}`,
    "Policies: No appointments after 8:00 PM. The $20 deposit applies toward the final service total and is forfeited for late cancellations or no-shows. Locations more than 30 minutes from Decatur, Indiana require a $20 travel fee.",
  ].join("\\n");

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kricks Auto Detailing//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@kricksauto-detailing.local`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    "SUMMARY:Krick's Auto Detailing Appointment",
    `LOCATION:${escapeIcs(address)}`,
    `DESCRIPTION:${escapeIcs(description)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function buildGoogleCalendarUrl(payload: BookingPayload, options: CalendarDisplayOptions = {}) {
  const service = getServiceById(payload.serviceId);
  const startsAt = new Date(`${payload.preferredDate}T${payload.preferredTime}:00`);
  const endsAt = new Date(startsAt.getTime() + 2 * 60 * 60 * 1000);
  const address = `${payload.address}, ${payload.city}`;
  const serviceTitle = options.serviceTitle ?? service?.title ?? payload.serviceId;
  const addOnLabels = options.addOnLabels ?? selectedAddOnLabels(payload.addOns);
  const details = [
    `Service: ${serviceTitle}`,
    `Vehicle: ${payload.vehicleSize} ${payload.vehicleType}`,
    `Add-ons: ${addOnLabels.join(", ") || "None"}`,
    payload.notes ? `Notes: ${payload.notes}` : "",
    "Policy reminder: $20 deposit applies toward the final service total and is forfeited for late cancellations or no-shows. $20 travel fee outside the 30-minute Decatur radius.",
  ]
    .filter(Boolean)
    .join("\n");

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "Krick's Auto Detailing Appointment",
    dates: `${formatGoogleDate(startsAt)}/${formatGoogleDate(endsAt)}`,
    location: address,
    details,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function formatIcsDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function formatGoogleDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}
