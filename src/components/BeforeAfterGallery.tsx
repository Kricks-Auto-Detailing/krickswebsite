"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { GalleryPair } from "@/lib/services";

type BeforeAfterGalleryProps = {
  pairs: readonly (GalleryPair & { category?: string })[];
  columns?: "two" | "three";
};

export function BeforeAfterGallery({ pairs, columns = "three" }: BeforeAfterGalleryProps) {
  const gridClass = columns === "two" ? "lg:grid-cols-2" : "lg:grid-cols-3";
  const galleryImages = useMemo(
    () =>
      pairs.flatMap((pair) => {
        const images: { src: string; alt: string; title: string; label: string }[] = [];

        if (pair.beforeSrc) {
          images.push({
            src: pair.beforeSrc,
            alt: pair.beforeAlt ?? `${pair.title} before detail`,
            title: pair.title,
            label: "Before",
          });
        }

        if (pair.afterSrc) {
          images.push({
            src: pair.afterSrc,
            alt: pair.afterAlt ?? `${pair.title} after detail`,
            title: pair.title,
            label: "After",
          });
        }

        return images;
      }),
    [pairs],
  );
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const activeImage = activeIndex === null ? null : galleryImages[activeIndex];

  function openImage(src: string) {
    const index = galleryImages.findIndex((image) => image.src === src);
    setActiveIndex(index >= 0 ? index : null);
  }

  const showPrevious = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return current === 0 ? galleryImages.length - 1 : current - 1;
    });
  }, [galleryImages.length]);

  const showNext = useCallback(() => {
    setActiveIndex((current) => {
      if (current === null) return current;
      return current === galleryImages.length - 1 ? 0 : current + 1;
    });
  }, [galleryImages.length]);

  useEffect(() => {
    if (activeIndex === null) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setActiveIndex(null);
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, showNext, showPrevious]);

  return (
    <>
      <div className={`grid gap-5 ${gridClass}`}>
        {pairs.map((pair) => (
          <article key={`${pair.category ?? "gallery"}-${pair.title}`} className="overflow-hidden border border-[#6D28D9]/50 bg-[#080808] shadow-[0_0_34px_rgba(109,40,217,0.16)] transition hover:border-[#FACC15]/70">
            <div className="grid grid-cols-2">
              <BeforeAfterPane
                src={pair.beforeSrc}
                alt={pair.beforeAlt ?? `${pair.title} before detail`}
                label="Before"
                detail={pair.beforeLabel}
                tone={pair.tone}
                side="before"
                title={pair.title}
                onOpen={openImage}
              />
              <BeforeAfterPane
                src={pair.afterSrc}
                alt={pair.afterAlt ?? `${pair.title} after detail`}
                label="After"
                detail={pair.afterLabel}
                tone={pair.tone}
                side="after"
                title={pair.title}
                onOpen={openImage}
              />
            </div>
            <div className="p-5">
              {pair.category ? <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FACC15]">{pair.category}</p> : null}
              <h2 className="mt-2 text-xl font-black uppercase text-white">{pair.title}</h2>
            </div>
          </article>
        ))}
      </div>

      {activeImage ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeImage.title} ${activeImage.label}`}
          onClick={() => setActiveIndex(null)}
          onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
          onTouchEnd={(event) => {
            if (touchStartX === null) return;
            const endX = event.changedTouches[0]?.clientX ?? touchStartX;
            const deltaX = endX - touchStartX;

            if (Math.abs(deltaX) > 48) {
              if (deltaX > 0) showPrevious();
              else showNext();
            }

            setTouchStartX(null);
          }}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setActiveIndex(null);
            }}
            className="absolute right-4 top-4 z-10 grid size-11 place-items-center border border-white/15 bg-black text-white transition hover:border-[#FACC15] hover:text-[#FACC15]"
            aria-label="Close image preview"
          >
            <span className="text-lg font-black" aria-hidden="true">X</span>
          </button>

          {galleryImages.length > 1 ? (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showPrevious();
                }}
                className="absolute left-4 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center border border-white/15 bg-black/80 text-2xl font-black text-white transition hover:border-[#FACC15] hover:text-[#FACC15]"
                aria-label="Previous image"
              >
                <span aria-hidden="true">&lt;</span>
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  showNext();
                }}
                className="absolute right-4 top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center border border-white/15 bg-black/80 text-2xl font-black text-white transition hover:border-[#FACC15] hover:text-[#FACC15]"
                aria-label="Next image"
              >
                <span aria-hidden="true">&gt;</span>
              </button>
            </>
          ) : null}

          <div className="relative h-[82vh] w-full max-w-6xl border border-[#6D28D9]/60 bg-[#050505] shadow-[0_0_60px_rgba(109,40,217,0.32)]" onClick={(event) => event.stopPropagation()}>
            <Image src={activeImage.src} alt={activeImage.alt} fill sizes="100vw" className="object-contain" />
          </div>
          <div className="mt-4 max-w-6xl text-center" onClick={(event) => event.stopPropagation()}>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FACC15]">{activeImage.label}</p>
            <p className="mt-1 text-xl font-black uppercase text-white">{activeImage.title}</p>
            {galleryImages.length > 1 ? (
              <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-zinc-400">
                {activeIndex === null ? 0 : activeIndex + 1} / {galleryImages.length}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

function BeforeAfterPane({
  src,
  alt,
  label,
  detail,
  tone,
  side,
  title,
  onOpen,
}: {
  src?: string;
  alt: string;
  label: string;
  detail: string;
  tone: string;
  side: "before" | "after";
  title: string;
  onOpen: (src: string) => void;
}) {
  const content = (
    <>
      {src ? (
        <Image src={src} alt={alt} fill sizes="(min-width: 1024px) 16vw, 50vw" className="object-cover transition duration-500 group-hover:scale-105" />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${tone}`}>
          <div className="absolute inset-0 opacity-40 bg-[linear-gradient(135deg,transparent_0_42%,rgba(250,204,21,0.22)_42%_46%,transparent_46%_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(109,40,217,0.4),transparent_34%)]" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      <span className={`absolute top-3 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] ${side === "before" ? "left-3 bg-black text-zinc-200" : "right-3 bg-[#FACC15] text-black"}`}>
        {label}
      </span>
      <p className="absolute bottom-3 left-3 right-3 text-sm font-black uppercase tracking-[0.1em] text-white">{detail}</p>
    </>
  );

  return (
    <div className={`relative aspect-[4/5] overflow-hidden ${side === "before" ? "border-r border-[#FACC15]/70" : ""}`}>
      {src ? (
        <button type="button" onClick={() => onOpen(src)} className="group absolute inset-0 cursor-zoom-in text-left" aria-label={`Open ${label.toLowerCase()} image for ${title}`}>
          {content}
        </button>
      ) : (
        content
      )}
    </div>
  );
}
