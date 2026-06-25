import { randomUUID } from "crypto";
import { getOptionalSquareEnv, getSquareEnv } from "./env";
import { squareRequest } from "./client";
import type { SquareCatalogObject } from "./types";

type SearchCatalogResponse = {
  objects?: SquareCatalogObject[];
  related_objects?: SquareCatalogObject[];
  cursor?: string;
};

type BatchUpsertResponse = {
  objects?: SquareCatalogObject[];
};

export type SquarePricingVariation = {
  id: string;
  name: string;
  amountCents: number;
  currency: string;
};

export type SquarePricingItem = {
  id: string;
  name: string;
  categoryName: string;
  variations: SquarePricingVariation[];
};

export type SquarePricingSection = {
  name: string;
  items: SquarePricingItem[];
};

export type SquarePricingCatalog = {
  source: "square" | "unconfigured";
  sections: SquarePricingSection[];
};

export type SquarePriceUpdate = {
  variationId: string;
  amountCents: number;
};

const categoryOrder = ["Standard Details", "Speciality Vehicles", "Specialty Vehicles", "Add-Ons"];

export async function getSquarePricingCatalog(): Promise<SquarePricingCatalog> {
  if (!getOptionalSquareEnv()) {
    return { source: "unconfigured", sections: [] };
  }

  const objects = await listCatalogObjects();
  const categories = new Map(
    objects
      .filter((object) => object.type === "CATEGORY")
      .map((category) => [category.id, category.category_data?.name ?? "Detail Services"]),
  );

  const items = objects
    .filter((object) => object.type === "ITEM" && !object.is_deleted)
    .map((item) => mapPricingItem(item, categories))
    .filter((item): item is SquarePricingItem => Boolean(item))
    .sort((a, b) => categoryIndex(a.categoryName) - categoryIndex(b.categoryName) || a.name.localeCompare(b.name));

  const grouped = new Map<string, SquarePricingItem[]>();
  for (const item of items) {
    grouped.set(item.categoryName, [...(grouped.get(item.categoryName) ?? []), item]);
  }

  return {
    source: "square",
    sections: Array.from(grouped.entries()).map(([name, sectionItems]) => ({
      name,
      items: sectionItems,
    })),
  };
}

export async function updateSquarePrices(updates: SquarePriceUpdate[]) {
  const env = getSquareEnv();
  const sanitizedUpdates = updates.map((update) => ({
    variationId: update.variationId,
    amountCents: validateAmount(update.amountCents),
  }));
  const updateMap = new Map(sanitizedUpdates.map((update) => [update.variationId, update.amountCents]));

  if (!updateMap.size) {
    throw new Error("No price updates were provided.");
  }

  const objects = await listCatalogObjects();
  const variations = objects.filter((object) => object.type === "ITEM_VARIATION" && updateMap.has(object.id));
  const missingIds = sanitizedUpdates
    .map((update) => update.variationId)
    .filter((variationId) => !variations.some((variation) => variation.id === variationId));

  if (missingIds.length) {
    throw new Error(`Could not find Square variations: ${missingIds.join(", ")}`);
  }

  const upsertObjects = variations.map((variation) => {
    const itemData = variation.item_variation_data;
    if (!itemData?.item_id || !itemData.name) {
      throw new Error(`Square variation ${variation.id} is missing required catalog data.`);
    }

    return cleanObject({
      type: "ITEM_VARIATION",
      id: variation.id,
      version: variation.version,
      present_at_all_locations: variation.present_at_all_locations ?? false,
      present_at_location_ids: variation.present_at_location_ids ?? [env.locationId],
      absent_at_location_ids: variation.absent_at_location_ids,
      item_variation_data: {
        ...itemData,
        pricing_type: "FIXED_PRICING",
        price_money: {
          amount: updateMap.get(variation.id),
          currency: itemData.price_money?.currency ?? "USD",
        },
      },
    });
  });

  await squareRequest<BatchUpsertResponse>("/v2/catalog/batch-upsert", {
    method: "POST",
    body: {
      idempotency_key: randomUUID(),
      batches: [{ objects: upsertObjects }],
    },
  });
}

async function listCatalogObjects() {
  const objects: SquareCatalogObject[] = [];
  let cursor: string | undefined;

  do {
    const response = await squareRequest<SearchCatalogResponse>("/v2/catalog/search", {
      method: "POST",
      cache: "no-store",
      body: {
        object_types: ["ITEM", "CATEGORY"],
        include_deleted_objects: false,
        include_related_objects: true,
        cursor,
      },
    });

    objects.push(...expandCatalogObjects([...(response.objects ?? []), ...(response.related_objects ?? [])]));
    cursor = response.cursor;
  } while (cursor);

  return Array.from(new Map(objects.map((object) => [object.id, object])).values());
}

function expandCatalogObjects(objects: SquareCatalogObject[]) {
  const embeddedVariations = objects.flatMap((object) => object.item_data?.variations ?? []);
  return [...objects, ...embeddedVariations];
}

function mapPricingItem(item: SquareCatalogObject, categories: Map<string, string>) {
  const variations = item.item_data?.variations?.filter((variation) => !variation.is_deleted) ?? [];
  const itemName = item.item_data?.name;

  if (!itemName || !variations.length) return null;

  const categoryId = item.item_data?.categories?.[0]?.id ?? item.item_data?.category_id ?? "";
  const categoryName = categories.get(categoryId) ?? "Detail Services";

  return {
    id: item.id,
    name: itemName,
    categoryName,
    variations: variations.map((variation) => ({
      id: variation.id,
      name: variation.item_variation_data?.name ?? "Service",
      amountCents: variation.item_variation_data?.price_money?.amount ?? 0,
      currency: variation.item_variation_data?.price_money?.currency ?? "USD",
    })),
  };
}

function validateAmount(amountCents: number) {
  if (!Number.isInteger(amountCents) || amountCents < 0 || amountCents > 1000000) {
    throw new Error("Prices must be between $0 and $10,000.");
  }

  return amountCents;
}

function categoryIndex(name: string) {
  const index = categoryOrder.indexOf(name);
  return index === -1 ? categoryOrder.length : index;
}

function cleanObject(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(cleanObject);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [key, cleanObject(entryValue)]),
  );
}
