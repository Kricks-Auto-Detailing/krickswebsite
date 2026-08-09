import { get } from "@vercel/blob";

export const runtime = "nodejs";

const allowedGalleryImagePath = /^gallery\/[a-f0-9-]+-(before|after)\.(jpg|png|webp)$/i;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const pathname = url.searchParams.get("path") ?? "";

  if (!allowedGalleryImagePath.test(pathname)) {
    return Response.json({ ok: false, message: "Invalid gallery image." }, { status: 400 });
  }

  try {
    const result = await get(pathname, { access: "private" });

    if (!result?.stream) {
      return Response.json({ ok: false, message: "Gallery image not found." }, { status: 404 });
    }

    const contentType = result.headers.get("content-type") ?? "image/jpeg";

    return new Response(result.stream, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch {
    return Response.json({ ok: false, message: "Gallery image not found." }, { status: 404 });
  }
}
