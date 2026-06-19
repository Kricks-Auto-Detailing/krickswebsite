import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getAdminCookieName, isValidAdminSession } from "@/lib/admin-auth";
import { getSquarePricingCatalog, updateSquarePrices, type SquarePriceUpdate } from "@/lib/square/pricing";

export const runtime = "nodejs";

type PricingRequestBody = {
  updates?: Array<{
    variationId?: string;
    amountCents?: number;
  }>;
};

export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  try {
    const catalog = await getSquarePricingCatalog();
    return Response.json({ ok: true, catalog });
  } catch (error) {
    return Response.json({ ok: false, message: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return Response.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as PricingRequestBody | null;
  const updates = parseUpdates(body);

  if (!updates.length) {
    return Response.json({ ok: false, message: "Add at least one valid price update." }, { status: 400 });
  }

  try {
    await updateSquarePrices(updates);
    revalidatePath("/");
    revalidatePath("/services");
    revalidatePath("/booking");

    const catalog = await getSquarePricingCatalog();
    return Response.json({ ok: true, catalog });
  } catch (error) {
    return Response.json({ ok: false, message: getErrorMessage(error) }, { status: 500 });
  }
}

async function isAuthenticated() {
  const cookieStore = await cookies();
  return isValidAdminSession(cookieStore.get(getAdminCookieName())?.value);
}

function parseUpdates(body: PricingRequestBody | null): SquarePriceUpdate[] {
  if (!Array.isArray(body?.updates)) return [];

  return body.updates
    .filter((update) => typeof update.variationId === "string" && update.variationId.trim() && Number.isInteger(update.amountCents))
    .map((update) => ({
      variationId: update.variationId!.trim(),
      amountCents: update.amountCents!,
    }));
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Square pricing could not be updated.";
}
