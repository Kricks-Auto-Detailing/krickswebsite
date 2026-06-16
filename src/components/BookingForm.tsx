"use client";

import { FormEvent, useMemo, useState } from "react";
import { addOns, getServiceById, getServiceCategoryLabel, services, serviceCategorySections, type Service } from "@/lib/services";
import { BookingPayload, getServiceTodayDate, isLikelyOutsideCoreRadius, validateBooking } from "@/lib/booking";

type AddOnOption = {
  id: string;
  label: string;
  price: string;
};

type BookingFormProps = {
  initialServiceId?: string;
  serviceOptions?: Service[];
  addOnOptions?: AddOnOption[];
};

const initialPayload: BookingPayload = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  vehicleType: "",
  vehicleSize: "",
  serviceId: "",
  addOns: [],
  preferredDate: "",
  preferredTime: "",
  overnightDropoff: false,
  notes: "",
  cancellationPolicy: false,
  travelFeePolicy: false,
};

export function BookingForm({ initialServiceId, serviceOptions = services, addOnOptions = [...addOns] }: BookingFormProps) {
  const [payload, setPayload] = useState<BookingPayload>({
    ...initialPayload,
    serviceId: serviceOptions.find((service) => service.id === initialServiceId)?.id ?? getServiceById(initialServiceId)?.id ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");

  const selectedService = useMemo(
    () => serviceOptions.find((service) => service.id === payload.serviceId) ?? getServiceById(payload.serviceId),
    [payload.serviceId, serviceOptions],
  );
  const showTravelNotice = isLikelyOutsideCoreRadius(payload.city);

  function update<K extends keyof BookingPayload>(field: K, value: BookingPayload[K]) {
    setPayload((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function toggleAddOn(id: string) {
    setPayload((current) => ({
      ...current,
      addOns: current.addOns.includes(id) ? current.addOns.filter((item) => item !== id) : [...current.addOns, id],
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateBooking(payload, {
      serviceIds: serviceOptions.map((service) => service.id),
      addOnIds: addOnOptions.map((addOn) => addOn.id),
    });
    setErrors(validation.errors);

    if (!validation.ok) {
      setStatus("error");
      setMessage("Check the highlighted fields and confirm both policies.");
      return;
    }

    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        checkoutUrl?: string;
        errors?: Record<string, string>;
        message?: string;
      };

      if (!response.ok || !result.ok) {
        setErrors(result.errors ?? {});
        setStatus("error");
        setMessage(result.message ?? "Booking could not be sent. Please try again.");
        return;
      }

      if (!result.checkoutUrl) {
        setStatus("error");
        setMessage("Deposit checkout could not be started. Please try again.");
        return;
      }

      window.location.href = result.checkoutUrl;
    } catch {
      setStatus("error");
      setMessage("Booking could not be sent. Please check your connection and try again.");
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="grid gap-5 border border-[#6D28D9]/50 bg-[#080808] p-5 shadow-[0_0_50px_rgba(109,40,217,0.18)] sm:p-8">
      <div className="border border-[#FACC15]/50 bg-[#FACC15]/10 p-5">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FACC15]">Required appointment deposit</p>
        <p className="mt-2 text-sm leading-6 text-zinc-100">
          A $20 deposit is collected after this form through Square Checkout. It applies toward the final service total.
          Late cancellations or no-shows forfeit the deposit.
        </p>
        {selectedService ? (
          <p className="mt-3 text-sm font-bold text-white">
            Selected service: <span className="text-[#FACC15]">{selectedService.title}</span>
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full name" error={errors.fullName}>
          <input value={payload.fullName} onChange={(e) => update("fullName", e.target.value)} className="field" autoComplete="name" />
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" value={payload.email} onChange={(e) => update("email", e.target.value)} className="field" autoComplete="email" />
        </Field>
        <Field label="Phone number" error={errors.phone}>
          <input value={payload.phone} onChange={(e) => update("phone", e.target.value)} className="field" autoComplete="tel" />
        </Field>
        <Field label="City" error={errors.city}>
          <input value={payload.city} onChange={(e) => update("city", e.target.value)} className="field" autoComplete="address-level2" />
        </Field>
      </div>

      <Field label="Address" error={errors.address}>
        <input value={payload.address} onChange={(e) => update("address", e.target.value)} className="field" autoComplete="street-address" />
      </Field>

      <div className="border border-[#FACC15]/50 bg-[#FACC15]/10 p-4 text-sm leading-6 text-zinc-100">
        {showTravelNotice
          ? "This city may be outside the 30-minute Decatur service radius. Krick's will confirm distance, and a $20 travel fee applies when the location is more than 30 minutes away."
          : "Travel fee notice: locations more than 30 minutes from Decatur, Indiana require an additional $20 fee."}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Vehicle type" error={errors.vehicleType}>
          <input value={payload.vehicleType} onChange={(e) => update("vehicleType", e.target.value)} className="field" placeholder="Car, truck, SUV, semi, trailer" />
        </Field>
        <Field label="Vehicle size" error={errors.vehicleSize}>
          <select value={payload.vehicleSize} onChange={(e) => update("vehicleSize", e.target.value)} className="field">
            <option value="">Select size</option>
            <option>Car</option>
            <option>Small Truck/SUV</option>
            <option>Large Truck/Minivan</option>
            <option>Semi Cab</option>
            <option>Trailer</option>
            <option>ATV/UTV/Golf Cart</option>
          </select>
        </Field>
      </div>

      <Field label="Service selection" error={errors.serviceId}>
        <select value={payload.serviceId} onChange={(e) => update("serviceId", e.target.value)} className="field">
          <option value="">Select service</option>
          {serviceCategorySections.map((section) => {
            const groupedServices = serviceOptions.filter((service) => service.category === section.id);
            if (!groupedServices.length) return null;

            return (
              <optgroup key={section.id} label={getServiceCategoryLabel(section.id)}>
                {groupedServices.map((service) => (
                  <option key={service.id} value={service.id}>{service.title}</option>
                ))}
              </optgroup>
            );
          })}
        </select>
      </Field>

      <fieldset className="grid gap-3">
        <legend className="text-xs font-black uppercase tracking-[0.2em] text-[#FACC15]">Add-ons</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {addOnOptions.map((addOn) => (
            <label key={addOn.id} className="flex cursor-pointer items-center gap-3 border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-200 transition hover:border-[#6D28D9]">
              <input type="checkbox" checked={payload.addOns.includes(addOn.id)} onChange={() => toggleAddOn(addOn.id)} className="accent-[#FACC15]" />
              <span>{addOn.label} <span className="font-black text-[#FACC15]">{addOn.price}</span></span>
            </label>
          ))}
        </div>
        {errors.addOns ? <p className="text-sm text-[#FACC15]">{errors.addOns}</p> : null}
      </fieldset>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Preferred appointment date" error={errors.preferredDate}>
          <input type="date" min={getServiceTodayDate()} value={payload.preferredDate} onChange={(e) => update("preferredDate", e.target.value)} className="field" />
        </Field>
        <Field label="Preferred appointment time" error={errors.preferredTime}>
          <input type="time" min="09:00" max="20:00" value={payload.preferredTime} onChange={(e) => update("preferredTime", e.target.value)} className="field" />
        </Field>
      </div>

      <label className="flex items-start gap-3 border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-zinc-200">
        <input type="checkbox" checked={payload.overnightDropoff} onChange={(e) => update("overnightDropoff", e.target.checked)} className="mt-1 accent-[#FACC15]" />
        Overnight drop-off requested and will be communicated with the company beforehand.
      </label>

      <Field label="Notes/details">
        <textarea value={payload.notes} onChange={(e) => update("notes", e.target.value)} className="field min-h-32 resize-y" placeholder="Condition, stains, access details, preferred timing, or anything Krick's should know." />
      </Field>

      <div className="grid gap-3">
        <PolicyCheck checked={payload.cancellationPolicy} onChange={(checked) => update("cancellationPolicy", checked)} error={errors.cancellationPolicy}>
          I understand the $20 deposit is applied toward the final service total and is forfeited for no-shows or cancellations made less than 24 hours before the appointment.
        </PolicyCheck>
        <PolicyCheck checked={payload.travelFeePolicy} onChange={(checked) => update("travelFeePolicy", checked)} error={errors.travelFeePolicy}>
          I understand locations more than 30 minutes from Decatur, Indiana require an additional $20 travel fee.
        </PolicyCheck>
      </div>

      {message ? <p className="text-sm font-bold text-[#FACC15]">{message}</p> : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="min-h-14 skew-x-[-10deg] bg-[#FACC15] px-6 py-4 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:bg-white hover:shadow-[0_0_34px_rgba(109,40,217,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="block skew-x-[10deg]">
          {status === "submitting" ? "Starting Deposit Checkout" : "Continue to $20 Deposit"}
        </span>
      </button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-black uppercase tracking-[0.2em] text-[#FACC15]">{label}</span>
      {children}
      {error ? <span className="text-sm text-[#FACC15]">{error}</span> : null}
    </label>
  );
}

function PolicyCheck({
  checked,
  onChange,
  error,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-zinc-200">
      <span className="flex items-start gap-3">
        <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 accent-[#FACC15]" />
        <span>{children}</span>
      </span>
      {error ? <span className="text-[#FACC15]">{error}</span> : null}
    </label>
  );
}
