import { policies } from "@/lib/services";

export function PolicyStrip() {
  return (
    <section className="border-y border-[#6D28D9]/40 bg-[#6D28D9]/10">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-white/10 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        {policies.map((policy) => (
          <div key={policy.label} className="bg-[#080808] px-3 py-4 sm:px-5 sm:py-6">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FACC15] sm:text-xs sm:tracking-[0.22em]">{policy.label}</p>
            <p className="mt-2 text-base font-black uppercase leading-tight text-white sm:text-xl">{policy.value}</p>
            <p className="mt-2 text-xs leading-5 text-zinc-400 sm:text-sm sm:leading-6">{policy.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
