import { normalizeEmail, type BookingPayload } from "@/lib/booking";
import { squareRequest } from "./client";
import type { BookingHistoryEntry, SquareCustomer } from "./types";

type SearchCustomersResponse = {
  customers?: SquareCustomer[];
};

type CustomerResponse = {
  customer?: SquareCustomer;
};

export async function upsertSquareCustomer(payload: BookingPayload, serviceTitle: string, addOnLabels: string[]) {
  const email = normalizeEmail(payload.email);
  const phone = normalizeUsPhone(payload.phone);
  const existing = await findCustomer(email, phone);
  const historyEntry = buildHistoryEntry(payload, serviceTitle, addOnLabels);

  if (existing) {
    return updateCustomer(existing, payload, historyEntry, email, phone);
  }

  return createCustomer(payload, historyEntry, email, phone);
}

export function buildHistoryEntry(payload: BookingPayload, serviceTitle: string, addOnLabels: string[]): BookingHistoryEntry {
  return {
    date: new Date().toISOString(),
    service: serviceTitle,
    addOns: addOnLabels,
    appointment: `${payload.preferredDate} ${payload.preferredTime}`,
    vehicle: formatVehicle(payload),
    address: `${payload.address}, ${payload.city}`,
    notes: payload.notes || "None",
  };
}

async function findCustomer(email: string, phone: string) {
  const byEmail = email ? await searchCustomers({ email }) : undefined;
  if (byEmail) return byEmail;

  return phone ? searchCustomers({ phone }) : undefined;
}

async function searchCustomers({ email, phone }: { email?: string; phone?: string }) {
  const filter = email
    ? { email_address: { exact: email } }
    : {
        phone_number: { exact: phone },
      };

  const response = await squareRequest<SearchCustomersResponse>("/v2/customers/search", {
    method: "POST",
    body: {
      limit: 1,
      query: {
        filter,
      },
    },
  });

  return response.customers?.[0];
}

async function createCustomer(payload: BookingPayload, historyEntry: BookingHistoryEntry, email: string, phone: string) {
  const nameParts = splitName(payload.fullName);
  const response = await squareRequest<CustomerResponse>("/v2/customers", {
    method: "POST",
    body: {
      idempotency_key: crypto.randomUUID(),
      given_name: nameParts.givenName,
      family_name: nameParts.familyName,
      email_address: email,
      phone_number: phone,
      address: {
        address_line_1: payload.address,
        locality: payload.city,
      },
      note: buildCustomerNote(undefined, historyEntry),
    },
  });

  if (!response.customer) {
    throw new Error("Square did not return a customer profile.");
  }

  return response.customer;
}

async function updateCustomer(customer: SquareCustomer, payload: BookingPayload, historyEntry: BookingHistoryEntry, email: string, phone: string) {
  const nameParts = splitName(payload.fullName);
  const response = await squareRequest<CustomerResponse>(`/v2/customers/${encodeURIComponent(customer.id)}`, {
    method: "PUT",
    body: {
      given_name: customer.given_name || nameParts.givenName,
      family_name: customer.family_name || nameParts.familyName,
      email_address: email || customer.email_address,
      phone_number: phone || customer.phone_number,
      address: {
        address_line_1: payload.address,
        locality: payload.city,
      },
      note: buildCustomerNote(customer.note, historyEntry),
      version: customer.version,
    },
  });

  if (!response.customer) {
    throw new Error("Square did not return an updated customer profile.");
  }

  return response.customer;
}

function buildCustomerNote(existingNote: string | undefined, historyEntry: BookingHistoryEntry) {
  const entry = [
    `[Krick's Booking ${historyEntry.date}]`,
    `Appointment: ${historyEntry.appointment}`,
    `Service: ${historyEntry.service}`,
    `Add-ons: ${historyEntry.addOns.join(", ") || "None"}`,
    `Vehicle: ${historyEntry.vehicle}`,
    `Address: ${historyEntry.address}`,
    `Created from: kricksautodetailing.com booking form`,
    `Notes: ${historyEntry.notes}`,
  ].join("\n");

  return [entry, existingNote].filter(Boolean).join("\n\n").slice(0, 3000);
}

function splitName(fullName: string) {
  const [givenName = "", ...rest] = fullName.trim().split(/\s+/);
  return {
    givenName,
    familyName: rest.join(" "),
  };
}

function normalizeUsPhone(phone: string) {
  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;

  return trimmed;
}

function formatVehicle(payload: BookingPayload) {
  const details = [payload.vehicleYear, payload.vehicleColor, payload.vehicleMake, payload.vehicleModel]
    .filter(Boolean)
    .join(" ");
  return [payload.vehicleSize, payload.vehicleType, details].filter(Boolean).join(" ");
}
