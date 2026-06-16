type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  text?: string;
  align?: "left" | "center";
};

export function SectionHeader({ eyebrow, title, text, align = "left" }: SectionHeaderProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="mb-3 text-xs font-black uppercase tracking-[0.26em] text-[#FACC15]">{eyebrow}</p>
      <h2 className="text-3xl font-black uppercase leading-tight text-white sm:text-4xl lg:text-5xl">{title}</h2>
      {text ? <p className="mt-5 text-base leading-8 text-zinc-300 sm:text-lg">{text}</p> : null}
    </div>
  );
}
