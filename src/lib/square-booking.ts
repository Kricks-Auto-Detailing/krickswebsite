import { createHmac, timingSafeEqual } from "node:crypto";
import { BookingPayload } from "@/lib/booking";
import { getServiceById } from "@/lib/services";
import { getSquareEnv } from "@/lib/square/env";
import type { SquareBookingContext } from "@/lib/square/types";

type SquarePaymentLinkResponse = {
  payment_link?: {
    id: string;
    order_id?: string;
    url?: string;
    long_url?: string;
  };
  errors?: Array<{ detail?: string; code?: string; field?: string; category?: string }>;
};

type SquareOrderResponse = {
  order?: {
    metadata?: Record<string, string>;
  };
  errors?: Array<{ detail?: string; code?: string }>;
};

export function bookingToSquareMetadata(payload: BookingPayload) {
  return {
    name: payload.fullName.slice(0, 255),
    email: payload.email.slice(0, 255),
    phone: payload.phone.slice(0, 255),
    address: `${payload.address}, ${payload.city}`.slice(0, 255),
    vehicle: `${payload.vehicleSize} ${payload.vehicleType}`.slice(0, 255),
    vehicle_make: (payload.vehicleMake ?? "").slice(0, 255),
    vehicle_model: (payload.vehicleModel ?? "").slice(0, 255),
    vehicle_year: (payload.vehicleYear ?? "").slice(0, 255),
    vehicle_color: (payload.vehicleColor ?? "").slice(0, 255),
    service: payload.serviceId.slice(0, 255),
    addons: (payload.addOns.join("|") || "None").slice(0, 255),
    appt: `${payload.preferredDate}T${payload.preferredTime}`.slice(0, 255),
    dropoff: String(payload.overnightDropoff),
    notes: (payload.notes || "None").slice(0, 255),
  };
}

export function squareMetadataToBooking(metadata: Record<string, string> = {}): BookingPayload {
  const [preferredDate = "", preferredTime = ""] = (metadata.appt ?? "").split("T");
  const [address = "", city = ""] = splitAddress(metadata.address ?? "");
  const [vehicleSize = "", ...vehicleTypeParts] = (metadata.vehicle ?? "").split(" ");

  return {
    fullName: metadata.name ?? "",
    email: metadata.email ?? "",
    phone: metadata.phone ?? "",
    address,
    city,
    vehicleType: vehicleTypeParts.join(" "),
    vehicleSize,
    vehicleMake: metadata.vehicle_make ?? "",
    vehicleModel: metadata.vehicle_model ?? "",
    vehicleYear: metadata.vehicle_year ?? "",
    vehicleColor: metadata.vehicle_color ?? "",
    serviceId: metadata.service ?? "",
    addOns: metadata.addons ? metadata.addons.split("|").filter(Boolean) : [],
    preferredDate,
    preferredTime,
    overnightDropoff: metadata.dropoff === "true",
    notes: metadata.notes ?? "",
    cancellationPolicy: true,
    travelFeePolicy: true,
  };
}

export function createBookingToken(payload: BookingPayload) {
  const secret = getSquareEnv().bookingTokenSecret;

  const body = base64UrlEncode(JSON.stringify({ payload, issuedAt: Date.now() }));
  const signature = signTokenBody(body, secret);

  return `${body}.${signature}`;
}

export function parseBookingToken(token: string) {
  const secret = getSquareEnv().bookingTokenSecret;
  const [body, signature] = token.split(".");

  if (!secret || !body || !signature || signTokenBody(body, secret) !== signature) {
    return null;
  }

  try {
    const decoded = JSON.parse(base64UrlDecode(body)) as { payload: BookingPayload; issuedAt: number };
    const maxAgeMs = 1000 * 60 * 60 * 24 * 7;

    if (!decoded.issuedAt || Date.now() - decoded.issuedAt > maxAgeMs) {
      return null;
    }

    return decoded.payload;
  } catch {
    return null;
  }
}

