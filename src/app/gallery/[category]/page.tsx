import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BeforeAfterGallery } from "@/components/BeforeAfterGallery";
import { CTASection } from "@/components/CTASection";
import { SectionHeader } from "@/components/SectionHeader";
import { getPublicGalleryCategories, getPublicGalleryCategory } from "@/lib/gallery-store";

export const dynamic = "force-dynamic";

type GalleryCategoryPageProps = {
  params: Promise<{ category: string }>;
};

export async function generateMetadata({ params }: GalleryCategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getPublicGalleryCategory(slug);

  if (!category) {
    return {
      title: "Gallery",
    };
  }

  return {
    title: `${category.label} Gallery`,
    description: `${category.label} before and after gallery for Krick's Auto Detailing.`,
  };
}

export default async function GalleryCategoryPage({ params }: GalleryCategoryPageProps) {
  const { category: slug } = await params;
  const [category, visibleGalleryCategories] = await Promise.all([
    getPublicGalleryCategory(slug),
    getPublicGalleryCategories(),
  ]);

  if (!category) notFound();

  return (
    <>
      <section className={`bg-[radial-gradient(circle_at_78%_20%,rgba(109,40,217,0.35),transparent_30%)] bg-gradient-to-br ${category.tone} px-4 py-20 sm:px-6 lg:px-8`}>
        <div className="mx-auto max-w-7xl">
          <Link href="/gallery" className="text-xs font-black uppercase tracking-[0.18em] text-[#FACC15] transition hover:text-white">
            Back to gallery
          </Link>
          <div className="mt-8">
            <SectionHeader eyebrow={`${category.label} gallery`} title={`${category.label} before and after.`} text={category.description} />
          </div>
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <BeforeAfterGallery pairs={category.pairs} columns="two" />
        </div>
      </section>

      <section className="bg-black px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-wrap gap-3">
          {visibleGalleryCategories.map((item) => (
            <Link
              key={item.slug}
              href={`/gallery/${item.slug}`}
              className={`border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] transition ${
                item.slug === category.slug
                  ? "border-[#FACC15] bg-[#FACC15] text-black"
                  : "border-[#6D28D9]/50 bg-[#6D28D9]/15 text-white hover:border-[#FACC15] hover:text-[#FACC15]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>

      <CTASection title="Ready to book a detail?" text="Choose the service that fits your vehicle, pay the $20 deposit, and Krick's will confirm the appointment details." />
    </>
  );
}
