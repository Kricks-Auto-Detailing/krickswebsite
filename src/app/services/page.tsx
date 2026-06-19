import type { Metadata } from "next";
import { CTASection } from "@/components/CTASection";
import { PolicyStrip } from "@/components/PolicyStrip";
import { SectionHeader } from "@/components/SectionHeader";
import { ServiceCard } from "@/components/ServiceCard";
import { policies, serviceCategorySections, type Service } from "@/lib/services";
import { absoluteUrl } from "@/lib/seo";
import { getSquareCatalogForUi } from "@/lib/square/catalog";
import type { SquareAddOn } from "@/lib/square/types";

export const metadata: Metadata = {
  title: "Auto Detailing Services and Pricing in Decatur IN",
  description:
    "View Krick's Auto Detailing mobile service packages and pricing for Decatur, IN: maintenance details, signature details, elite details, truck/SUV detailing, semi cab detailing, trailer detailing, and add-ons.",
  alternates: {
    canonical: absoluteUrl("/services"),
  },
  openGraph: {
    title: "Auto Detailing Services and Pricing in Decatur IN",
    description: "Mobile detailing packages and pricing for cars, trucks, SUVs, semis, trailers, and powersport vehicles near Decatur, Indiana.",
    url: absoluteUrl("/services"),
  },
};

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const catalog = await getSquareCatalogForUi();

  return (
    <>
      <section className="bg-[radial-gradient(circle_at_75%_20%,rgba(109,40,217,0.35),transparent_30%),linear-gradient(135deg,#050505,#130722,#050505)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Services and pricing"
            title="Choose the package that fits the vehicle."
            text="Every service card includes clear pricing, included work, and a booking button that carries your service choice into the form."
          />
        </div>
      </section>

      <PolicyStrip />

      <section className="bg-[#050505] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-12">
          {serviceCategorySections.map((section) => {
            const sectionServices = getSectionServices(catalog, section.id);
            if (!sectionServices.length) return null;

            return (
              <div key={section.id} id={section.id} className="scroll-mt-28">
                <SectionHeader eyebrow="Service category" title={section.title} text={section.description} />
                <div className="mt-8 grid gap-5 lg:grid-cols-2">
                  {sectionServices.map((service) => {
                    const displayOnlyAddOn = service.id.startsWith("addon-card-");

                    return (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        buttonHref={displayOnlyAddOn ? "/booking" : undefined}
                        buttonLabel={displayOnlyAddOn ? "Add During Booking" : undefined}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Policies" title="Clear expectations before the detail starts." />
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {policies.map((policy) => (
              <div key={policy.label} className="border border-white/10 bg-white/[0.04] p-6">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FACC15]">{policy.label}</p>
                <p className="mt-3 text-xl font-black uppercase text-white">{policy.value}</p>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{policy.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection title="Know the package? Lock in your request." text="Pick a service, add notes, and Krick's will confirm your mobile detailing appointment." />
    </>
  );
}

type Catalog = Awaited<ReturnType<typeof getSquareCatalogForUi>>;

function getSectionServices(catalog: Catalog, sectionId: Service["category"]) {
  const services = catalog.services.filter((service) => service.category === sectionId);
  if (sectionId !== "addons") return services;

  const existingTitles = new Set(services.map((service) => service.title));
  const addOnCards = buildAddOnDisplayCards(catalog.addOns).filter((service) => !existingTitles.has(service.title));

  return [...services, ...addOnCards];
}

function buildAddOnDisplayCards(addOns: SquareAddOn[]): Service[] {
  return addOns
    .map((addOn) => {
      const templates: Record<string, Omit<Service, "id" | "pricing">> = {
        "Pet hair removal": {
          title: "Pet Hair Removal",
          category: "addons",
          eyebrow: "Interior hair removal",
          description: "Optional upgrade for vehicles with pet hair embedded in seats, carpet, mats, and cargo areas.",
          includes: [
            "Pet hair targeted removal",
            "Seats, carpet, and floor mats addressed",
            "Cargo area attention",
            "Recommended with a main detail package",
          ],
        },
        "Exterior plastic restore": {
          title: "Exterior Plastic Restore",
          category: "addons",
          eyebrow: "Trim refresh upgrade",
          description: "Optional exterior upgrade for faded plastic trim that needs a cleaner, darker finish.",
          includes: [
            "Exterior plastic trim treatment",
            "Faded trim appearance improved",
            "High-impact exterior areas addressed",
            "Recommended with a main detail package",
          ],
        },
        "Smoke Removal": {
          title: "Smoke Removal",
          category: "addons",
          eyebrow: "Odor treatment upgrade",
          description: "Optional odor treatment upgrade for vehicles that need extra attention after smoke exposure.",
          includes: [
            "Odor treatment service",
            "Interior assessment",
            "High-touch surface attention",
            "Recommended with a main detail package",
          ],
        },
      };
      const template = templates[addOn.label];
      if (!template) return null;

      return {
        ...template,
        id: `addon-card-${addOn.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
        pricing: [{ label: "Add-on", price: addOn.price }],
      };
    })
    .filter((service): service is Service => Boolean(service));
}
