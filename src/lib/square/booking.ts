import { BookingPayload, selectedAddOnLabels, validateBooking } from "@/lib/booking";
import { createDepositPaymentLink } from "@/lib/square-booking";
import { findCatalogAddOns, findCatalogService, getSquareCatalogForUi } from "./catalog";
import { maybeCreateSquareAppointment } from "./appointments";
import { upsertSquareCustomer } from "./customers";
import type { SquareBookingContext } from "./types";

export async function prepareSquareBooking(payload: BookingPayload, origin: string) {
  const catalog = await getSquareCatalogForUi();
  const selectedService = findCatalogService(catalog, payload.serviceId);
  const selectedAddOns = findCatalogAddOns(catalog, payload.addOns);
  const validation = validateBooking(payload, {
    serviceIds: catalog.services.map((service) => service.id),
    addOnIds: catalog.addOns.map((addOn) => addOn.id),
  });

  if (!validation.ok) {
    return {
      ok: false as const,
      errors: validation.errors,
      message: "Booking validation failed.",
    };
  }

  if (!selectedService) {
    return {
      ok: false as const,
      errors: { serviceId: "Select a valid service" },
      message: "Booking validation failed.",
    };
  }

  const addOnLabels = selectedAddOns.length
    ? selectedAddOns.map((addOn) => `${addOn.label} (${addOn.price})`)
    : selectedAddOnLabels(payload.addOns);
  const customer = await upsertSquareCustomer(payload, selectedService.title, addOnLabels);
  const context: SquareBookingContext = {
    payload,
    catalog,
    selectedService,
    selectedAddOns,
    customer,
  };
  const appointment = await maybeCreateSquareAppointment(payload, selectedService, customer);
  const paymentLink = await createDepositPaymentLink(payload, origin, context);

  return {
    ok: true as const,
    checkoutUrl: paymentLink.checkoutUrl,
    customerId: customer.id,
    appointmentId: appointment?.id,
    orderId: paymentLink.orderId,
  };
}
