import { addOns as fallbackAddOns, services as fallbackServices, type Service } from "@/lib/services";
import { getOptionalSquareEnv } from "./env";
import { squareRequest } from "./client";
import type { SquareAddOn, SquareCatalogObject, SquareCatalogResult, SquareService } from "./types";

type SearchCatalogResponse = {
  objects?: SquareCatalogObject[];
  related_objects?: SquareCatalogObject[];
  cursor?: string;
};

export async function getSquareCatalogForUi(): Promise<SquareCatalogResult> {
  if (!getOptionalSquareEnv()) {
    return fallbackCatalog();
  }

  try {
    const objects = await listCatalogObjects();
    const categoryNames = new Map(
      objects
        .filter((object) => object.type === "CATEGORY")
        .map((category) => [category.id, category.category_data?.name ?? "Detail Services"]),
    );
    const items = objects.filter((object) => object.type === "ITEM" && !object.is_deleted);
    const services: SquareService[] = [];
    const addOns: SquareAddOn[] = [];

    for (const item of items) {
      const categoryId = item.item_data?.categories?.[0]?.id ?? item.item_data?.category_id ?? "";
      const categoryName = categoryNames.get(categoryId) ?? "Detail Services";
      const isAddOn = isAddOnItem(item, categoryName);
      const variations = item.item_data?.variations?.filter((variation) => !variation.is_deleted) ?? [];

      if (isAddOn) {
        for (const variation of variations.length ? variations : [item]) {
          addOns.push(mapAddOn(item, variation));
        }
      } else {
        services.push(mapService(item, variations, categoryName));
      }
    }

    return {
      services: services.length ? services : fallbackCatalog().services,
      addOns: addOns.length ? mergeAddOns(addOns) : fallbackCatalog().addOns,
      source: services.length || addOns.length ? "square" : "fallback",
    };
  } catch {
    return fallbackCatalog();
  }
}

export async function getSquareServiceOptions() {
  const catalog = await getSquareCatalogForUi();
  return catalog.services;
}

export function findCatalogService(catalog: SquareCatalogResult, serviceId: string) {
  return catalog.services.find((service) => service.id === serviceId);
}

export function findCatalogAddOns(catalog: SquareCatalogResult, addOnIds: string[]) {
  const addOnSet = new Set(addOnIds);
  return catalog.addOns.filter((addOn) => addOnSet.has(addOn.id));
}

async function listCatalogObjects() {
  const objects: SquareCatalogObject[] = [];
  let cursor: string | undefined;

  do {
    const response = await squareRequest<SearchCatalogResponse>("/v2/catalog/search", {
      method: "POST",
      next: { revalidate: 300 },
      body: {
        object_types: ["ITEM", "CATEGORY"],
        include_deleted_objects: false,
        include_related_objects: true,
        cursor,
      },
    });

    objects.push(...(response.objects ?? []), ...(response.related_objects ?? []));
    cursor = response.cursor;
  } while (cursor);

  return dedupeCatalogObjects(objects);
}

function mapService(item: SquareCatalogObject, variations: SquareCatalogObject[], categoryName: string): SquareService {
  const firstVariation = variations[0];
  const prices = variations.length ? variations.map((variation) => mapPriceLine(variation)) : [{ label: "Starting at", price: "Request quote" }];
  const rawName = item.item_data?.name ?? "Square Service";
  const normalizedName = normalizeServiceName(rawName);
  const catalogIncludes = item.item_data?.description ? splitDescription(item.item_data.description) : [];
  const canonicalIncludes = getCanonicalIncludes(normalizedName.title);

  return {
    id: firstVariation?.id ?? item.id,
    title: normalizedName.title,
    category: inferServiceCategory(categoryName, item.item_data?.name),
    eyebrow: normalizedName.subtitle ?? categoryName,
    description: getCanonicalDescription(normalizedName.title, item.item_data?.description),
    pricing: prices,
    includes: canonicalIncludes.length ? canonicalIncludes : catalogIncludes,
    estimatedTime: formatDuration(firstVariation?.item_variation_data?.service_duration),
    featured: prices.length > 1 || categoryName.toLowerCase().includes("detail"),
    source: "square",
    squareItemId: item.id,
    squareVariationId: firstVariation?.id,
    squareVersion: firstVariation?.version ?? item.version,
    squareCategoryName: categoryName,
  };
}

