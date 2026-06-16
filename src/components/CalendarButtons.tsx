"use client";

import { BookingPayload, buildGoogleCalendarUrl, buildIcsFile } from "@/lib/booking";

type CalendarButtonsProps = {
  booking: BookingPayload;
  serviceTitle?: string;
  addOnLabels?: string[];
};

export function CalendarButtons({ booking, serviceTitle, addOnLabels }: CalendarButtonsProps) {
  function downloadCalendar(filename: string) {
    const blob = new Blob([buildIcsFile(booking, { serviceTitle, addOnLabels })], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <a
        href={buildGoogleCalendarUrl(booking, { serviceTitle, addOnLabels })}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-12 items-center justify-center border border-[#6D28D9] bg-[#6D28D9]/20 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.14em] text-white transition hover:border-[#FACC15] hover:text-[#FACC15]"
      >
        Add to Google Calendar
      </a>
      <button
        type="button"
        onClick={() => downloadCalendar("kricks-auto-detailing-apple.ics")}
        className="inline-flex min-h-12 items-center justify-center border border-white/15 bg-white/5 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.14em] text-white transition hover:border-[#FACC15] hover:text-[#FACC15]"
      >
        Apple / iPhone .ics
      </button>
      <button
        type="button"
        onClick={() => downloadCalendar("kricks-auto-detailing-outlook.ics")}
        className="inline-flex min-h-12 items-center justify-center border border-white/15 bg-white/5 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.14em] text-white transition hover:border-[#FACC15] hover:text-[#FACC15]"
      >
        Outlook .ics
      </button>
    </div>
  );
}
