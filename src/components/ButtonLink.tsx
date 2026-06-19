import Link from "next/link";
import type { ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
};

export function ButtonLink({ href, children, variant = "primary", className = "" }: ButtonLinkProps) {
  const styles = {
    primary:
      "bg-[#FACC15] text-black shadow-[0_0_24px_rgba(109,40,217,0.45)] hover:bg-white hover:shadow-[0_0_34px_rgba(250,204,21,0.35)]",
    secondary:
      "border border-[#6D28D9] bg-[#6D28D9]/15 text-white hover:border-[#FACC15] hover:bg-[#FACC15] hover:text-black",
    ghost: "border border-white/15 bg-white/5 text-white hover:border-[#FACC15] hover:text-[#FACC15]",
  };

  return (
    <Link
      href={href}
      className={`group inline-flex min-h-11 items-center justify-center gap-2 skew-x-[-10deg] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] transition duration-300 sm:min-h-12 sm:px-6 sm:text-sm sm:tracking-[0.16em] ${styles[variant]} ${className}`}
    >
      <span className="skew-x-[10deg]">{children}</span>
    </Link>
  );
}
