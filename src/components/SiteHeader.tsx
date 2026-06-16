"use client";

import Link from "next/link";
import { useState } from "react";
import { contact } from "@/lib/contact";
import { MobileMenu } from "./MobileMenu";

const links = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/booking", label: "Booking" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="grid size-11 place-items-center border border-[#6D28D9] bg-[#6D28D9]/15 text-lg font-black text-[#FACC15] shadow-[0_0_24px_rgba(109,40,217,0.4)] transition group-hover:border-[#FACC15]">
            KA
          </span>
          <span className="leading-none">
            <span className="block text-sm font-black uppercase tracking-[0.2em] text-white">Krick&apos;s</span>
            <span className="block text-xs font-bold uppercase tracking-[0.24em] text-[#FACC15]">Auto Detailing</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-black uppercase tracking-[0.18em] text-zinc-300 transition hover:text-[#FACC15]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={contact.primaryPhone.href}
            className="text-xs font-black uppercase tracking-[0.14em] text-zinc-300 transition hover:text-[#FACC15]"
          >
            {contact.primaryPhone.label}
          </a>
          <Link
            href="/booking"
            className="skew-x-[-10deg] bg-[#FACC15] px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-white hover:shadow-[0_0_28px_rgba(109,40,217,0.55)]"
          >
            <span className="block skew-x-[10deg]">Book Now</span>
          </Link>
        </div>

        <button
          type="button"
          className="grid size-11 place-items-center border border-white/15 text-white transition hover:border-[#FACC15] hover:text-[#FACC15] md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="text-2xl leading-none">{open ? "X" : "="}</span>
        </button>
      </div>
      <MobileMenu open={open} links={links} onNavigate={() => setOpen(false)} />
    </header>
  );
}
