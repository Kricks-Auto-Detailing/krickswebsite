import { BookingPayload, selectedAddOnLabels, validateBooking } from "@/lib/booking";
import { getSquareCatalogForUi, findCatalogAddOns, findCatalogService } from "@/lib/square/catalog";
import { upsertSquareCustomer } from "@/lib/square/customers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: BookingPayload;

  try {
    payload = (await request.json()) as BookingPayload;
  } catch {
    return Response.json({ ok: false, message: "Invalid customer payload." }, { status: 400 });
  }

  const catalog = await getSquareCatalogForUi();
  const validation = validateBooking(payload, {
    serviceIds: catalog.services.map((service) => service.id),
    addOnIds: catalog.addOns.map((addOn) => addOn.id),
  });

  if (!validation.ok) {
    return Response.json({ ok: false, errors: validation.errors, message: "Customer validation failed." }, { status: 400 });
  }

  try {
    const service = findCatalogService(catalog, payload.serviceId);
    const selectedAddOns = findCatalogAddOns(catalog, payload.addOns);
    const addOnLabels = selectedAddOns.length
      ? selectedAddOns.map((addOn) => `${addOn.label} (${addOn.price})`)
      : selectedAddOnLabels(payload.addOns);
    const customer = await upsertSquareCustomer(payload, service?.title ?? payload.serviceId, addOnLabels);

    return Response.json({ ok: true, customer });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Could not create or update Square customer.",
      },
      { status: 500 },
    );
  }
}
