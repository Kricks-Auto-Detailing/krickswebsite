import { Service } from "@/lib/services";
import { ButtonLink } from "./ButtonLink";

type ServiceCardProps = {
  service: Service;
  compact?: boolean;
  buttonHref?: string;
  buttonLabel?: string;
};

export function ServiceCard({
  service,
  compact = false,
  buttonHref,
  buttonLabel = "Book This Service",
}: ServiceCardProps) {
  return (
    <article className="group relative flex h-full overflow-hidden border border-[#6D28D9]/45 bg-[#0B0B0E] p-4 transition duration-300 hover:-translate-y-1 hover:border-[#FACC15] hover:shadow-[0_0_40px_rgba(109,40,217,0.28)] sm:p-6">
      <div className="absolute right-0 top-0 h-20 w-20 bg-[#6D28D9]/30 blur-2xl transition group-hover:bg-[#FACC15]/25" />
      <div className="relative flex min-h-full w-full flex-col">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FACC15] sm:text-xs sm:tracking-[0.22em]">{service.eyebrow}</p>
        <h3 className="mt-2 text-xl font-black uppercase leading-tight text-white sm:mt-3 sm:text-2xl">{service.title}</h3>
        <p className={`mt-2 text-sm leading-6 text-zinc-400 sm:mt-3 sm:leading-7 ${compact ? "lg:min-h-20" : "lg:min-h-14"}`}>
          {service.description}
        </p>

        <div className={`mt-4 grid content-start gap-2 sm:mt-5 ${compact ? "lg:min-h-28" : ""}`}>
          {service.pricing.map((line) => (
            <div key={line.label} className="flex items-center justify-between gap-4 border-t border-white/10 pt-2">
              <span className="text-sm text-zinc-300">{line.label}</span>
              <span className="text-base font-black text-[#FACC15] sm:text-lg">{line.price}</span>
            </div>
          ))}
        </div>

        {service.estimatedTime ? (
          <p className="mt-3 inline-flex w-fit border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-300 sm:mt-4 sm:text-xs">
            Est. {service.estimatedTime}
          </p>
        ) : null}

        {!compact ? (
          <ul className="mt-4 grid gap-2 text-sm text-zinc-300 sm:mt-5">
            {service.includes.map((item, index) => (
              <li key={`${service.id}-${index}-${item}`} className="flex gap-3">
                <span className="mt-1 text-[#FACC15]">{"\u2713"}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto pt-5 sm:pt-6">
          <ButtonLink href={buttonHref ?? `/booking?service=${service.id}`} className="w-full">
            {buttonLabel}
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
