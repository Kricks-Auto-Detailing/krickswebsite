export type ServiceCity = {
  name: string;
  state: "IN" | "OH";
  lat: number;
  lng: number;
  note: string;
  type?: "home" | "core" | "borderline";
};

export const serviceCities: ServiceCity[] = [
  {
    name: "Decatur",
    state: "IN",
    lat: 40.8306,
    lng: -84.9291,
    note: "Home base",
    type: "home",
  },
  {
    name: "Monroe",
    state: "IN",
    lat: 40.7453,
    lng: -84.9366,
    note: "Core mobile area",
    type: "core",
  },
  {
    name: "Berne",
    state: "IN",
    lat: 40.6578,
    lng: -84.9519,
    note: "Core mobile area",
    type: "core",
  },
  {
    name: "Bluffton",
    state: "IN",
    lat: 40.7387,
    lng: -85.1716,
    note: "Core mobile area",
    type: "core",
  },
  {
    name: "Ossian",
    state: "IN",
    lat: 40.8806,
    lng: -85.1664,
    note: "Core mobile area",
    type: "core",
  },
  {
    name: "Monroeville",
    state: "IN",
    lat: 40.9748,
    lng: -84.868,
    note: "Core mobile area",
    type: "core",
  },
  {
    name: "Hoagland",
    state: "IN",
    lat: 40.9498,
    lng: -85.0,
    note: "Core mobile area",
    type: "core",
  },
  {
    name: "Willshire",
    state: "OH",
    lat: 40.7464,
    lng: -84.7916,
    note: "Core mobile area",
    type: "core",
  },
  {
    name: "Van Wert",
    state: "OH",
    lat: 40.8695,
    lng: -84.5841,
    note: "Borderline, confirm travel",
    type: "borderline",
  },
];

export const serviceAreaCenter = serviceCities[0];
