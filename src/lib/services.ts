export type PriceLine = {
  label: string;
  price: string;
};

export type Service = {
  id: string;
  title: string;
  category: "standard" | "specialty" | "addons";
  eyebrow: string;
  description: string;
  pricing: PriceLine[];
  includes: string[];
  estimatedTime?: string;
  featured?: boolean;
};

export const services: Service[] = [
  {
    id: "signature-detail",
    title: "Signature Detail",
    category: "standard",
    eyebrow: "Interior refresh service",
    description: "A full cabin clean for daily drivers that need the inside brought back to a crisp, sanitized finish.",
    featured: true,
    pricing: [
      { label: "Cars", price: "$140" },
      { label: "Small Trucks/SUVs", price: "$180" },
      { label: "Large Trucks/Minivans", price: "$200" },
    ],
    includes: [
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
  },
  {
    id: "elite-detail",
    title: "Elite Detail",
    category: "standard",
    eyebrow: "Deep interior detail",
    description: "The premium mobile detail: Signature Detail plus hand wash, spray wax, dressing, and protectants.",
    featured: true,
    pricing: [
      { label: "Cars", price: "$200" },
      { label: "Small Trucks/SUVs", price: "$225" },
      { label: "Large Trucks/Minivans", price: "$250" },
    ],
    includes: [
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
  },
  {
    id: "maintenance-detail",
    title: "Maintenance Detail",
    category: "standard",
    eyebrow: "Fast upkeep clean",
    description: "A smart maintenance service for vehicles that are already in good shape and need a sharp refresh.",
    featured: true,
    pricing: [
      { label: "Cars", price: "$45" },
      { label: "Trucks/SUVs", price: "$70" },
    ],
    includes: [
      "Vacuum the entire vehicle",
      "Floor mats",
      "Wipe down all surfaces",
      "Hand wash / foam wash",
    ],
  },
  {
    id: "powersport-detail",
    title: "Powersport Detail",
    category: "specialty",
    eyebrow: "Golf cart, ATV, and UTV cleanup",
    description: "A heavy-use cleanup for carts and powersport vehicles with exterior wash, protection, and shine.",
    pricing: [{ label: "Depending on size", price: "$110-$160" }],
    estimatedTime: "5 hours",
    includes: [
      "Full hand / power wash",
      "Wipedown and cleanse",
      "Vinyl dressing and leather protection",
      "Windows cleaned inside and outside",
      "Wheels detailed and tires shined",
    ],
  },
  {
    id: "semi-cab",
    title: "Semi Cab Detail",
    category: "specialty",
    eyebrow: "Road-ready cab detail",
    description: "A full cab service for working rigs, built for high-mileage interiors and exterior road film.",
    pricing: [{ label: "Depending on size", price: "$250-$300" }],
    estimatedTime: "7 hours",
    includes: [
      "Power wash exterior",
      "Vinyl dressing and leather protectant",
      "Clean all windows inside and outside",
      "Full vacuum and wipe down",
    ],
  },
  {
    id: "trailer-detail",
    title: "Trailer Detail",
    category: "specialty",
    eyebrow: "Trailer and utility cleanup",
    description: "Purpose-built cleaning for animal trailers with pricing scaled to trailer size.",
    pricing: [
      { label: "Small trailers", price: "$200" },
      { label: "Medium trailers", price: "$300" },
      { label: "Large trailers", price: "$400" },
    ],
    includes: [
      "Trailer interior washout",
      "Exterior cleanup",
      "High-touch area wipe down",
      "Final rinse and inspection",
    ],
  },
  {
    id: "amish-hauler-detail",
    title: "Amish Hauler Detail",
    category: "specialty",
    eyebrow: "Hauler-focused clean",
    description: "Detailing support for Amish haulers and working vehicles, quoted by condition and size.",
    pricing: [{ label: "Starting at", price: "$250" }],
    includes: [
      "Interior vacuum and wipe down",
      "Exterior wash",
      "Windows cleaned",
      "Tires and high-contact areas finished",
    ],
  },
  {
    id: "smoke-removal",
    title: "Smoke Removal",
    category: "addons",
    eyebrow: "Odor treatment upgrade",
    description: "Optional odor treatment upgrade for vehicles that need extra attention after smoke exposure.",
    pricing: [{ label: "Depending on severity", price: "$50-$100" }],
    includes: [
      "Odor treatment service",
      "Interior assessment",
      "High-touch surface attention",
      "Recommended with a main detail package",
    ],
  },
];

export const addOns = [
  { id: "pet-hair-removal", label: "Pet hair removal", price: "$15" },
  { id: "exterior-plastic-restore", label: "Exterior plastic restore", price: "$10" },
  { id: "smoke-removal", label: "Smoke Removal", price: "$50-$100", subtitle: "Odor treatment upgrade" },
] as const;

export const policies = [
  { label: "Hours", value: "9:00 AM - 9:00 PM", detail: "No appointments after 8:00 PM." },
  { label: "Deposit", value: "$20 required", detail: "Applied to final total; forfeited for late cancellations or no-shows." },
  { label: "Travel", value: "30-minute radius", detail: "$20 fee outside Decatur, Indiana radius." },
  { label: "Drop-offs", value: "Overnight allowed", detail: "Must be communicated with the company beforehand." },
] as const;

export type GalleryPair = {
  title: string;
  beforeLabel: string;
  afterLabel: string;
  beforeSrc?: string;
  afterSrc?: string;
  beforeAlt?: string;
  afterAlt?: string;
  tone: string;
};

export type GalleryCategory = {
  slug: string;
  label: string;
  description: string;
  coverTitle: string;
  coverSrc?: string;
  coverAlt?: string;
  hidden?: boolean;
  tone: string;
  pairs: GalleryPair[];
};

export const galleryCategories = [
  {
    slug: "cars",
    label: "Cars",
    description: "Before and after results for coupes, sedans, and daily drivers.",
    coverTitle: "Car Details",
    hidden: true,
    tone: "from-zinc-800 via-purple-950 to-black",
    pairs: [
      {
        title: "Interior Reset",
        beforeLabel: "Daily buildup",
        afterLabel: "Sanitized finish",
        tone: "from-zinc-800 via-black to-purple-950",
      },
      {
        title: "Exterior Gloss Recovery",
        beforeLabel: "Road film",
        afterLabel: "Mirror finish",
        tone: "from-black via-purple-950 to-zinc-800",
      },
    ],
  },
  {
    slug: "trucks-suvs",
    label: "Trucks/SUVs",
    description: "Larger vehicle transformations for family SUVs, work trucks, and lifted rigs.",
    coverTitle: "Truck and SUV Details",
    hidden: true,
    tone: "from-purple-950 via-black to-zinc-900",
    pairs: [
      {
        title: "Cabin Cleanup",
        beforeLabel: "Heavy use",
        afterLabel: "Fresh cabin",
        tone: "from-purple-950 via-zinc-950 to-black",
      },
      {
        title: "Foam Wash Finish",
        beforeLabel: "Dirty panels",
        afterLabel: "Clean shine",
        tone: "from-zinc-900 via-purple-950 to-black",
      },
    ],
  },
  {
    slug: "semis",
    label: "Semis",
    description: "Real Peterbilt cab cleanup results for working rigs and high-mileage interiors.",
    coverTitle: "Peterbilt Cab Detail",
    coverSrc: "/gallery/semi-cab-entry-after.jpg",
    coverAlt: "Clean Peterbilt semi cab after interior detail",
    tone: "from-black via-zinc-900 to-purple-900",
    pairs: [
      {
        title: "Cab Entry Reset",
        beforeLabel: "Road grime",
        afterLabel: "Road-ready cab",
        beforeSrc: "/gallery/semi-cab-entry-before.jpg",
        afterSrc: "/gallery/semi-cab-entry-after.jpg",
        beforeAlt: "Dirty Peterbilt semi cab entry before detail",
        afterAlt: "Clean Peterbilt semi cab entry after detail",
        tone: "from-black via-zinc-900 to-purple-950",
      },
      {
        title: "Shifter Floor Cleanup",
        beforeLabel: "Tracked-in debris",
        afterLabel: "Clean floor mat",
        beforeSrc: "/gallery/semi-shifter-floor-before.jpg",
        afterSrc: "/gallery/semi-shifter-floor-after.jpg",
        beforeAlt: "Dirty semi shifter floor before detail",
        afterAlt: "Clean semi shifter floor after detail",
        tone: "from-zinc-900 via-black to-purple-900",
      },
      {
        title: "Floor Reset",
        beforeLabel: "Floor buildup",
        afterLabel: "Finished entry",
        beforeSrc: "/gallery/semi-driver-floor-before.jpg",
        afterSrc: "/gallery/semi-driver-floor-after.jpg",
        beforeAlt: "Dirty semi floor before detail",
        afterAlt: "Clean semi floor after detail",
        tone: "from-black via-purple-950 to-zinc-900",
      },
      {
        title: "Dash Panel Cleanup",
        beforeLabel: "Scuffed lower panel",
        afterLabel: "Wiped down finish",
        beforeSrc: "/gallery/semi-lower-panel-before.jpg",
        afterSrc: "/gallery/semi-lower-panel-after.jpg",
        beforeAlt: "Dirty semi lower dash panel before detail",
        afterAlt: "Clean semi dash panel after detail",
        tone: "from-zinc-900 via-black to-purple-950",
      },
    ],
  },
  {
    slug: "trailers",
    label: "Trailers",
    description: "Before and after cleanup for animal trailers, utility trailers, and haulers.",
    coverTitle: "Trailer Details",
    hidden: true,
    tone: "from-zinc-800 via-black to-purple-950",
    pairs: [
      {
        title: "Trailer Washout",
        beforeLabel: "Hauling residue",
        afterLabel: "Rinsed clean",
        tone: "from-zinc-800 via-black to-purple-950",
      },
      {
        title: "Utility Cleanup",
        beforeLabel: "Work debris",
        afterLabel: "Clean floor",
        tone: "from-black via-purple-950 to-zinc-900",
      },
    ],
  },
  {
    slug: "amish-haulers",
    label: "Amish Haulers",
    description: "Before and after cleanup for Amish haulers and work-focused vehicles.",
    coverTitle: "Amish Hauler Details",
    hidden: true,
    tone: "from-black via-purple-950 to-zinc-900",
    pairs: [
      {
        title: "Hauler Interior Reset",
        beforeLabel: "Work buildup",
        afterLabel: "Clean reset",
        tone: "from-black via-purple-950 to-zinc-900",
      },
    ],
  },
  {
    slug: "powersport",
    label: "Powersport",
    description: "Real UTV, ATV, and golf cart cleanup results with muddy before shots and finished after shots.",
    coverTitle: "UTV Mud Removal",
    coverSrc: "/gallery/utv-cockpit-after.jpg",
    coverAlt: "Clean UTV cockpit after powersport detail",
    tone: "from-purple-900 via-zinc-950 to-black",
    pairs: [
      {
        title: "UTV Cockpit Reset",
        beforeLabel: "Muddy floor",
        afterLabel: "Clean cockpit",
        beforeSrc: "/gallery/utv-cockpit-before.jpg",
        afterSrc: "/gallery/utv-cockpit-after.jpg",
        beforeAlt: "Muddy UTV cockpit before powersport detail",
        afterAlt: "Clean UTV cockpit after powersport detail",
        tone: "from-purple-900 via-zinc-950 to-black",
      },
      {
        title: "Front Storage Compartment",
        beforeLabel: "Packed-in dirt",
        afterLabel: "Clean storage",
        beforeSrc: "/gallery/utv-front-storage-before.jpg",
        afterSrc: "/gallery/utv-front-storage-after.jpg",
        beforeAlt: "Dirty UTV front storage compartment before detail",
        afterAlt: "Clean UTV front storage compartment after detail",
        tone: "from-black via-purple-950 to-zinc-800",
      },
      {
        title: "Rear Cargo Bed",
        beforeLabel: "Dusty cargo bed",
        afterLabel: "Finished bed",
        beforeSrc: "/gallery/utv-rear-cargo-before.jpg",
        afterSrc: "/gallery/utv-rear-cargo-after.jpg",
        beforeAlt: "Dirty UTV rear cargo bed before detail",
        afterAlt: "Clean UTV rear cargo bed after detail",
        tone: "from-zinc-900 via-purple-950 to-black",
      },
    ],
  },
] as const satisfies GalleryCategory[];

export const visibleGalleryCategories = galleryCategories.filter((category) => !("hidden" in category && category.hidden));

export const galleryItems = visibleGalleryCategories.map((category) => ({
  title: category.coverTitle,
  category: category.label,
  tone: category.tone,
  href: `/gallery/${category.slug}`,
  imageSrc: "coverSrc" in category ? category.coverSrc : undefined,
  alt: "coverAlt" in category ? category.coverAlt : undefined,
}));

export const beforeAfterPairs = visibleGalleryCategories.flatMap((category) =>
  category.pairs.map((pair) => ({ ...pair, category: category.label })),
);

export function getGalleryCategory(slug: string) {
  return visibleGalleryCategories.find((category) => category.slug === slug);
}

export const galleryCategoryOptions = galleryCategories.map((category) => ({
  slug: category.slug,
  label: category.label,
}));

export function getServiceById(id: string | null | undefined) {
  return services.find((service) => service.id === id);
}

export const serviceCategorySections = [
  {
    id: "standard",
    title: "Standard Details",
    description: "Routine and full-service detailing packages for cars, trucks, and SUVs.",
  },
  {
    id: "specialty",
    title: "Specialty Vehicles",
    description: "Cleaning services for powersport vehicles, working rigs, trailers, and haulers.",
  },
  {
    id: "addons",
    title: "Add-Ons",
    description: "Optional upgrades for vehicles that need extra attention.",
  },
] as const;

export function getServiceCategoryLabel(category: Service["category"]) {
  return serviceCategorySections.find((section) => section.id === category)?.title ?? "Services";
}
