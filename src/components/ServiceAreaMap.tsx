import { serviceAreaCenter, serviceCities } from "@/lib/service-area";

const zoom = 10;
const tileSize = 256;
const tileColumns = 6;
const tileRows = 4;
const earthCircumferenceMeters = 40075016.686;
const approximateServiceRadiusMeters = 39000;

function lngToTileX(lng: number, z: number) {
  return ((lng + 180) / 360) * 2 ** z;
}

function latToTileY(lat: number, z: number) {
  const rad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** z;
}

function cityPosition(lat: number, lng: number) {
  const centerX = lngToTileX(serviceAreaCenter.lng, zoom);
  const centerY = latToTileY(serviceAreaCenter.lat, zoom);
  const topLeftX = centerX - tileColumns / 2;
  const topLeftY = centerY - tileRows / 2;

  return {
    left: `${((lngToTileX(lng, zoom) - topLeftX) / tileColumns) * 100}%`,
    top: `${((latToTileY(lat, zoom) - topLeftY) / tileRows) * 100}%`,
  };
}

function serviceRadiusPixels() {
  const metersPerPixel =
    (earthCircumferenceMeters * Math.cos((serviceAreaCenter.lat * Math.PI) / 180)) / (tileSize * 2 ** zoom);

  return approximateServiceRadiusMeters / metersPerPixel;
}

export function ServiceAreaMap() {
  const centerTileX = lngToTileX(serviceAreaCenter.lng, zoom);
  const centerTileY = latToTileY(serviceAreaCenter.lat, zoom);
  const startTileX = Math.floor(centerTileX - tileColumns / 2);
  const startTileY = Math.floor(centerTileY - tileRows / 2);
  const radiusPercent = (serviceRadiusPixels() / (tileColumns * tileSize)) * 100;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-stretch">
      <div className="relative min-h-[380px] overflow-hidden border border-[#6D28D9]/50 bg-[#080808] shadow-[0_0_50px_rgba(109,40,217,0.22)]">
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-4 opacity-75 saturate-[0.55] contrast-125 brightness-[0.55]">
          {Array.from({ length: tileRows }).map((_, row) =>
            Array.from({ length: tileColumns }).map((__, column) => {
              const x = startTileX + column;
              const y = startTileY + row;

              return (
                <div
                  key={`${x}-${y}`}
                  className="h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(https://tile.openstreetmap.org/${zoom}/${x}/${y}.png)` }}
                />
              );
            }),
          )}
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0,rgba(5,5,5,0.08)_32%,rgba(5,5,5,0.65)_100%)]" />
        <div
          className="absolute aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#FACC15]/80 bg-[#FACC15]/10 shadow-[0_0_70px_rgba(250,204,21,0.18)]"
          style={{
            left: "50%",
            top: "50%",
            width: `${radiusPercent * 2}%`,
          }}
        />

        {serviceCities.map((city) => {
          const isHome = city.type === "home";
          const isBorderline = city.type === "borderline";
          const position = cityPosition(city.lat, city.lng);

          return (
            <div
              key={`${city.name}-${city.state}`}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
              style={position}
            >
              <div
                className={`group relative grid place-items-center ${
                  isHome ? "size-5 bg-[#FACC15]" : isBorderline ? "size-4 bg-black" : "size-4 bg-[#6D28D9]"
                } border ${isBorderline ? "border-[#FACC15]" : "border-white"} shadow-[0_0_22px_rgba(109,40,217,0.75)]`}
              >
                <span className={`absolute ${isHome ? "size-10" : "size-8"} animate-ping border border-[#FACC15]/50`} />
                <span className="sr-only">
                  {city.name}, {city.state}
                </span>
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap border border-white/10 bg-black/90 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-white group-hover:block">
                  {city.name}, {city.state}
                </span>
              </div>
            </div>
          );
        })}

        <div className="absolute bottom-5 left-5 border border-white/10 bg-black/80 px-4 py-3 text-xs font-bold uppercase tracking-[0.14em] text-zinc-200 backdrop-blur">
          Real map / 30-minute mobile radius
        </div>
        <a
          href="https://www.openstreetmap.org/#map=10/40.8306/-84.9291"
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-5 right-5 border border-white/10 bg-black/80 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400 transition hover:text-[#FACC15]"
        >
          Map data OpenStreetMap
        </a>
      </div>

      <div className="flex flex-col justify-center">
        <p className="text-xs font-black uppercase tracking-[0.26em] text-[#FACC15]">Service area</p>
        <h2 className="mt-3 text-3xl font-black uppercase leading-tight text-white sm:text-4xl">
          We come to you around Decatur.
        </h2>
        <p className="mt-5 text-base leading-8 text-zinc-300">
          Krick&apos;s Auto Detailing serves Decatur, Indiana and nearby communities within roughly 30 minutes. Addresses
          outside that radius can still be requested with an additional $20 travel fee.
        </p>
        <div className="mt-6 grid gap-3 text-sm text-zinc-300">
          <p className="border-l-2 border-[#FACC15] bg-white/[0.04] p-4">Mobile appointments run 9:00 AM - 9:00 PM.</p>
          <p className="border-l-2 border-[#6D28D9] bg-white/[0.04] p-4">No appointment start times after 8:00 PM.</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {serviceCities.map((city) => (
            <div
              key={`${city.name}-${city.state}-list`}
              className={`border p-3 ${
                city.type === "home"
                  ? "border-[#FACC15]/70 bg-[#FACC15]/10"
                  : city.type === "borderline"
                    ? "border-[#FACC15]/35 bg-white/[0.03]"
                    : "border-[#6D28D9]/45 bg-[#6D28D9]/10"
              }`}
            >
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white">
                {city.name}, {city.state}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-zinc-500">{city.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
