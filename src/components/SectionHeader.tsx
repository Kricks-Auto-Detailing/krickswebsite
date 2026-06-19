type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  text?: string;
  align?: "left" | "center";
};

export function SectionHeader({ eyebrow, title, text, align = "left" }: SectionHeaderProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#FACC15] sm:mb-3 sm:text-xs sm:tracking-[0.26em]">{eyebrow}</p>
      <h2 className="text-2xl font-black uppercase leading-tight text-white sm:text-4xl lg:text-5xl">{title}</h2>
      {text ? <p className="mt-3 text-sm leading-7 text-zinc-300 sm:mt-5 sm:text-lg sm:leading-8">{text}</p> : null}
    </div>
  );
}
