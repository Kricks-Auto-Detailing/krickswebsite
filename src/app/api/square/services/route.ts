import { getSquareCatalogForUi } from "@/lib/square/catalog";

export const runtime = "nodejs";

export async function GET() {
  const catalog = await getSquareCatalogForUi();

  return Response.json({
    ok: true,
    source: catalog.source,
    services: catalog.services,
    addOns: catalog.addOns,
  });
}
