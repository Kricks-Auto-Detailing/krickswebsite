import type { Metadata } from "next";
import Link from "next/link";
import { CalendarButtons } from "@/components/CalendarButtons";
import { SectionHeader } from "@/components/SectionHeader";
import { getServiceById } from "@/lib/services";
import { findCatalogAddOns, findCatalogService, getSquareCatalogForUi } from "@/lib/square/catalog";
import { parseBookingToken } from "@/lib/square-booking";

export const metadata: Metadata = {
  title: "Deposit Paid",
  description: "Krick's Auto Detailing booking deposit confirmation.",
};

type BookingSuccessPageProps = {
  searchParams: Promise<{ booking?: string }>;
};

export default async function BookingSuccessPage({ searchParams }: BookingSuccessPageProps) {
  const params = await searchParams;

  if (!params.booking) {
    return <MissingSession />;
  }

  const booking = parseBookingToken(params.booking);

  if (!booking) {
    return <MissingSession />;
  }

  const catalog = await getSquareCatalogForUi();
  const squareService = findCatalogService(catalog, booking.serviceId);
  const selectedAddOns = findCatalogAddOns(catalog, booking.addOns);
  const service = getServiceById(booking.serviceId);
  const serviceTitle = squareService?.title ?? service?.title ?? booking.serviceId;
  const addOnLabels = selectedAddOns.map((addOn) => `${addOn.label} (${addOn.price})`);

  return (
    <>
      <section className="bg-[radial-gradient(circle_at_80%_25%,rgba(109,40,217,0.38),transparent_32%),linear-gradient(135deg,#050505,#140726,#050505)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Deposit paid"
            title="Your appointment request is reserved."
            text="Your $20 deposit was received through Square and will be applied toward the final service total. Krick's will confirm the appointment details."
          />
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-6">
          <div className="border border-[#6D28D9]/60 bg-[#080808] p-6 shadow-[0_0_50px_rgba(109,40,217,0.18)] sm:p-8">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FACC15]">Booking details</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Detail label="Service" value={serviceTitle} />
              <Detail label="Deposit" value="$20 paid through Square" />
              <Detail label="Customer" value={booking.fullName} />
              <Detail label="Contact" value={`${booking.email} / ${booking.phone}`} />
              <Detail label="Appointment" value={`${booking.preferredDate} at ${booking.preferredTime}`} />
              <Detail label="Location" value={`${booking.address}, ${booking.city}`} />
              <Detail label="Vehicle" value={`${booking.vehicleSize} ${booking.vehicleType}`} />
              <Detail label="Overnight drop-off" value={booking.overnightDropoff ? "Requested" : "No"} />
            </div>

            <div className="mt-6 border border-[#FACC15]/40 bg-[#FACC15]/10 p-4 text-sm leading-6 text-zinc-100">
              Deposit policy: the $20 deposit applies toward your final service total. Cancellations made less than 24
              hours before the appointment or no-shows forfeit the deposit.
            </div>

            <div className="mt-6">
              <CalendarButtons booking={booking} serviceTitle={serviceTitle} addOnLabels={addOnLabels} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function MissingSession() {
  return (
    <section className="bg-[#050505] px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl border border-[#6D28D9]/60 bg-[#080808] p-8">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#FACC15]">Confirmation unavailable</p>
        <h1 className="mt-4 text-3xl font-black uppercase text-white">We could not load that deposit confirmation.</h1>
        <p className="mt-4 text-base leading-7 text-zinc-300">
          If your card was charged, contact Krick&apos;s with the name and email used at booking so the payment can be
          verified.
        </p>
        <Link
          href="/booking"
          className="mt-6 inline-flex skew-x-[-10deg] bg-[#FACC15] px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-black"
        >
          <span className="skew-x-[10deg]">Back to Booking</span>
        </Link>
      </div>
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-white/10 bg-white/[0.04] p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FACC15]">{label}</p>
      <p className="mt-2 text-base font-bold text-white">{value || "Not provided"}</p>
    </div>
  );
}
