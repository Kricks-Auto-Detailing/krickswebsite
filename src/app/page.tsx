import { CTASection } from "@/components/CTASection";
import { GalleryGrid } from "@/components/GalleryGrid";
import { HeroSection } from "@/components/HeroSection";
import Image from "next/image";
import { PolicyStrip } from "@/components/PolicyStrip";
import { SectionHeader } from "@/components/SectionHeader";
import { ServiceAreaMap } from "@/components/ServiceAreaMap";
import { ServiceCard } from "@/components/ServiceCard";
import { TestimonialCards } from "@/components/TestimonialCards";
import { ButtonLink } from "@/components/ButtonLink";
import { getPublicGalleryItems } from "@/lib/gallery-store";
import { getSquareCatalogForUi } from "@/lib/square/catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [catalog, galleryItems] = await Promise.all([getSquareCatalogForUi(), getPublicGalleryItems()]);
  const featuredServices = catalog.services.filter((service) => service.featured).slice(0, 3);
  const previewServices = featuredServices.length ? featuredServices : catalog.services.slice(0, 3);

  return (
    <>
      <HeroSection />
      <PolicyStrip />

      <section className="bg-[#050505] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Featured services"
            title="Detail packages built for real vehicles."
            text="From quick maintenance washes to deeper interior resets, each package is structured for mobile service with premium finish standards."
          />
          <div className="mt-7 grid gap-4 sm:mt-10 lg:grid-cols-3 lg:gap-5">
            {previewServices.map((service) => (
              <ServiceCard key={service.id} service={service} compact />
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-black">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:px-8 lg:py-20">
          <div className="relative min-h-[320px] overflow-hidden border border-[#6D28D9]/50 bg-[#080808] shadow-[0_0_50px_rgba(109,40,217,0.18)] sm:min-h-[420px]">
            <div className="absolute inset-y-0 left-0 w-1/2">
              <Image src="/gallery/semi-cab-entry-before.jpg" alt="Dirty semi cab before detail" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="absolute inset-y-0 right-0 w-1/2">
              <Image src="/gallery/semi-cab-entry-after.jpg" alt="Clean semi cab after detail" fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
            <div className="absolute left-4 top-4 bg-black px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-300 sm:left-6 sm:top-6 sm:px-4 sm:text-xs sm:tracking-[0.22em]">Before</div>
            <div className="absolute right-4 top-4 bg-[#FACC15] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-black sm:right-6 sm:top-6 sm:px-4 sm:text-xs sm:tracking-[0.22em]">After</div>
            <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-[#FACC15]" />
            <div className="absolute bottom-4 left-4 right-4 border border-white/10 bg-black/80 p-3 backdrop-blur-sm sm:bottom-6 sm:left-6 sm:right-6 sm:p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#FACC15] sm:text-xs sm:tracking-[0.18em]">Semi cab transformation</p>
              <h2 className="mt-2 text-lg font-black uppercase leading-tight text-white sm:text-2xl">Road grime out. Work cab reset.</h2>
            </div>
          </div>
          <div className="self-center">
            <SectionHeader
              eyebrow="Before / after energy"
              title="From road film and cabin grime to a hard-gloss finish."
              text="Real project photography shows the difference: dirty touch zones, tracked-in grime, and work cab buildup turned into a cleaner, sharper finish."
            />
            <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4">
              {["Foam wash exterior gloss", "Sanitized touch surfaces", "Wheel and tire detail", "Leather and vinyl protection"].map((item) => (
                <div key={item} className="border border-[#6D28D9]/40 bg-white/[0.04] p-3 text-xs font-black uppercase leading-5 tracking-[0.1em] text-white sm:p-5 sm:text-sm sm:tracking-[0.12em]">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Why Krick's"
            title="Mobile, direct, and built around the finish."
            text="Professional detailing without shop-floor friction: clear pricing, mobile convenience, and service options for daily drivers, trucks, rigs, haulers, trailers, and utility vehicles."
          />
          <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 md:grid-cols-4">
            {[
              ["Mobile service", "We come to you in the Decatur-area radius."],
              ["Clear policies", "Deposit, hours, travel fees, and cancellation terms are visible before booking."],
              ["Premium look", "Purple glow, yellow highlights, black-panel performance style."],
              ["Flexible vehicles", "Cars, SUVs, semis, trailers, carts, ATVs, and UTVs."],
            ].map(([title, text]) => (
              <div key={title} className="border border-white/10 bg-white/[0.04] p-4 sm:p-6">
                <p className="text-base font-black uppercase leading-tight text-white sm:text-xl">{title}</p>
                <p className="mt-2 text-xs leading-5 text-zinc-400 sm:mt-3 sm:text-sm sm:leading-6">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-black px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <SectionHeader eyebrow="Gallery preview" title="Real results by vehicle type." />
            <ButtonLink href="/gallery" variant="secondary">View Gallery</ButtonLink>
          </div>
          <div className="mt-7 sm:mt-10">
            <GalleryGrid items={galleryItems} limit={4} />
          </div>
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Customer confidence" title="What to expect from the first message." text="Straightforward booking, clear mobile-service policies, and detail packages built around the way the vehicle is actually used." />
          <div className="mt-7 sm:mt-10">
            <TestimonialCards />
          </div>
        </div>
      </section>

      <section className="bg-black px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <ServiceAreaMap />
        </div>
      </section>

      <CTASection />
    </>
  );
}
