import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { getAdminCookieName, isValidAdminSession } from "@/lib/admin-auth";
import { addUploadedGalleryItem, getUploadedGalleryItems } from "@/lib/gallery-store";
import { galleryCategoryOptions } from "@/lib/services";

export const runtime = "nodejs";

const maxFileSize = 8 * 1024 * 1024;
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const items = await getUploadedGalleryItems({ includeDrafts: true });
  return Response.json({ ok: true, items, categories: galleryCategoryOptions });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const formData = await request.formData();
  const categorySlug = getString(formData, "categorySlug");
  const title = getString(formData, "title");
  const beforeLabel = getString(formData, "beforeLabel") || "Before";
  const afterLabel = getString(formData, "afterLabel") || "After";
  const published = getString(formData, "published") === "true";
  const beforeFile = formData.get("beforeImage");
  const afterFile = formData.get("afterImage");

  const category = galleryCategoryOptions.find((item) => item.slug === categorySlug);
  if (!category) {
    return Response.json({ ok: false, message: "Choose a valid gallery category." }, { status: 400 });
  }

  if (!title) {
    return Response.json({ ok: false, message: "Add a title for this before/after set." }, { status: 400 });
  }

  if (!(beforeFile instanceof File) || !(afterFile instanceof File)) {
    return Response.json({ ok: false, message: "Upload both before and after images." }, { status: 400 });
  }

  const id = randomUUID();
  let beforeSrc: string;
  let afterSrc: string;

  try {
    beforeSrc = await saveGalleryFile(beforeFile, `${id}-before`);
    afterSrc = await saveGalleryFile(afterFile, `${id}-after`);
  } catch (error) {
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : "Images could not be saved." },
      { status: 400 },
    );
  }

  const item = await addUploadedGalleryItem({
    id,
    categorySlug,
    title,
    beforeLabel,
    afterLabel,
    beforeSrc,
    afterSrc,
    beforeAlt: `${title} before detail`,
    afterAlt: `${title} after detail`,
    tone: "from-black via-purple-950 to-zinc-900",
    published,
    createdAt: new Date().toISOString(),
  });

  return Response.json({ ok: true, item });
}

async function isAuthenticated() {
  const cookieStore = await cookies();
  return isValidAdminSession(cookieStore.get(getAdminCookieName())?.value);
}

async function saveGalleryFile(file: File, name: string) {
  if (!allowedTypes.has(file.type)) {
    throw new Error("Images must be JPG, PNG, or WebP.");
  }

  if (file.size > maxFileSize) {
    throw new Error("Each image must be 8MB or smaller.");
  }

  const extension = allowedTypes.get(file.type);
  const uploadDir = path.join(process.cwd(), "public", "uploads", "gallery");
  await mkdir(uploadDir, { recursive: true });

  const filename = `${name}.${extension}`;
  const destination = path.join(uploadDir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(destination, bytes);

  return `/uploads/gallery/${filename}`;
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
