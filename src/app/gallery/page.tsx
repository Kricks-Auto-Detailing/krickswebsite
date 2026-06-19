import type { Metadata } from "next";
import Link from "next/link";
import { BeforeAfterGallery } from "@/components/BeforeAfterGallery";
import { CTASection } from "@/components/CTASection";
import { GalleryGrid } from "@/components/GalleryGrid";
import { SectionHeader } from "@/components/SectionHeader";
import { getPublicBeforeAfterPairs, getPublicGalleryCategories, getPublicGalleryItems } from "@/lib/gallery-store";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Before and After Auto Detailing Gallery",
  description:
    "See Krick's Auto Detailing before and after results for mobile detailing near Decatur, IN, including semis, powersport vehicles, cars, trucks, SUVs, trailers, and haulers.",
  alternates: {
    canonical: absoluteUrl("/gallery"),
  },
  openGraph: {
    title: "Before and After Auto Detailing Gallery",
    description: "Real Krick's Auto Detailing results for Decatur-area mobile detailing customers.",
    url: absoluteUrl("/gallery"),
  },
};

export default async function GalleryPage() {
  const [beforeAfterPairs, visibleGalleryCategories, galleryItems] = await Promise.all([
    getPublicBeforeAfterPairs(),
    getPublicGalleryCategories(),
    getPublicGalleryItems(),
  ]);
  const featuredPairs = beforeAfterPairs.filter((pair) => pair.beforeSrc && pair.afterSrc).slice(0, 6);

  return (
    <>
      <section className="bg-[radial-gradient(circle_at_75%_20%,rgba(109,40,217,0.35),transparent_30%),linear-gradient(135deg,#050505,#130722,#050505)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Gallery"
            title="Built for before, after, and everything between."
            text="Real result photography is organized by category so customers can see the type of cleanup Krick's brings to cars, rigs, trailers, and powersport vehicles."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            {visibleGalleryCategories.map((category) => (
              <Link key={category.slug} href={`/gallery/${category.slug}`} className="border border-[#6D28D9]/50 bg-[#6D28D9]/15 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:border-[#FACC15] hover:text-[#FACC15]">
                {category.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Categories" title="Pick the vehicle type." text="Browse before-and-after results by category so you can find vehicles similar to yours." />
          <div className="mt-10">
            <GalleryGrid items={galleryItems} />
          </div>
        </div>
      </section>

      <section className="bg-black px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader eyebrow="Before / after" title="Latest real transformations." text="Current powersport and semi cab transformations show the cleanup standard customers can expect." />
          <div className="mt-10">
            <BeforeAfterGallery pairs={featuredPairs} />
          </div>
        </div>
      </section>

      <CTASection title="Ready to see what Krick's can do?" text="Book the detail, choose the service that fits your vehicle, and Krick's will confirm the appointment details." />
    </>
  );
}
