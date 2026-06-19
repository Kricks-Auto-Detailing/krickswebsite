import { ButtonLink } from "./ButtonLink";

type CTASectionProps = {
  title?: string;
  text?: string;
};

export function CTASection({
  title = "Ready for a sharper, cleaner ride?",
  text = "Book mobile detailing in Decatur, Indiana and surrounding areas within 30 minutes.",
}: CTASectionProps) {
  return (
    <section className="relative overflow-hidden bg-[#050505] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(109,40,217,0.24),transparent_45%,rgba(250,204,21,0.08))]" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-[#FACC15]/40" />
      <div className="relative mx-auto max-w-5xl border border-[#6D28D9]/50 bg-black/80 p-5 text-center shadow-[0_0_60px_rgba(109,40,217,0.2)] sm:p-12">
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#FACC15] sm:text-xs sm:tracking-[0.28em]">Mobile detailing</p>
        <h2 className="mt-3 text-2xl font-black uppercase leading-tight text-white sm:mt-4 sm:text-5xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-zinc-300 sm:mt-5 sm:text-base sm:leading-8">{text}</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:mt-8 sm:flex-row">
          <ButtonLink href="/booking">Book Now</ButtonLink>
          <ButtonLink href="/services" variant="secondary">View Services</ButtonLink>
        </div>
      </div>
    </section>
  );
}
