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
    <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-stretch">
      <div className="relative min-h-[300px] overflow-hidden border border-[#6D28D9]/50 bg-[#080808] shadow-[0_0_50px_rgba(109,40,217,0.22)] sm:min-h-[380px]">
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

        <div className="absolute bottom-4 left-4 border border-white/10 bg-black/80 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-200 backdrop-blur sm:bottom-5 sm:left-5 sm:px-4 sm:py-3 sm:text-xs sm:tracking-[0.14em]">
          Real map / 30-minute mobile radius
        </div>
        <a
          href="https://www.openstreetmap.org/#map=10/40.8306/-84.9291"
          target="_blank"
          rel="noreferrer"
          className="absolute bottom-4 right-4 border border-white/10 bg-black/80 px-2 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-zinc-400 transition hover:text-[#FACC15] sm:bottom-5 sm:right-5 sm:px-3 sm:text-[10px] sm:tracking-[0.14em]"
        >
          Map data OpenStreetMap
        </a>
      </div>

      <div className="flex flex-col justify-center">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#FACC15] sm:text-xs sm:tracking-[0.26em]">Service area</p>
        <h2 className="mt-2 text-2xl font-black uppercase leading-tight text-white sm:mt-3 sm:text-4xl">
          We come to you around Decatur.
        </h2>
        <p className="mt-3 text-sm leading-7 text-zinc-300 sm:mt-5 sm:text-base sm:leading-8">
          Krick&apos;s Auto Detailing serves Decatur, Indiana and nearby communities within roughly 30 minutes. Addresses
          outside that radius can still be requested with an additional $20 travel fee.
        </p>
        <div className="mt-4 grid gap-2 text-sm text-zinc-300 sm:mt-6 sm:gap-3">
          <p className="border-l-2 border-[#FACC15] bg-white/[0.04] p-3 sm:p-4">Mobile appointments run 9:00 AM - 9:00 PM.</p>
          <p className="border-l-2 border-[#6D28D9] bg-white/[0.04] p-3 sm:p-4">No appointment start times after 8:00 PM.</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-6 sm:grid-cols-3">
          {serviceCities.map((city) => (
            <div
              key={`${city.name}-${city.state}-list`}
              className={`border p-2.5 sm:p-3 ${
                city.type === "home"
                  ? "border-[#FACC15]/70 bg-[#FACC15]/10"
                  : city.type === "borderline"
                    ? "border-[#FACC15]/35 bg-white/[0.03]"
                    : "border-[#6D28D9]/45 bg-[#6D28D9]/10"
              }`}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white sm:text-xs sm:tracking-[0.14em]">
                {city.name}, {city.state}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-zinc-500 sm:text-[11px] sm:tracking-[0.12em]">{city.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