function mapAddOn(item: SquareCatalogObject, variation: SquareCatalogObject): SquareAddOn {
  const variationName = variation.item_variation_data?.name;
  const itemName = item.item_data?.name ?? "Add-on";
  const label = variationName && variationName !== "Regular" ? `${itemName} - ${variationName}` : itemName;
  const normalized = normalizeAddOnName(label);

  return {
    id: variation.id,
    label: normalized.label,
    price: formatMoney(variation.item_variation_data?.price_money?.amount),
    source: "square",
    squareItemId: item.id,
    squareVariationId: variation.id,
  };
}

function normalizeServiceName(name: string) {
  const value = name.toLowerCase();
  if (value.includes("maintenance")) return { title: "Maintenance Detail", subtitle: "Fast upkeep clean" };
  if (value.includes("signature")) return { title: "Signature Detail", subtitle: "Interior refresh service" };
  if (value.includes("elite")) return { title: "Elite Detail", subtitle: "Deep interior detail" };
  if (value.includes("powersport") || value.includes("golf") || value.includes("atv") || value.includes("utv")) {
    return { title: "Powersport Detail", subtitle: "Golf cart, ATV, and UTV cleanup" };
  }
  if (value.includes("semi")) return { title: "Semi Cab Detail", subtitle: "Road-ready cab detail" };
  if (value.includes("trailer")) return { title: "Trailer Detail", subtitle: "Trailer and utility cleanup" };
  if (value.includes("hauler")) return { title: "Amish Hauler Detail", subtitle: "Hauler-focused clean" };
  if (value.includes("smoke")) return { title: "Smoke Removal", subtitle: "Odor treatment upgrade" };
  return { title: name, subtitle: undefined };
}

function normalizeAddOnName(name: string) {
  const value = name.toLowerCase();
  if (value.includes("pet") && value.includes("hair")) return { label: "Pet hair removal" };
  if (value.includes("plastic") && value.includes("restore")) return { label: "Exterior plastic restore" };
  if (value.includes("smoke")) return { label: "Smoke Removal" };
  return { label: name };
}

function mapPriceLine(variation: SquareCatalogObject) {
  return {
    label: variation.item_variation_data?.name ?? "Service",
    price: formatMoney(variation.item_variation_data?.price_money?.amount),
  };
}

function fallbackCatalog(): SquareCatalogResult {
  return {
    services: fallbackServices.map((service) => ({ ...service, source: "fallback" })),
    addOns: fallbackAddOns.map((addOn) => ({ ...addOn, source: "fallback" })),
    source: "fallback",
  };
}

function isAddOnItem(item: SquareCatalogObject, categoryName: string) {
  const haystack = `${categoryName} ${item.item_data?.name ?? ""}`.toLowerCase();
  return (
    haystack.includes("add-on") ||
    haystack.includes("addon") ||
    haystack.includes("add on") ||
    haystack.includes("smoke removal") ||
    (haystack.includes("pet") && haystack.includes("hair")) ||
    (haystack.includes("plastic") && haystack.includes("restore"))
  );
}

function inferServiceCategory(categoryName: string, itemName = ""): Service["category"] {
  const value = `${categoryName} ${itemName}`.toLowerCase();
  if (value.includes("add-on") || value.includes("addon") || value.includes("add on") || value.includes("smoke removal")) {
    return "addons";
  }
  if (
    value.includes("semi") ||
    value.includes("trailer") ||
    value.includes("hauler") ||
    value.includes("atv") ||
    value.includes("utv") ||
    value.includes("golf") ||
    value.includes("powersport")
  ) {
    return "specialty";
  }
  return "standard";
}

function formatMoney(cents: number | undefined) {
  if (typeof cents !== "number") return "Request quote";
  return `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: cents % 100 === 0 ? 0 : 2 })}`;
}

function formatDuration(milliseconds: number | undefined) {
  if (!milliseconds) return undefined;
  const hours = milliseconds / 1000 / 60 / 60;
  return `${Number.isInteger(hours) ? hours : hours.toFixed(1)} hours`;
}

