import Image from "next/image";
import Link from "next/link";
import type { getPublicGalleryItems } from "@/lib/gallery-store";

type GalleryGridProps = {
  limit?: number;
  items: Awaited<ReturnType<typeof getPublicGalleryItems>>;
};

export function GalleryGrid({ limit, items }: GalleryGridProps) {
  const visibleItems = typeof limit === "number" ? items.slice(0, limit) : items;

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {visibleItems.map((item) => (
        <Link key={`${item.category}-${item.title}`} href={item.href} className="group overflow-hidden border border-white/10 bg-[#080808] transition hover:border-[#FACC15]/70 hover:shadow-[0_0_34px_rgba(109,40,217,0.28)]">
          <div className={`relative aspect-[4/3] bg-gradient-to-br ${item.tone}`}>
            {item.imageSrc ? (
              <Image
                src={item.imageSrc}
                alt={item.alt ?? item.title}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
            <div className="absolute inset-0 opacity-40 bg-[linear-gradient(135deg,transparent_0_40%,rgba(250,204,21,0.22)_40%_44%,transparent_44%_100%)]" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 sm:p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#FACC15] sm:text-xs sm:tracking-[0.18em]">{item.category}</p>
              <h3 className="mt-1 text-base font-black uppercase leading-tight text-white sm:text-lg">{item.title}</h3>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-zinc-300 transition group-hover:text-[#FACC15] sm:mt-3 sm:text-xs sm:tracking-[0.16em]">Open gallery</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
