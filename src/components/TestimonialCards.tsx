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
    <div className="grid gap-4 md:grid-cols-3">
      {confidenceCards.map((card) => (
        <article key={card.title} className="border border-white/10 bg-white/[0.04] p-6 transition hover:border-[#6D28D9]">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FACC15]">Detail standard</p>
          <h3 className="mt-4 text-xl font-black uppercase text-white">{card.title}</h3>
          <p className="mt-4 text-sm leading-7 text-zinc-300">{card.text}</p>
        </article>
      ))}
    </div>
  );
}
