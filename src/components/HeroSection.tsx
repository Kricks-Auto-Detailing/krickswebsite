import { ButtonLink } from "./ButtonLink";
import { contact } from "@/lib/contact";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(109,40,217,0.45),transparent_28%),linear-gradient(135deg,#050505_0%,#160a2f_42%,#050505_82%)]" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(135deg,transparent_0_46%,#FACC15_46%_47%,transparent_47%_100%)]" />
      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.86fr] lg:px-8">
        <div>
          <p className="mb-5 inline-flex border border-[#6D28D9] bg-[#6D28D9]/20 px-4 py-2 text-xs font-black uppercase tracking-[0.24em] text-[#FACC15]">
            Mobile detailing / Decatur, Indiana
          </p>
          <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.92] text-white sm:text-7xl lg:text-8xl">
            Showroom bite. Mobile speed.
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-zinc-200 sm:text-xl">
            Krick&apos;s Auto Detailing brings aggressive, premium auto detailing to your driveway across Decatur and
            surrounding areas within 30 minutes. We come to you.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/booking">Book Now</ButtonLink>
            <ButtonLink href="/services" variant="secondary">View Services</ButtonLink>
            <a
              href={contact.primaryPhone.href}
              className="inline-flex min-h-12 items-center justify-center border border-white/15 bg-white/5 px-6 py-3 text-sm font-black uppercase tracking-[0.16em] text-white transition hover:border-[#FACC15] hover:text-[#FACC15]"
            >
              Call {contact.primaryPhone.label}
            </a>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-3">
            {["Interior resets", "Foam wash gloss", "Fleet and trailers"].map((item) => (
              <div key={item} className="border border-white/10 bg-white/[0.04] p-4">
                <p className="text-sm font-black uppercase tracking-[0.12em] text-white">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative min-h-[420px] overflow-hidden border border-[#6D28D9]/50 bg-black shadow-[0_0_70px_rgba(109,40,217,0.25)]">
          <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(109,40,217,0.22),transparent_36%),radial-gradient(circle_at_45%_55%,rgba(250,204,21,0.2),transparent_20%)]" />
          <div className="absolute inset-0 opacity-30 bg-[linear-gradient(135deg,transparent_0_44%,#6D28D9_44%_50%,transparent_50%_100%)]" />
          <div className="absolute left-8 top-8 border border-[#FACC15]/50 bg-[#FACC15] px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-black">
            We come to you
          </div>

          <div className="absolute left-8 right-8 top-24 border border-white/10 bg-[#080808]/90 p-6 shadow-2xl backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FACC15]">Mobile detailing</p>
            <h2 className="mt-3 text-4xl font-black uppercase leading-none text-white sm:text-5xl">
              Decatur, IN
            </h2>
            <p className="mt-3 text-sm font-bold uppercase tracking-[0.14em] text-zinc-300">
              30-minute service radius
            </p>
          </div>

          <div className="absolute bottom-28 left-10 right-4 grid skew-x-[-12deg] grid-cols-3 overflow-hidden border border-[#6D28D9]/60 bg-[#6D28D9] shadow-[0_0_45px_rgba(109,40,217,0.55)]">
            {[
              ["9AM-9PM", "Hours"],
              ["$20", "Deposit"],
              ["8PM", "Last start"],
            ].map(([value, label]) => (
              <div key={label} className="min-h-20 border-r border-black/30 bg-[#6D28D9] p-4 last:border-r-0">
                <div className="skew-x-[12deg]">
                  <p className="text-2xl font-black uppercase leading-none text-white">{value}</p>
                  <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#FACC15]">{label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-8 left-8 right-8 border border-white/10 bg-black/80 p-5 backdrop-blur">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#FACC15]">Signature finish</p>
            <p className="mt-2 text-2xl font-black uppercase text-white">Interior, exterior, specialty rigs</p>
          </div>
        </div>
      </div>
    </section>
  );
}
