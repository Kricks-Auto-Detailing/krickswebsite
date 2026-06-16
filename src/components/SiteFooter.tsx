import Link from "next/link";
import { contact } from "@/lib/contact";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <p className="text-lg font-black uppercase tracking-[0.16em] text-white">Krick&apos;s Auto Detailing</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-zinc-400">
            Mobile auto detailing for Decatur, Indiana and surrounding areas within 30 minutes. Bold finish,
            straightforward policies, and appointment windows built around real schedules.
          </p>
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FACC15]">Contact</p>
          <a className="mt-4 block text-sm text-zinc-300 hover:text-white" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
          <a className="mt-2 block text-sm font-black text-white transition hover:text-[#FACC15]" href={contact.primaryPhone.href}>
            Call: {contact.primaryPhone.label}
          </a>
          <a className="mt-2 block text-sm font-bold text-zinc-300 hover:text-white" href={contact.secondaryPhone.sms}>
            Text: {contact.secondaryPhone.label}
          </a>
          <p className="mt-2 text-sm text-zinc-400">9:00 AM - 9:00 PM</p>
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-[0.18em] text-[#FACC15]">Explore</p>
          <div className="mt-4 grid gap-2 text-sm text-zinc-300">
            <Link href="/services" className="hover:text-white">Services</Link>
            <Link href="/gallery" className="hover:text-white">Gallery</Link>
            <Link href="/booking" className="hover:text-white">Book an appointment</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs uppercase tracking-[0.18em] text-zinc-500">
        Mobile detailing in Decatur, Indiana
      </div>
    </footer>
  );
}