export async function createDepositPaymentLink(payload: BookingPayload, origin: string, context?: SquareBookingContext) {
  const env = getSquareEnv();
  const service = context?.selectedService ?? getServiceById(payload.serviceId);
  const bookingToken = createBookingToken(payload);
  const metadata = compactMetadata({
    name: payload.fullName,
    email: payload.email,
    phone: payload.phone,
    service: payload.serviceId,
    service_name: service?.title ?? payload.serviceId,
    appt: `${payload.preferredDate}T${payload.preferredTime}`,
    vehicle: `${payload.vehicleSize} ${payload.vehicleType}`,
    addons: payload.addOns.join("|") || "None",
    customer_id: context?.customer.id,
  });

  const response = await fetch(`${env.apiBaseUrl}/v2/online-checkout/payment-links`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.accessToken}`,
      "Content-Type": "application/json",
      "Square-Version": env.version,
    },
    body: JSON.stringify({
      idempotency_key: crypto.randomUUID(),
      description: "Krick's Auto Detailing appointment deposit",
      order: {
        location_id: env.locationId,
        customer_id: context?.customer.id,
        reference_id: crypto.randomUUID().slice(0, 40),
        metadata,
        line_items: [
          {
            name: "Krick's Auto Detailing Appointment Deposit",
            quantity: "1",
            note: `$20 deposit applied toward ${service?.title ?? "selected service"}`.slice(0, 255),
            base_price_money: {
              amount: 2000,
              currency: "USD",
            },
          },
        ],
      },
      checkout_options: {
        redirect_url: `${origin}/booking/success?booking=${encodeURIComponent(bookingToken)}`,
      },
      pre_populated_data: {
        buyer_email: payload.email,
      },
      payment_note: `Krick's deposit for ${payload.fullName} / ${service?.title ?? payload.serviceId}`.slice(0, 500),
    }),
  });

  const result = (await response.json()) as SquarePaymentLinkResponse;
  const checkoutUrl = result.payment_link?.url || result.payment_link?.long_url;

  if (!response.ok || !checkoutUrl) {
    throw new Error(formatSquareErrors(result.errors) || "Square could not create a payment link.");
  }

  return {
    checkoutUrl,
    orderId: result.payment_link?.order_id,
  };
}

function formatSquareErrors(errors: SquarePaymentLinkResponse["errors"]) {
  if (!errors?.length) return "";

  return errors
    .map((error) => [error.code, error.field, error.detail].filter(Boolean).join(": "))
    .join("; ");
}

function compactMetadata(metadata: Record<string, string | undefined>) {
  return Object.fromEntries(
    Object.entries(metadata)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].trim().length > 0)
      .map(([key, value]) => [key, value.slice(0, 255)]),
  );
}

export async function retrieveSquareOrder(orderId: string) {
  const env = getSquareEnv();

  const response = await fetch(`${env.apiBaseUrl}/v2/orders/${encodeURIComponent(orderId)}`, {
    headers: {
      Authorization: `Bearer ${env.accessToken}`,
      "Square-Version": env.version,
    },
    cache: "no-store",
  });

  const result = (await response.json()) as SquareOrderResponse;

  if (!response.ok || !result.order) {
    throw new Error(result.errors?.[0]?.detail ?? result.errors?.[0]?.code ?? "Square could not retrieve the order.");
  }

  return result.order;
}

export function verifySquareSignature(rawBody: string, signature: string | null, requestUrl: string) {
  const env = getSquareEnv();
  const signatureKey = env.webhookSignatureKey;
  const notificationUrl = env.webhookUrl || requestUrl;

  if (!signatureKey || !signature) return false;

  const expectedSignature = createHmac("sha256", signatureKey)
    .update(notificationUrl + rawBody)
    .digest("base64");
  const expectedBuffer = Buffer.from(expectedSignature);
  const receivedBuffer = Buffer.from(signature);

  return expectedBuffer.length === receivedBuffer.length && timingSafeEqual(expectedBuffer, receivedBuffer);
}

function signTokenBody(body: string, secret: string) {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

function base64UrlEncode(value: string) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function splitAddress(value: string) {
  const index = value.lastIndexOf(",");
  if (index === -1) return [value, ""];
  return [value.slice(0, index).trim(), value.slice(index + 1).trim()];
}
