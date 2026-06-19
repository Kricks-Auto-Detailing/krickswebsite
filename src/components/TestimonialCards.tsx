const confidenceCards = [
  {
    title: "Mobile convenience",
    text: "Krick's comes to you around Decatur, Indiana, with clear travel-fee expectations before the appointment.",
  },
  {
    title: "Clear booking rules",
    text: "Deposit, cancellation, appointment-time, and overnight drop-off policies are stated before checkout.",
  },
  {
    title: "Vehicle-focused work",
    text: "Packages cover daily drivers, trucks, SUVs, semis, powersport vehicles, trailers, and haulers.",
  },
];

export function TestimonialCards() {
  return (
    <div className="grid gap-3 sm:gap-4 md:grid-cols-3">
      {confidenceCards.map((card) => (
        <article key={card.title} className="border border-white/10 bg-white/[0.04] p-4 transition hover:border-[#6D28D9] sm:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FACC15] sm:text-xs sm:tracking-[0.22em]">Detail standard</p>
          <h3 className="mt-3 text-lg font-black uppercase text-white sm:mt-4 sm:text-xl">{card.title}</h3>
          <p className="mt-3 text-sm leading-6 text-zinc-300 sm:mt-4 sm:leading-7">{card.text}</p>
        </article>
      ))}
    </div>
  );
}
