import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DRY_RUN = !process.argv.includes("--apply");
const LIST_LOCATIONS = process.argv.includes("--locations");
const LIST_CATALOG = process.argv.includes("--list");

loadEnvFile(path.join(ROOT, ".env.local"));
loadEnvFile(path.join(ROOT, ".env"));

const env = getSquareEnv();

const categories = [
  {
    name: "Standard Details",
    services: [
      {
        name: "Maintenance Detail",
        description: [
          "Fast upkeep clean",
          "",
          "A smart maintenance service for vehicles that are already in good shape and need a sharp refresh.",
          "",
          "Includes:",
          "- Vacuum the entire vehicle",
          "- Floor mats",
          "- Wipe down all surfaces",
          "- Hand wash / foam wash",
        ].join("\n"),
        durationHours: 2,
        variants: [
          { name: "Cars", amount: 45 },
          { name: "Trucks/SUVs", amount: 70 },
        ],
      },
      {
        name: "Signature Detail",
        description: [
          "Interior refresh service",
          "",
          "A full cabin clean for daily drivers that need the inside brought back to a crisp, sanitized finish.",
          "",
          "Includes:",
          "- Vacuum the entire vehicle",
          "- Carpets spot cleaned",
          "- Floor mats",
          "- Doors cleaned",
          "- Cupholders, arm rest, glove box",
          "- Vents",
          "- Center console and dashboard",
          "- Wipe down all surfaces",
          "- Seats cleaned",
          "- Disinfect non-fabric surfaces",
          "- Windows cleaned",
        ].join("\n"),
        durationHours: 4,
        variants: [
          { name: "Cars", amount: 140 },
          { name: "Small Trucks/SUVs", amount: 180 },
          { name: "Large Trucks/Minivans", amount: 200 },
        ],
      },
      {
        name: "Elite Detail",
        description: [
          "Deep interior detail",
          "",
          "The premium mobile detail: Signature Detail plus hand wash, spray wax, dressing, and protectants.",
          "",
          "Includes:",
          "- Signature Detail",
          "- Hand wash / foam wash",
          "- Spray wax",
          "- Door jambs",
          "- Tires/wheels",
          "- Window clean",
          "- Tire dressing",
          "- Leather seats cleaned and conditioned",
          "- Plastic and vinyl UV protectant",
        ].join("\n"),
        durationHours: 5,
        variants: [
          { name: "Cars", amount: 200 },
          { name: "Small Trucks/SUVs", amount: 225 },
          { name: "Large Trucks/Minivans", amount: 250 },
        ],
      },
    ],
  },
  {
    name: "Speciality Vehicles",
    services: [
      {
        name: "Powersport Detail",
        description: [
          "Golf cart, ATV, and UTV cleanup",
          "",
          "A heavy-use cleanup for carts and powersport vehicles with exterior wash, protection, and shine.",
          "",
          "Includes:",
          "- Full hand / power wash",
          "- Wipedown and cleanse",
          "- Vinyl dressing and leather protection",
          "- Windows cleaned inside and outside",
          "- Wheels detailed and tires shined",
        ].join("\n"),
        durationHours: 5,
        variants: [
          { name: "Small / Light cleanup", amount: 110 },
          { name: "Large / Heavy cleanup", amount: 160 },
        ],
      },
      {
        name: "Semi Cab Detail",
        description: [
          "Road-ready cab detail",
          "",
          "A full cab service for working rigs, built for high-mileage interiors and exterior road film.",
          "",
          "Includes:",
          "- Power wash exterior",
          "- Vinyl dressing and leather protectant",
          "- Clean all windows inside and outside",
          "- Full vacuum and wipe down",
        ].join("\n"),
        durationHours: 7,
        variants: [
          { name: "Standard cab", amount: 250 },
          { name: "Large / Heavy cleanup", amount: 300 },
        ],
      },
      {
        name: "Trailer Detail",
        description: [
          "Trailer and utility cleanup",
          "",
          "Purpose-built cleaning for trailers with pricing scaled to trailer size.",
          "",
          "Includes:",
          "- Trailer interior washout",
          "- Exterior cleanup",
          "- High-touch area wipe down",
          "- Final rinse and inspection",
        ].join("\n"),
        durationHours: 5,
        variants: [
          { name: "Small trailers", amount: 200 },
          { name: "Medium trailers", amount: 300 },
          { name: "Large trailers", amount: 400 },
        ],
      },
      {
        name: "Amish Hauler Detail",
        description: [
          "Hauler-focused clean",
          "",
          "Detailing support for Amish haulers and working vehicles, quoted by condition and size.",
          "",
          "Includes:",
          "- Interior vacuum and wipe down",
          "- Exterior wash",
          "- Windows cleaned",
          "- Tires and high-contact areas finished",
        ].join("\n"),
        durationHours: 5,
        variants: [{ name: "Starting at", amount: 250 }],
      },
    ],
  },
  {
    name: "Add-Ons",
    services: [
      {
        name: "Pet hair removal",
        description: "Optional pet hair removal upgrade for main detail packages.",
        variants: [{ name: "Add-on", amount: 15 }],
      },
      {
        name: "Exterior plastic restore",
        description: "Optional exterior plastic restore upgrade for faded trim.",
        variants: [{ name: "Add-on", amount: 10 }],
      },
      {
        name: "Smoke Removal",
        description: [
          "Odor treatment upgrade",
          "",
          "Optional odor treatment upgrade for vehicles that need extra attention after smoke exposure.",
        ].join("\n"),
        variants: [
          { name: "Light odor treatment", amount: 50 },
          { name: "Heavy odor treatment", amount: 100 },
        ],
      },
    ],
  },
];

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});