function getCanonicalDescription(title: string, catalogDescription: string | undefined) {
  const descriptions: Record<string, string> = {
    "Maintenance Detail": "A smart maintenance service for vehicles that are already in good shape and need a sharp refresh.",
    "Signature Detail": "A full cabin clean for daily drivers that need the inside brought back to a crisp, sanitized finish.",
    "Elite Detail": "The premium mobile detail: Signature Detail plus hand wash, spray wax, dressing, and protectants.",
    "Powersport Detail": "A heavy-use cleanup for carts and powersport vehicles with exterior wash, protection, and shine.",
    "Semi Cab Detail": "A full cab service for working rigs, built for high-mileage interiors and exterior road film.",
    "Trailer Detail": "Purpose-built cleaning for trailers with pricing scaled to trailer size.",
    "Amish Hauler Detail": "Detailing support for Amish haulers and working vehicles, quoted by condition and size.",
    "Smoke Removal": "Optional odor treatment upgrade for vehicles that need extra attention after smoke exposure.",
  };

  return descriptions[title] ?? catalogDescription ?? "A Krick's Auto Detailing service configured for mobile appointment requests.";
}

function getCanonicalIncludes(title: string) {
  const includes: Record<string, string[]> = {
    "Maintenance Detail": [
      "Vacuum the entire vehicle",
      "Floor mats",
      "Wipe down all surfaces",
      "Hand wash / foam wash",
    ],
    "Signature Detail": [
      "Vacuum the entire vehicle",
      "Carpets spot cleaned",
      "Floor mats",
      "Doors cleaned",
      "Cupholders, arm rest, glove box",
      "Vents",
      "Center console and dashboard",
      "Wipe down all surfaces",
      "Seats cleaned",
      "Disinfect non-fabric surfaces",
      "Windows cleaned",
    ],
    "Elite Detail": [
      "Signature Detail",
      "Hand wash / foam wash",
      "Spray wax",
      "Door jambs",
      "Tires/wheels",
      "Window clean",
      "Tire dressing",
      "Leather seats cleaned and conditioned",
      "Plastic and vinyl UV protectant",
    ],
    "Powersport Detail": [
      "Full hand / power wash",
      "Wipedown and cleanse",
      "Vinyl dressing and leather protection",
      "Windows cleaned inside and outside",
      "Wheels detailed and tires shined",
    ],
    "Semi Cab Detail": [
      "Power wash exterior",
      "Vinyl dressing and leather protectant",
      "Clean all windows inside and outside",
      "Full vacuum and wipe down",
    ],
    "Trailer Detail": [
      "Trailer interior washout",
      "Exterior cleanup",
      "High-touch area wipe down",
      "Final rinse and inspection",
    ],
    "Amish Hauler Detail": [
      "Interior vacuum and wipe down",
      "Exterior wash",
      "Windows cleaned",
      "Tires and high-contact areas finished",
    ],
    "Smoke Removal": [
      "Odor treatment service",
      "Interior assessment",
      "High-touch surface attention",
      "Recommended with a main detail package",
    ],
  };

  return includes[title] ?? [];
}

function splitDescription(description: string) {
  return description
    .split(/\r?\n|•|-/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function dedupeCatalogObjects(objects: SquareCatalogObject[]) {
  return Array.from(new Map(objects.map((object) => [object.id, object])).values());
}

function mergeAddOns(addOns: SquareAddOn[]) {
  const smokeAddOns = addOns.filter((addOn) => addOn.label === "Smoke Removal");
  const otherAddOns = addOns.filter((addOn) => addOn.label !== "Smoke Removal");

  if (smokeAddOns.length <= 1) return addOns;

  return [
    ...otherAddOns,
    {
      ...smokeAddOns[0],
      price: formatPriceRange(smokeAddOns.map((addOn) => addOn.price)),
    },
  ];
}

function formatPriceRange(prices: string[]) {
  const amounts = prices
    .map((price) => Number(price.replace(/[^0-9.]/g, "")))
    .filter((amount) => Number.isFinite(amount))
    .sort((a, b) => a - b);

  if (!amounts.length) return prices[0] ?? "Request quote";
  const lowest = amounts[0];
  const highest = amounts[amounts.length - 1];

  return lowest === highest ? `$${lowest}` : `$${lowest}-$${highest}`;
}
