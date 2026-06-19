"use client";

import { FormEvent, useCallback, useState } from "react";

type CategoryOption = {
  slug: string;
  label: string;
};

type UploadedItem = {
  id: string;
  categorySlug: string;
  title: string;
  beforeLabel: string;
  afterLabel: string;
  beforeSrc: string;
  afterSrc: string;
  published: boolean;
  createdAt: string;
};

type PricingVariation = {
  id: string;
  name: string;
  amountCents: number;
  currency: string;
};

type PricingItem = {
  id: string;
  name: string;
  categoryName: string;
  variations: PricingVariation[];
};

type PricingCatalog = {
  source: "square" | "unconfigured";
  sections: Array<{
    name: string;
    items: PricingItem[];
  }>;
};

type AdminGalleryManagerProps = {
  categories: CategoryOption[];
  initialAuthenticated: boolean;
  initialPasswordChangeRequired: boolean;
  initialItems: UploadedItem[];
  initialPricingCatalog: PricingCatalog | null;
};

export function AdminGalleryManager({
  categories,
  initialAuthenticated,
  initialPasswordChangeRequired,
  initialItems,
  initialPricingCatalog,
}: AdminGalleryManagerProps) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [passwordChangeRequired, setPasswordChangeRequired] = useState(initialPasswordChangeRequired);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [items, setItems] = useState<UploadedItem[]>(initialItems);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [pricingCatalog, setPricingCatalog] = useState<PricingCatalog | null>(initialPricingCatalog);
  const [priceValues, setPriceValues] = useState<Record<string, string>>(() => buildPriceValues(initialPricingCatalog));
  const [pricingMessage, setPricingMessage] = useState("");
  const [pricingStatus, setPricingStatus] = useState<"idle" | "loading" | "saving" | "error">("idle");

  const applyPricingCatalog = useCallback((catalog: PricingCatalog) => {
    setPricingCatalog(catalog);
    setPriceValues(buildPriceValues(catalog));
  }, []);

  const loadItems = useCallback(async () => {
    const response = await fetch("/api/admin/gallery");
    if (!response.ok) return;
    const result = (await response.json()) as { items?: UploadedItem[] };
    setItems(result.items ?? []);
  }, []);

  const loadPricing = useCallback(async () => {
    setPricingStatus("loading");
    const response = await fetch("/api/admin/pricing");
    const result = (await response.json().catch(() => null)) as { ok?: boolean; message?: string; catalog?: PricingCatalog } | null;

    if (!response.ok || !result?.ok || !result.catalog) {
      setPricingStatus("error");
      setPricingMessage(result?.message ?? "Square pricing could not be loaded.");
      return;
    }

    applyPricingCatalog(result.catalog);
    setPricingStatus("idle");
  }, [applyPricingCatalog]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const result = (await response.json().catch(() => null)) as { passwordChangeRequired?: boolean } | null;

    if (!response.ok) {
      setStatus("error");
      setMessage("Password did not match.");
      return;
    }

    setAuthenticated(true);
    setPasswordChangeRequired(Boolean(result?.passwordChangeRequired));
    setPassword("");
    setStatus("idle");
    if (!result?.passwordChangeRequired) {
      await loadItems();
      await loadPricing();
    }
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/admin/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword, confirmPassword }),
    });
    const result = (await response.json().catch(() => null)) as { ok?: boolean; message?: string; passwordChangeRequired?: boolean } | null;

    if (!response.ok || !result?.ok) {
      setStatus("error");
      setMessage(result?.message ?? "Password could not be changed.");
      return;
    }

    setPasswordChangeRequired(Boolean(result.passwordChangeRequired));
    setNewPassword("");
    setConfirmPassword("");
    setStatus("idle");
    setMessage("Password changed. Admin tools are unlocked.");
    await loadItems();
    await loadPricing();
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const response = await fetch("/api/admin/gallery", {
      method: "POST",
      body: formData,
    });

    const result = (await response.json()) as { ok?: boolean; message?: string };

    if (!response.ok || !result.ok) {
      setStatus("error");
      setMessage(result.message ?? "Upload failed.");
      return;
    }

    form.reset();
    setStatus("idle");
    setMessage("Gallery set uploaded.");
    await loadItems();
  }

  async function handlePricingSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pricingCatalog) return;

    const updates = pricingCatalog.sections
      .flatMap((section) => section.items)
      .flatMap((item) => item.variations)
      .map((variation) => ({
        variationId: variation.id,
        amountCents: dollarsToCents(priceValues[variation.id]),
        originalAmountCents: variation.amountCents,
      }))
      .filter((update) => Number.isInteger(update.amountCents) && update.amountCents !== update.originalAmountCents)
      .map(({ variationId, amountCents }) => ({ variationId, amountCents }));

    if (!updates.length) {
      setPricingStatus("idle");
      setPricingMessage("No price changes to save.");
      return;
    }

    setPricingStatus("saving");
    setPricingMessage("");

    const response = await fetch("/api/admin/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates }),
    });
    const result = (await response.json().catch(() => null)) as { ok?: boolean; message?: string; catalog?: PricingCatalog } | null;

    if (!response.ok || !result?.ok || !result.catalog) {
      setPricingStatus("error");
      setPricingMessage(result?.message ?? "Square pricing could not be saved.");
      return;
    }

    applyPricingCatalog(result.catalog);
    setPricingStatus("idle");
    setPricingMessage("Prices saved to Square Item Library.");
  }

  if (!authenticated) {
    return (
      <form onSubmit={handleLogin} className="grid max-w-xl gap-5 border border-[#6D28D9]/50 bg-[#080808] p-6 shadow-[0_0_50px_rgba(109,40,217,0.18)]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FACC15]">Owner login</p>
          <h2 className="mt-2 text-2xl font-black uppercase text-white">Gallery admin</h2>
        </div>
        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#FACC15]">Password</span>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="field" autoComplete="current-password" />
        </label>
        {message ? <p className="text-sm font-bold text-[#FACC15]">{message}</p> : null}
        <button className="min-h-12 skew-x-[-10deg] bg-[#FACC15] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:bg-white" disabled={status === "loading"}>
          <span className="block skew-x-[10deg]">Login</span>
        </button>
      </form>
    );
  }

  if (passwordChangeRequired) {
    return (
      <form onSubmit={handlePasswordChange} className="grid max-w-xl gap-5 border border-[#6D28D9]/50 bg-[#080808] p-6 shadow-[0_0_50px_rgba(109,40,217,0.18)]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FACC15]">Required setup</p>
          <h2 className="mt-2 text-2xl font-black uppercase text-white">Change admin password</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            This temporary login must be replaced before gallery uploads or price changes are available.
          </p>
        </div>
        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#FACC15]">New password</span>
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            className="field"
            autoComplete="new-password"
            minLength={12}
            required
          />
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#FACC15]">Confirm password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="field"
            autoComplete="new-password"
            minLength={12}
            required
          />
        </label>
        {message ? <p className="text-sm font-bold text-[#FACC15]">{message}</p> : null}
        <button className="min-h-12 skew-x-[-10deg] bg-[#FACC15] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:bg-white disabled:opacity-60" disabled={status === "loading"}>
          <span className="block skew-x-[10deg]">{status === "loading" ? "Saving" : "Save New Password"}</span>
        </button>
      </form>
    );
  }

  return (
    <div className="grid gap-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleUpload} className="grid content-start gap-5 border border-[#6D28D9]/50 bg-[#080808] p-6 shadow-[0_0_50px_rgba(109,40,217,0.18)]">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FACC15]">New before / after set</p>
          <h2 className="mt-2 text-2xl font-black uppercase text-white">Upload gallery photos</h2>
        </div>

        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#FACC15]">Category</span>
          <select name="categorySlug" className="field" defaultValue="semis" required>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#FACC15]">Title</span>
          <input name="title" className="field" placeholder="Semi Cab Floor Reset" required />
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[#FACC15]">Before label</span>
            <input name="beforeLabel" className="field" placeholder="Road grime" />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[#FACC15]">After label</span>
            <input name="afterLabel" className="field" placeholder="Clean floor" />
          </label>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[#FACC15]">Before image</span>
            <input name="beforeImage" type="file" accept="image/jpeg,image/png,image/webp" className="field file:mr-4 file:border-0 file:bg-[#FACC15] file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:text-black" required />
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-[#FACC15]">After image</span>
            <input name="afterImage" type="file" accept="image/jpeg,image/png,image/webp" className="field file:mr-4 file:border-0 file:bg-[#FACC15] file:px-4 file:py-2 file:text-xs file:font-black file:uppercase file:text-black" required />
          </label>
        </div>

        <label className="flex items-center gap-3 border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-200">
          <input type="checkbox" name="published" value="true" defaultChecked className="accent-[#FACC15]" />
          Publish immediately
        </label>

        {message ? <p className="text-sm font-bold text-[#FACC15]">{message}</p> : null}

        <button className="min-h-12 skew-x-[-10deg] bg-[#FACC15] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:bg-white disabled:opacity-60" disabled={status === "loading"}>
          <span className="block skew-x-[10deg]">{status === "loading" ? "Uploading" : "Upload Set"}</span>
        </button>
        </form>

        <section className="border border-white/10 bg-white/[0.04] p-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FACC15]">Uploaded sets</p>
          <div className="mt-5 grid gap-4">
            {items.length ? (
              items.map((item) => (
                <article key={item.id} className="grid gap-4 border border-white/10 bg-[#080808] p-4 sm:grid-cols-[120px_1fr]">
                  <div className="grid grid-cols-2 overflow-hidden border border-[#6D28D9]/40">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.beforeSrc} alt="" className="h-24 w-full object-cover" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.afterSrc} alt="" className="h-24 w-full object-cover" />
                  </div>
                  <div>
                    <p className="text-lg font-black uppercase text-white">{item.title}</p>
                    <p className="mt-1 text-sm text-zinc-400">{item.categorySlug} / {item.published ? "Published" : "Draft"}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-[#FACC15]">
                      {item.beforeLabel} / {item.afterLabel}
                    </p>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-zinc-400">No uploaded gallery sets yet.</p>
            )}
          </div>
        </section>
      </div>

      <form onSubmit={handlePricingSave} className="border border-[#6D28D9]/50 bg-[#080808] p-6 shadow-[0_0_50px_rgba(109,40,217,0.18)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#FACC15]">Square pricing</p>
            <h2 className="mt-2 text-2xl font-black uppercase text-white">Service price manager</h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">
              Update the prices customers see on the site. Changes save directly to the connected Square Item Library.
            </p>
          </div>
          <button className="min-h-12 skew-x-[-10deg] bg-[#FACC15] px-5 py-3 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:bg-white disabled:opacity-60" disabled={pricingStatus === "saving" || pricingStatus === "loading" || pricingCatalog?.source !== "square"}>
            <span className="block skew-x-[10deg]">{pricingStatus === "saving" ? "Saving" : "Save Prices"}</span>
          </button>
        </div>

        {pricingMessage ? <p className="mt-4 text-sm font-bold text-[#FACC15]">{pricingMessage}</p> : null}

        {pricingCatalog?.source === "unconfigured" ? (
          <p className="mt-6 border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-300">
            Square is not configured on this server, so prices cannot be edited here yet.
          </p>
        ) : null}

        {pricingStatus === "loading" && !pricingCatalog ? (
          <p className="mt-6 text-sm text-zinc-400">Loading Square prices...</p>
        ) : null}

        {pricingCatalog?.sections.length ? (
          <div className="mt-6 grid gap-5">
            {pricingCatalog.sections.map((section) => (
              <section key={section.name} className="border border-white/10 bg-white/[0.04] p-4">
                <h3 className="text-lg font-black uppercase text-white">{section.name}</h3>
                <div className="mt-4 grid gap-4">
                  {section.items.map((item) => (
                    <article key={item.id} className="border border-[#6D28D9]/40 bg-[#050505] p-4">
                      <p className="text-sm font-black uppercase tracking-[0.16em] text-[#FACC15]">{item.name}</p>
                      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {item.variations.map((variation) => (
                          <label key={variation.id} className="grid gap-2">
                            <span className="text-xs font-black uppercase tracking-[0.16em] text-zinc-300">{variation.name}</span>
                            <span className="flex items-center border border-white/10 bg-[#0d0d0d] focus-within:border-[#FACC15]">
                              <span className="px-3 text-sm font-black text-[#FACC15]">$</span>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={priceValues[variation.id] ?? ""}
                                onChange={(event) => setPriceValues((current) => ({ ...current, [variation.id]: event.target.value }))}
                                className="min-h-12 w-full bg-transparent px-2 py-3 text-sm font-bold text-white outline-none"
                                aria-label={`${item.name} ${variation.name} price`}
                              />
                            </span>
                          </label>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))
            }
          </div>
        ) : null}
      </form>
    </div>
  );
}

function formatDollars(amountCents: number) {
  return (amountCents / 100).toFixed(amountCents % 100 === 0 ? 0 : 2);
}

function buildPriceValues(catalog: PricingCatalog | null) {
  if (!catalog) return {};

  return Object.fromEntries(
    catalog.sections.flatMap((section) =>
      section.items.flatMap((item) =>
        item.variations.map((variation) => [variation.id, formatDollars(variation.amountCents)]),
      ),
    ),
  );
}

function dollarsToCents(value: string | undefined) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return Number.NaN;
  return Math.round(amount * 100);
}
