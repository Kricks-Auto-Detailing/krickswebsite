import { ButtonLink } from "./ButtonLink";
import { contact } from "@/lib/contact";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(109,40,217,0.45),transparent_28%),linear-gradient(135deg,#050505_0%,#160a2f_42%,#050505_82%)]" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(135deg,transparent_0_46%,#FACC15_46%_47%,transparent_47%_100%)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[1fr_0.86fr] lg:px-8">
        <div>
          <p className="mb-4 inline-flex border border-[#6D28D9] bg-[#6D28D9]/20 px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#FACC15] sm:px-4 sm:text-xs sm:tracking-[0.24em]">
            Mobile detailing / Decatur, Indiana
          </p>
          <h1 className="max-w-4xl text-4xl font-black uppercase leading-[0.94] text-white sm:text-7xl lg:text-8xl">
            Showroom bite. Mobile speed.
          </h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-zinc-200 sm:mt-6 sm:text-xl sm:leading-8">
            Krick&apos;s Auto Detailing brings aggressive, premium auto detailing to your driveway across Decatur and
            surrounding areas within 30 minutes. We come to you.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <ButtonLink href="/booking">Book Now</ButtonLink>
            <ButtonLink href="/services" variant="secondary">View Services</ButtonLink>
            <a
              href={contact.primaryPhone.href}
              className="inline-flex min-h-11 items-center justify-center border border-white/15 bg-white/5 px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-white transition hover:border-[#FACC15] hover:text-[#FACC15] sm:min-h-12 sm:px-6 sm:text-sm sm:tracking-[0.16em]"
            >
              Call {contact.primaryPhone.label}
            </a>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2 sm:mt-10 sm:gap-3">
            {["Interior resets", "Foam wash gloss", "Fleet and trailers"].map((item) => (
              <div key={item} className="border border-white/10 bg-white/[0.04] p-3 sm:p-4">
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white sm:text-sm sm:tracking-[0.12em]">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative min-h-[390px] overflow-hidden border border-[#6D28D9]/50 bg-black shadow-[0_0_70px_rgba(109,40,217,0.25)] sm:min-h-[420px]">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(109,40,217,0.22),transparent_36%),radial-gradient(circle_at_45%_55%,rgba(250,204,21,0.2),transparent_20%)]" />
          <div className="absolute inset-0 opacity-30 bg-[linear-gradient(135deg,transparent_0_44%,#6D28D9_44%_50%,transparent_50%_100%)]" />
          <div className="absolute left-5 top-5 border border-[#FACC15]/50 bg-[#FACC15] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-black sm:left-8 sm:top-8 sm:px-4 sm:text-xs sm:tracking-[0.2em]">
            We come to you
          </div>

          <div className="absolute left-5 right-5 top-20 border border-white/10 bg-[#080808]/90 p-4 shadow-2xl backdrop-blur sm:left-8 sm:right-8 sm:top-24 sm:p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FACC15] sm:text-xs sm:tracking-[0.22em]">Mobile detailing</p>
            <h2 className="mt-2 text-3xl font-black uppercase leading-none text-white sm:mt-3 sm:text-5xl">
              Decatur, IN
            </h2>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-zinc-300 sm:text-sm sm:tracking-[0.14em]">
              30-minute service radius
            </p>
          </div>

          <div className="absolute bottom-24 left-7 right-2 grid skew-x-[-12deg] grid-cols-3 overflow-hidden border border-[#6D28D9]/60 bg-[#6D28D9] shadow-[0_0_45px_rgba(109,40,217,0.55)] sm:bottom-28 sm:left-10 sm:right-4">
            {[
              ["9AM-9PM", "Hours"],
              ["$20", "Deposit"],
              ["8PM", "Last start"],
            ].map(([value, label]) => (
              <div key={label} className="min-h-16 border-r border-black/30 bg-[#6D28D9] p-3 last:border-r-0 sm:min-h-20 sm:p-4">
                <div className="skew-x-[12deg]">
                  <p className="text-lg font-black uppercase leading-none text-white sm:text-2xl">{value}</p>
                  <p className="mt-2 text-[9px] font-black uppercase tracking-[0.15em] text-[#FACC15] sm:text-[10px] sm:tracking-[0.18em]">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-5 left-5 right-5 border border-white/10 bg-black/80 p-4 backdrop-blur sm:bottom-8 sm:left-8 sm:right-8 sm:p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FACC15] sm:text-xs sm:tracking-[0.2em]">Signature finish</p>
            <p className="mt-2 text-lg font-black uppercase leading-tight text-white sm:text-2xl">Interior, exterior, specialty rigs</p>
          </div>
        </div>
      </div>
    </section>
  );
}
