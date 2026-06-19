import type { Metadata } from "next";
import { CTASection } from "@/components/CTASection";
import { PolicyStrip } from "@/components/PolicyStrip";
import { SectionHeader } from "@/components/SectionHeader";
import { ServiceAreaMap } from "@/components/ServiceAreaMap";
import { ServiceCard } from "@/components/ServiceCard";
import { ButtonLink } from "@/components/ButtonLink";
import { absoluteUrl, faqJsonLd, jsonLdScript, serviceAreaText } from "@/lib/seo";
import { getSquareCatalogForUi } from "@/lib/square/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Car Detailers Near Decatur IN",
  description:
    "Looking for car detailers near Decatur, IN? Krick's Auto Detailing provides mobile car, truck, SUV, semi cab, trailer, and powersport detailing within roughly 30 minutes of Decatur.",
  alternates: {
    canonical: absoluteUrl("/mobile-car-detailing-decatur-in"),
  },
  openGraph: {
    title: "Car Detailers Near Decatur IN",
    description: "Mobile auto detailing in Decatur, Indiana and surrounding communities within roughly 30 minutes.",
    url: absoluteUrl("/mobile-car-detailing-decatur-in"),
  },
};

export default async function MobileCarDetailingDecaturPage() {
  const catalog = await getSquareCatalogForUi();
  const featuredServices = catalog.services.filter((service) => service.featured).slice(0, 3);
  const services = featuredServices.length ? featuredServices : catalog.services.slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": absoluteUrl("/mobile-car-detailing-decatur-in#service"),
    name: "Mobile car detailing near Decatur, IN",
    serviceType: "Mobile auto detailing",
    provider: {
      "@id": absoluteUrl("/#localbusiness"),
    },
    areaServed: serviceAreaText(),
    description:
      "Mobile car detailing, truck and SUV detailing, semi cab detailing, trailer detailing, and powersport detailing near Decatur, Indiana.",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript([jsonLd, faqJsonLd()]),
        }}
      />
      <section className="bg-[radial-gradient(circle_at_75%_20%,rgba(109,40,217,0.35),transparent_30%),linear-gradient(135deg,#050505,#130722,#050505)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Car detailers near Decatur IN"
            title="Mobile auto detailing that comes to you."
            text="Krick's Auto Detailing serves Decatur, Indiana and nearby communities with mobile detailing for cars, trucks, SUVs, semis, powersport vehicles, trailers, and haulers."
          />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/booking">Book Mobile Detailing</ButtonLink>
            <ButtonLink href="/services" variant="secondary">View Pricing</ButtonLink>
          </div>
        </div>
      </section>

      <PolicyStrip />

      <section className="bg-[#050505] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1fr]">
          <div>
            <SectionHeader
              eyebrow="Decatur-area mobile detailing"
              title="A local detailer for daily drivers and working vehicles."
              text={`Customers searching for auto detailing near Decatur can request mobile service in ${serviceAreaText()}. Locations beyond the 30-minute radius can still be requested with a $20 travel fee.`}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Interior detailing", "Vacuuming, wipe downs, seats, vents, cupholders, windows, and disinfecting non-fabric surfaces."],
              ["Exterior refresh", "Hand wash, foam wash, spray wax, wheels, tires, door jambs, and exterior protection on qualifying packages."],
              ["Specialty vehicles", "Semi cabs, powersport vehicles, trailers, Amish haulers, and other work-use vehicles."],
              ["Simple booking", "$20 Square deposit, clear policies, and no appointment start times after 8:00 PM."],
            ].map(([title, text]) => (
              <article key={title} className="border border-white/10 bg-white/[0.04] p-5">
                <h2 className="text-lg font-black uppercase text-white">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Popular packages"
            title="Detailing services near Decatur."
            text="Start with one of the common mobile detailing packages, then add notes during booking so Krick's can confirm the right fit."
          />
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} compact />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ServiceAreaMap />
        </div>
      </section>

      <section className="bg-black px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Local detailing FAQ"
            title="Questions about booking near Decatur."
            text="Quick answers for customers comparing mobile car detailers around Decatur, Indiana."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              [
                "Does Krick's Auto Detailing serve Decatur, Indiana?",
                "Yes. Krick's Auto Detailing is based around Decatur, Indiana and provides mobile detailing within roughly a 30-minute service radius.",
              ],
              [
                "Can Krick's come to my home or workplace?",
                "Yes. Appointments can be requested at homes, workplaces, and other accessible locations in the Decatur-area service radius.",
              ],
              [
                "What vehicles does Krick's detail?",
                "Services cover cars, trucks, SUVs, semi cabs, powersport vehicles, trailers, haulers, and detailing add-ons.",
              ],
            ].map(([question, answer]) => (
              <article key={question} className="border border-white/10 bg-white/[0.04] p-5">
                <h2 className="text-lg font-black uppercase leading-tight text-white">{question}</h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTASection title="Ready to book a Decatur-area detail?" text="Choose the detail package, add vehicle notes, and reserve your appointment with the $20 Square deposit." />
    </>
  );
}
