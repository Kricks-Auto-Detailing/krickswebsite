import { BookingPayload, normalizeBookingPayload } from "@/lib/booking";
import { prepareSquareBooking } from "@/lib/square/booking";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: BookingPayload;

  try {
    payload = (await request.json()) as BookingPayload;
  } catch {
    return Response.json({ ok: false, message: "Invalid booking payload." }, { status: 400 });
  }

  const normalizedPayload = normalizeBookingPayload(payload);

  try {
    const booking = await prepareSquareBooking(normalizedPayload, getRequestOrigin(request));

    if (!booking.ok) {
      return Response.json(booking, { status: 400 });
    }

    return Response.json(booking);
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Could not prepare the Square booking.",
      },
      { status: 500 },
    );
  }
}

function getRequestOrigin(request: Request) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  const url = new URL(request.url);
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return `${url.protocol}//${url.host}`;
}
