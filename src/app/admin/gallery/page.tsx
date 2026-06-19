import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AdminGalleryManager } from "@/components/AdminGalleryManager";
import { SectionHeader } from "@/components/SectionHeader";
import { getAdminCookieName, isValidAdminSession } from "@/lib/admin-auth";
import { getUploadedGalleryItems } from "@/lib/gallery-store";
import { galleryCategoryOptions } from "@/lib/services";
import { getSquarePricingCatalog } from "@/lib/square/pricing";

export const metadata: Metadata = {
  title: "Gallery Admin",
  description: "Owner-only gallery upload area for Krick's Auto Detailing.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminGalleryPage() {
  const cookieStore = await cookies();
  const initialAuthenticated = isValidAdminSession(cookieStore.get(getAdminCookieName())?.value);
  const initialItems = initialAuthenticated ? await getUploadedGalleryItems({ includeDrafts: true }) : [];
  const initialPricingCatalog = initialAuthenticated ? await getInitialPricingCatalog() : null;

  return (
    <>
      <section className="bg-[radial-gradient(circle_at_75%_20%,rgba(109,40,217,0.35),transparent_30%),linear-gradient(135deg,#050505,#130722,#050505)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Owner tools"
            title="Gallery upload manager."
            text="Upload before and after photos, assign them to the right category, and publish them directly into the customer-facing gallery."
          />
        </div>
      </section>

      <section className="bg-[#050505] px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <AdminGalleryManager
            categories={galleryCategoryOptions}
            initialAuthenticated={initialAuthenticated}
            initialItems={initialItems}
            initialPricingCatalog={initialPricingCatalog}
          />
        </div>
      </section>
    </>
  );
}

async function getInitialPricingCatalog() {
  try {
    return await getSquarePricingCatalog();
  } catch {
    return null;
  }
}
