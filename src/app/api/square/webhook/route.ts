import { sendBookingEmail } from "@/lib/booking-email";
import { retrieveSquareOrder, squareMetadataToBooking, verifySquareSignature } from "@/lib/square-booking";

export const runtime = "nodejs";

type SquareWebhookEvent = {
  type?: string;
  data?: {
    object?: {
      payment?: {
        status?: string;
        order_id?: string;
      };
      order?: {
        id?: string;
        metadata?: Record<string, string>;
      };
    };
  };
};

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-square-hmacsha256-signature");

  try {
    if (!verifySquareSignature(rawBody, signature, request.url)) {
      console.warn("[square-webhook] Invalid signature");
      return Response.json({ ok: false, message: "Invalid Square signature." }, { status: 403 });
    }

    const event = JSON.parse(rawBody) as SquareWebhookEvent;
    const payment = event.data?.object?.payment;
    const order = event.data?.object?.order;

    console.info("[square-webhook] Received event", event.type);

    if (payment?.status === "COMPLETED" && payment.order_id) {
      const squareOrder = await retrieveSquareOrder(payment.order_id);
      const booking = squareMetadataToBooking(squareOrder.metadata);
      await sendBookingEmail(booking, "paid");
    }

    if (event.type?.startsWith("order.") && order?.metadata) {
      console.info("[square-webhook] Booking order update", order.id);
    }

    if (event.type?.startsWith("booking.")) {
      console.info("[square-webhook] Booking appointment update", event.type);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error("[square-webhook] Handler failed", error);
    return Response.json({ ok: false, message: "Square webhook handler failed." }, { status: 500 });
  }
}
