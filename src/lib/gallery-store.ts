import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { galleryCategories, type GalleryCategory, type GalleryPair } from "@/lib/services";

export type UploadedGalleryItem = Omit<GalleryPair, "beforeSrc" | "afterSrc" | "beforeAlt" | "afterAlt"> & {
  id: string;
  categorySlug: string;
  beforeSrc: string;
  afterSrc: string;
  beforeAlt: string;
  afterAlt: string;
  published: boolean;
  createdAt: string;
};

type GalleryData = {
  items: UploadedGalleryItem[];
};

const dataPath = path.join(process.cwd(), "data", "gallery-items.json");

export async function getUploadedGalleryItems({ includeDrafts = false }: { includeDrafts?: boolean } = {}) {
  const data = await readGalleryData();
  return includeDrafts ? data.items : data.items.filter((item) => item.published);
}

export async function addUploadedGalleryItem(item: UploadedGalleryItem) {
  const data = await readGalleryData();
  data.items.unshift(item);
  await writeGalleryData(data);
  return item;
}

export async function getPublicGalleryCategories() {
  const uploads = await getUploadedGalleryItems();

  return galleryCategories
    .map((category) => mergeCategoryUploads(category, uploads))
    .filter((category) => !category.hidden || category.pairs.some((pair) => "id" in pair));
}

export async function getPublicGalleryCategory(slug: string) {
  const categories = await getPublicGalleryCategories();
  return categories.find((category) => category.slug === slug);
}

export async function getPublicGalleryItems() {
  const categories = await getPublicGalleryCategories();

  return categories.map((category) => ({
    title: category.coverTitle,
    category: category.label,
    tone: category.tone,
    href: `/gallery/${category.slug}`,
    imageSrc: category.coverSrc,
    alt: category.coverAlt,
  }));
}

export async function getPublicBeforeAfterPairs() {
  const categories = await getPublicGalleryCategories();
  return categories.flatMap((category) => category.pairs.map((pair) => ({ ...pair, category: category.label })));
}

async function readGalleryData(): Promise<GalleryData> {
  try {
    const raw = await readFile(dataPath, "utf8");
    const parsed = JSON.parse(raw) as GalleryData;
    return { items: Array.isArray(parsed.items) ? parsed.items : [] };
  } catch {
    return { items: [] };
  }
}

async function writeGalleryData(data: GalleryData) {
  await mkdir(path.dirname(dataPath), { recursive: true });
  await writeFile(dataPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function mergeCategoryUploads(category: GalleryCategory, uploads: UploadedGalleryItem[]): GalleryCategory {
  const uploadedPairs = uploads.filter((item) => item.categorySlug === category.slug);
  if (!uploadedPairs.length) return category;

  const firstUpload = uploadedPairs[0];

  return {
    ...category,
    hidden: false,
    coverTitle: firstUpload.title,
    coverSrc: firstUpload.afterSrc,
    coverAlt: firstUpload.afterAlt,
    pairs: [...uploadedPairs, ...category.pairs.filter((pair) => pair.beforeSrc || pair.afterSrc)],
  };
}
