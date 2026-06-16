import Link from "next/link";
import { contact } from "@/lib/contact";

type MobileMenuProps = {
  open: boolean;
  links: Array<{ href: string; label: string }>;
  onNavigate: () => void;
};

export function MobileMenu({ open, links, onNavigate }: MobileMenuProps) {
  if (!open) return null;

  return (
    <nav className="border-t border-white/10 bg-[#050505] px-4 py-5 md:hidden" aria-label="Mobile navigation">
      <div className="grid gap-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className="border border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-[#FACC15] hover:text-[#FACC15]"
          >
            {link.label}
          </Link>
        ))}
        <a
          href={contact.primaryPhone.href}
          className="border border-[#FACC15]/50 bg-[#FACC15]/10 px-4 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-[#FACC15] hover:text-[#FACC15]"
        >
          Call {contact.primaryPhone.label}
        </a>
        <a
          href={contact.secondaryPhone.sms}
          className="border border-white/10 bg-white/[0.03] px-4 py-4 text-sm font-black uppercase tracking-[0.18em] text-white transition hover:border-[#FACC15] hover:text-[#FACC15]"
        >
          Text {contact.secondaryPhone.label}
        </a>
      </div>
    </nav>
  );
}
