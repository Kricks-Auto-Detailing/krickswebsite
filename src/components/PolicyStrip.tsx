import { policies } from "@/lib/services";

export function PolicyStrip() {
  return (
    <section className="border-y border-[#6D28D9]/40 bg-[#6D28D9]/10">
      <div className="mx-auto grid max-w-7xl gap-px bg-white/10 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        {policies.map((policy) => (
          <div key={policy.label} className="bg-[#080808] px-5 py-6">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FACC15]">{policy.label}</p>
            <p className="mt-2 text-xl font-black uppercase text-white">{policy.value}</p>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{policy.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
