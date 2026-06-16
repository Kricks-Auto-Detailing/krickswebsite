"use client";

import { FormEvent, useState } from "react";

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

type AdminGalleryManagerProps = {
  categories: CategoryOption[];
  initialAuthenticated: boolean;
  initialItems: UploadedItem[];
};

export function AdminGalleryManager({ categories, initialAuthenticated, initialItems }: AdminGalleryManagerProps) {
  const [authenticated, setAuthenticated] = useState(initialAuthenticated);
  const [password, setPassword] = useState("");
  const [items, setItems] = useState<UploadedItem[]>(initialItems);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function loadItems() {
    const response = await fetch("/api/admin/gallery");
    if (!response.ok) return;
    const result = (await response.json()) as { items?: UploadedItem[] };
    setItems(result.items ?? []);
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setStatus("error");
      setMessage("Password did not match.");
      return;
    }

    setAuthenticated(true);
    setPassword("");
    setStatus("idle");
    await loadItems();
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

  return (
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
  );
}
