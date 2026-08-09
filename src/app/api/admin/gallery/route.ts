import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { cookies } from "next/headers";
import { getAdminCookieName, isAdminSessionReady } from "@/lib/admin-auth";
import { addUploadedGalleryItem, getUploadedGalleryItems } from "@/lib/gallery-store";
import { galleryCategoryOptions } from "@/lib/services";

export const runtime = "nodejs";

const maxFileSize = 4 * 1024 * 1024;
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
  try {
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
    const beforeSrc = await saveGalleryFile(beforeFile, `${id}-before`);
    const afterSrc = await saveGalleryFile(afterFile, `${id}-after`);

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
  } catch (error) {
    return Response.json({ ok: false, message: getUploadErrorMessage(error) }, { status: 400 });
  }
}

async function isAuthenticated() {
  const cookieStore = await cookies();
  return isAdminSessionReady(cookieStore.get(getAdminCookieName())?.value);
}

async function saveGalleryFile(file: File, name: string) {
  if (!allowedTypes.has(file.type)) {
    throw new Error("Images must be JPG, PNG, or WebP.");
  }

  if (file.size > maxFileSize) {
    throw new Error("Each image must be 4MB or smaller. Export the photos smaller before uploading.");
  }

  const extension = allowedTypes.get(file.type);
  const filename = `${name}.${extension}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "gallery");

  if (isBlobStorageEnabled()) {
    const blob = await put(`gallery/${filename}`, file, {
      access: "private",
      allowOverwrite: true,
      contentType: file.type,
    });

    return `/api/gallery/image?path=${encodeURIComponent(blob.pathname)}`;
  }

  await mkdir(uploadDir, { recursive: true });

  const destination = path.join(uploadDir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(destination, bytes);

  return `/uploads/gallery/${filename}`;
}

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isBlobStorageEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);
}

function getUploadErrorMessage(error: unknown) {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes("body exceeded") || message.includes("request body") || message.includes("413")) {
      return "The images are too large for the server upload limit. Export each photo under 4MB before uploading.";
    }

    if (message.includes("blob") || message.includes("token") || message.includes("store")) {
      return `Gallery storage is not configured correctly: ${error.message}`;
    }

    if (message.includes("read-only") || message.includes("permission") || message.includes("enoent") || message.includes("erofs")) {
      return "This hosting environment cannot save gallery files locally. Configure BLOB_READ_WRITE_TOKEN for persistent gallery uploads.";
    }

    return error.message;
  }

  return "Images could not be saved.";
}
