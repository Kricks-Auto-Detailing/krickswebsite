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
        <div className="relative overflow-hidden border border-[#6D28D9]/50 bg-black p-5 shadow-[0_0_70px_rgba(109,40,217,0.25)] sm:p-7">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(109,40,217,0.24),transparent_34%),linear-gradient(135deg,transparent_0_42%,rgba(109,40,217,0.42)_42%_49%,transparent_49%_100%)]" />
          <div className="absolute inset-x-0 top-0 h-1 bg-[#FACC15]" />

          <div className="relative grid gap-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="inline-flex bg-[#FACC15] px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-black sm:px-4 sm:tracking-[0.2em]">
                  We come to you
                </p>
                <h2 className="mt-5 text-3xl font-black uppercase leading-none text-white sm:text-5xl">
                  Decatur
                  <span className="block text-[#FACC15]">Mobile Radius</span>
                </h2>
              </div>
              <div className="hidden border border-[#6D28D9]/60 bg-[#080808] px-4 py-3 text-right shadow-[0_0_26px_rgba(109,40,217,0.24)] sm:block">
                <p className="text-2xl font-black uppercase leading-none text-white">30</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#FACC15]">Minutes</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[0.95fr_1.05fr]">
              <div className="relative min-h-48 overflow-hidden border border-white/10 bg-[#080808] p-5">
                <div className="absolute inset-0 opacity-35 bg-[linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:28px_28px]" />
                <div className="absolute left-1/2 top-1/2 size-36 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FACC15]/70" />
                <div className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#6D28D9] bg-[#6D28D9]/20" />
                <div className="absolute left-1/2 top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#FACC15] shadow-[0_0_28px_rgba(250,204,21,0.6)]" />
                <div className="absolute inset-x-5 bottom-5 border border-white/10 bg-black/80 p-3 backdrop-blur">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FACC15]">Home base</p>
                  <p className="mt-1 text-xl font-black uppercase leading-none text-white">Decatur, IN</p>
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  ["9AM-9PM", "Daily service hours"],
                  ["8PM", "Latest appointment start"],
                  ["$20", "Deposit applied to detail"],
                ].map(([value, label]) => (
                  <div key={label} className="group grid grid-cols-[86px_1fr] items-center border border-white/10 bg-[#080808]/90 transition hover:border-[#FACC15]/60">
                    <div className="bg-[#6D28D9] px-4 py-4 text-xl font-black uppercase leading-none text-white shadow-[0_0_26px_rgba(109,40,217,0.3)] transition group-hover:bg-[#FACC15] group-hover:text-black">
                      {value}
                    </div>
                    <p className="px-4 py-3 text-[10px] font-black uppercase leading-5 tracking-[0.16em] text-zinc-200">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-[#6D28D9]/60 bg-[#080808]/95 p-4 shadow-[0_0_30px_rgba(109,40,217,0.22)]">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FACC15] sm:text-xs sm:tracking-[0.2em]">Signature finish</p>
              <p className="mt-2 text-lg font-black uppercase leading-tight text-white sm:text-2xl">Interior, exterior, specialty rigs</p>
              <p className="mt-3 text-sm font-semibold leading-6 text-zinc-400">Mobile appointments across Decatur and nearby communities within roughly 30 minutes.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