async function main() {
  if (LIST_LOCATIONS) {
    await listLocations();
    return;
  }

  if (LIST_CATALOG) {
    await listCatalogSummary();
    return;
  }

  console.log(`Square environment: ${env.environment}`);
  console.log(`Location ID: ${env.locationId}`);
  console.log(DRY_RUN ? "Mode: dry run. Nothing will be changed." : "Mode: APPLY. Square catalog will be updated.");

  const existing = await listExistingCatalog();
  const existingCategories = mapObjectsByName(existing.filter((object) => object.type === "CATEGORY"), "category_data");
  const existingItems = mapObjectsByName(existing.filter((object) => object.type === "ITEM"), "item_data");

  const objects = [];
  const planned = [];

  for (const category of categories) {
    const categoryObject = upsertCategoryObject(category.name, existingCategories.get(category.name));
    objects.push(categoryObject);
    planned.push(`${categoryObject.id.startsWith("#") ? "Create" : "Update"} category: ${category.name}`);

    for (const service of category.services) {
      const existingItem = existingItems.get(service.name);
      const itemObject = upsertItemObject({
        categoryId: categoryObject.id,
        existingItem,
        service,
      });
      objects.push(itemObject);
      planned.push(`${itemObject.id.startsWith("#") ? "Create" : "Update"} item: ${category.name} / ${service.name}`);
    }
  }

  for (const line of planned) console.log(`- ${line}`);

  if (DRY_RUN) {
    console.log("");
    console.log("Run npm run square:catalog:sync to create/update these records in Square.");
    return;
  }

  const response = await squareRequest("/v2/catalog/batch-upsert", {
    method: "POST",
    body: {
      idempotency_key: crypto.randomUUID(),
      batches: [{ objects }],
    },
  });

  console.log("");
  console.log(`Square catalog sync complete. Upserted ${response.objects?.length ?? objects.length} objects.`);
}

async function listLocations() {
  console.log(`Square environment: ${env.environment}`);
  const response = await squareRequest("/v2/locations");
  const locations = response.locations ?? [];

  if (!locations.length) {
    console.log("No Square locations were returned for this access token.");
    return;
  }

  console.log("Valid locations for this access token:");
  for (const location of locations) {
    const status = location.status ? ` (${location.status})` : "";
    const currency = location.currency ? ` - ${location.currency}` : "";
    console.log(`- ${location.name || "Unnamed location"}: ${location.id}${status}${currency}`);
  }
}

async function listCatalogSummary() {
  console.log(`Square environment: ${env.environment}`);
  console.log(`Location ID: ${env.locationId}`);
  const existing = await listExistingCatalog();
  const categoryNames = new Map(
    existing
      .filter((object) => object.type === "CATEGORY")
      .map((category) => [category.id, category.category_data?.name ?? "Uncategorized"]),
  );
  const items = existing
    .filter((object) => object.type === "ITEM")
    .sort((a, b) => (a.item_data?.name ?? "").localeCompare(b.item_data?.name ?? ""));

  for (const item of items) {
    const categoryId = item.item_data?.categories?.[0]?.id ?? item.item_data?.category_id;
    const categoryName = categoryNames.get(categoryId) ?? "Uncategorized";
    const productType = item.item_data?.product_type ?? "REGULAR";
    const variations = item.item_data?.variations ?? [];

    console.log(`- ${categoryName} / ${item.item_data?.name ?? "Unnamed item"} [${productType}]`);
    for (const variation of variations) {
      const data = variation.item_variation_data ?? {};
      console.log(`  - ${data.name ?? "Variation"}: ${formatCents(data.price_money?.amount)}`);
    }
  }
}

