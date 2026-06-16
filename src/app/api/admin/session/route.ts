import { cookies } from "next/headers";
import { createAdminSessionValue, getAdminCookieName, isAdminPassword, isValidAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const authenticated = isValidAdminSession(cookieStore.get(getAdminCookieName())?.value);
  return Response.json({ authenticated });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: string } | null;

  if (!isAdminPassword(body?.password ?? "")) {
    return Response.json({ ok: false, message: "Invalid admin password." }, { status: 401 });
  }

  const cookieStore = await cookies();
  cookieStore.set(getAdminCookieName(), createAdminSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return Response.json({ ok: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete(getAdminCookieName());
  return Response.json({ ok: true });
}
