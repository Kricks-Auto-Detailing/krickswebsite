import type { Metadata } from "next";
import { BookingForm } from "@/components/BookingForm";
import { SectionHeader } from "@/components/SectionHeader";
import { ServiceAreaMap } from "@/components/ServiceAreaMap";
import { contact } from "@/lib/contact";
import { getSquareCatalogForUi } from "@/lib/square/catalog";

export const metadata: Metadata = {
  title: "Book Now",
  description: "Request a mobile detailing appointment with Krick's Auto Detailing.",
};

type BookingPageProps = {
  searchParams: Promise<{ service?: string; deposit?: string }>;
};

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = await searchParams;
  const catalog = await getSquareCatalogForUi();

  return (
    <>
      <section className="bg-[radial-gradient(circle_at_80%_25%,rgba(109,40,217,0.38),transparent_32%),linear-gradient(135deg,#050505,#140726,#050505)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Booking request"
            title="Get Krick's on the schedule."
            text="Submit your vehicle, service, location, and preferred time, then pay the required $20 deposit through Square Checkout. Appointments cannot start after 8:00 PM."
          />
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.58fr]">
          {params.deposit === "cancelled" ? (
            <div className="lg:col-span-2 border border-[#FACC15]/50 bg-[#FACC15]/10 p-4 text-sm font-bold text-zinc-100">
              Deposit checkout was cancelled. Your appointment is not reserved until the $20 deposit is paid.
            </div>
          ) : null}
          <BookingForm initialServiceId={params.service} serviceOptions={catalog.services} addOnOptions={catalog.addOns} />
          <aside className="grid content-start gap-5">
            <div className="border border-[#6D28D9]/50 bg-[#080808] p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FACC15]">Booking rules</p>
              <ul className="mt-5 grid gap-3 text-sm leading-6 text-zinc-300">
                <li>A $20 deposit is required to reserve the appointment.</li>
                <li>The deposit applies toward the final service total.</li>
                <li>Appointments run from 9:00 AM - 9:00 PM.</li>
                <li>No appointment start times after 8:00 PM.</li>
                <li>Late cancellations or no-shows forfeit the deposit.</li>
                <li>Locations over 30 minutes from Decatur, Indiana require a $20 travel fee.</li>
                <li>Overnight drop-offs are allowed if communicated beforehand.</li>
              </ul>
            </div>
            <div className="border border-white/10 bg-white/[0.04] p-6">
              <p className="text-xl font-black uppercase text-white">Deposit confirmation</p>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                After the Square deposit is paid, your request is recorded and Krick&apos;s will confirm the appointment
                details with you.
              </p>
            </div>
            <div className="border border-[#FACC15]/40 bg-[#FACC15]/10 p-6">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FACC15]">Need help booking?</p>
              <a className="mt-3 block text-2xl font-black uppercase text-white transition hover:text-[#FACC15]" href={contact.primaryPhone.href}>
                Call {contact.primaryPhone.label}
              </a>
              <a className="mt-2 block text-base font-black uppercase tracking-[0.12em] text-zinc-200 transition hover:text-[#FACC15]" href={contact.secondaryPhone.sms}>
                Text {contact.secondaryPhone.label}
              </a>
              <p className="mt-3 text-sm leading-6 text-zinc-300">
                Use this number for questions about vehicle condition, access, location, or which detail to choose.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-black px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ServiceAreaMap />
        </div>
      </section>
    </>
  );
}