function upsertCategoryObject(name, existingCategory) {
  return cleanObject({
    type: "CATEGORY",
    id: existingCategory?.id ?? tempId("category", name),
    version: existingCategory?.version,
    category_data: { name },
  });
}

function upsertItemObject({ categoryId, existingItem, service }) {
  const itemId = existingItem?.id ?? tempId("item", service.name);
  const existingVariations = new Map(
    (existingItem?.item_data?.variations ?? []).map((variation) => [variation.item_variation_data?.name, variation]),
  );
  return cleanObject({
    type: "ITEM",
    id: itemId,
    version: existingItem?.version,
    present_at_all_locations: false,
    present_at_location_ids: [env.locationId],
    item_data: {
      name: service.name,
      description: service.description,
      categories: [{ id: categoryId }],
      product_type: "REGULAR",
      variations: service.variants.map((variant, index) => {
        const existingVariation = existingVariations.get(variant.name);

        return cleanObject({
          type: "ITEM_VARIATION",
          id: existingVariation?.id ?? tempId("variation", `${service.name}-${variant.name}`),
          version: existingVariation?.version,
          present_at_all_locations: false,
          present_at_location_ids: [env.locationId],
          item_variation_data: {
            item_id: itemId,
            name: variant.name,
            ordinal: index,
            pricing_type: "FIXED_PRICING",
            price_money: {
              amount: dollarsToCents(variant.amount),
              currency: "USD",
            },
          },
        });
      }),
    },
  });
}

async function listExistingCatalog() {
  const objects = [];
  let cursor;

  do {
    const response = await squareRequest("/v2/catalog/search", {
      method: "POST",
      body: {
        object_types: ["CATEGORY", "ITEM"],
        include_deleted_objects: false,
        include_related_objects: true,
        cursor,
      },
    });
    objects.push(...(response.objects ?? []), ...(response.related_objects ?? []));
    cursor = response.cursor;
  } while (cursor);

  return Array.from(new Map(objects.map((object) => [object.id, object])).values());
}

async function squareRequest(pathname, options = {}) {
  const response = await fetch(`${env.apiBaseUrl}${pathname}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${env.accessToken}`,
      "Content-Type": "application/json",
      "Square-Version": env.version,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const details = data.errors?.map((error) => `${error.code}: ${error.detail}`).join("\n") || JSON.stringify(data);
    throw new Error(`Square request failed for ${pathname}\n${details}`);
  }

  return data;
}

function mapObjectsByName(objects, dataKey) {
  const map = new Map();

  for (const object of objects) {
    const name = object[dataKey]?.name;
    if (name && !map.has(name)) map.set(name, object);
  }

  return map;
}

function getSquareEnv() {
  const accessToken = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  const environment = process.env.SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox";

  if (!accessToken || !locationId) {
    throw new Error("Missing SQUARE_ACCESS_TOKEN or SQUARE_LOCATION_ID. Add them to .env.local before running this script.");
  }

  return {
    accessToken,
    locationId,
    environment,
    version: process.env.SQUARE_VERSION || "2026-05-20",
    apiBaseUrl: environment === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com",
  };
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = stripQuotes(match[2].trim());
  }
}

function stripQuotes(value) {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }

  return value;
}

function tempId(prefix, name) {
  return `#${prefix}-${slugify(name)}`;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function dollarsToCents(amount) {
  return Math.round(amount * 100);
}

function formatCents(amount) {
  if (typeof amount !== "number") return "No price";
  return `$${(amount / 100).toLocaleString("en-US", { maximumFractionDigits: amount % 100 === 0 ? 0 : 2 })}`;
}

function cleanObject(value) {
  if (Array.isArray(value)) return value.map(cleanObject);
  if (!value || typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entryValue]) => entryValue !== undefined)
      .map(([key, entryValue]) => [key, cleanObject(entryValue)]),
  );
}
