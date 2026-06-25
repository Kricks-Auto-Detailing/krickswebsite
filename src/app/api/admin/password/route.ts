import { cookies } from "next/headers";
import { getAdminCookieName, isAdminPasswordChangeRequired, isValidAdminSession, setAdminPassword } from "@/lib/admin-auth";

export const runtime = "nodejs";

type PasswordChangeBody = {
  newPassword?: string;
  confirmPassword?: string;
};

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get(getAdminCookieName())?.value;

  if (!isValidAdminSession(session)) {
    return Response.json({ ok: false, message: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as PasswordChangeBody | null;
  const newPassword = body?.newPassword?.trim() ?? "";
  const confirmPassword = body?.confirmPassword?.trim() ?? "";

  if (!newPassword || !confirmPassword) {
    return Response.json({ ok: false, message: "Enter and confirm the new password." }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return Response.json({ ok: false, message: "The passwords do not match." }, { status: 400 });
  }

  try {
    await setAdminPassword(newPassword);
    return Response.json({ ok: true, passwordChangeRequired: await isAdminPasswordChangeRequired() });
  } catch (error) {
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : "Password could not be updated." },
      { status: 400 },
    );
  }
}
