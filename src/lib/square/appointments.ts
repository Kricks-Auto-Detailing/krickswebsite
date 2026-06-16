import type { BookingPayload } from "@/lib/booking";
import { getSquareEnv } from "./env";
import { squareRequest } from "./client";
import type { SquareCustomer, SquareService } from "./types";

type CreateBookingResponse = {
  booking?: {
    id?: string;
    status?: string;
  };
};

export async function maybeCreateSquareAppointment(payload: BookingPayload, service: SquareService, customer: SquareCustomer) {
  if (process.env.SQUARE_CREATE_APPOINTMENT_ON_SUBMIT !== "true") {
    return undefined;
  }

  const teamMemberId = process.env.SQUARE_TEAM_MEMBER_ID;

  if (!teamMemberId || !service.squareVariationId || !service.squareVersion) {
    return undefined;
  }

  const env = getSquareEnv();
  const response = await squareRequest<CreateBookingResponse>("/v2/bookings", {
    method: "POST",
    body: {
      idempotency_key: crypto.randomUUID(),
      booking: {
        customer_id: customer.id,
        location_id: env.locationId,
        start_at: new Date(`${payload.preferredDate}T${payload.preferredTime}:00`).toISOString(),
        customer_note: buildAppointmentNote(payload, service),
        appointment_segments: [
          {
            duration_minutes: durationToMinutes(service.estimatedTime),
            service_variation_id: service.squareVariationId,
            service_variation_version: service.squareVersion,
            team_member_id: teamMemberId,
          },
        ],
      },
    },
  });

  return response.booking;
}

function durationToMinutes(estimatedTime: string | undefined) {
  if (!estimatedTime) return 120;
  const hours = Number.parseFloat(estimatedTime);
  return Number.isFinite(hours) ? Math.max(30, Math.round(hours * 60)) : 120;
}

function buildAppointmentNote(payload: BookingPayload, service: SquareService) {
  return [
    "Created from Krick's website booking flow.",
    `Service: ${service.title}`,
    `Vehicle: ${[payload.vehicleSize, payload.vehicleType, payload.vehicleYear, payload.vehicleColor, payload.vehicleMake, payload.vehicleModel].filter(Boolean).join(" ")}`,
    `Address: ${payload.address}, ${payload.city}`,
    `Add-ons: ${payload.addOns.join(", ") || "None"}`,
    `Overnight drop-off: ${payload.overnightDropoff ? "Requested" : "No"}`,
    `Notes: ${payload.notes || "None"}`,
  ].join("\n");
}
