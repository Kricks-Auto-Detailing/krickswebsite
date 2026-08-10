import { cookies } from "next/headers";
import {
  createAdminPasswordResetToken,
  createAdminSessionValue,
  getAdminCookieName,
  isAdminPasswordChangeRequired,
  isValidAdminPasswordResetToken,
  setAdminPassword,
} from "@/lib/admin-auth";
import { sendAdminPasswordResetEmail } from "@/lib/admin-reset-email";

export const runtime = "nodejs";

type ResetBody = {
  token?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export async function POST(request: Request) {
  try {
    const token = createAdminPasswordResetToken();
    const resetUrl = new URL("/admin/gallery", request.url);
    resetUrl.searchParams.set("reset", token);

    await sendAdminPasswordResetEmail(resetUrl.toString());
    return Response.json({ ok: true, message: "If email is configured, a reset link was sent." });
  } catch (error) {
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : "Password reset email could not be sent." },
      { status: 400 },
    );
  }
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as ResetBody | null;
  const token = body?.token ?? "";
  const newPassword = body?.newPassword?.trim() ?? "";
  const confirmPassword = body?.confirmPassword?.trim() ?? "";

  if (!isValidAdminPasswordResetToken(token)) {
    return Response.json({ ok: false, message: "Reset link is invalid or expired." }, { status: 401 });
  }

  if (!newPassword || !confirmPassword) {
    return Response.json({ ok: false, message: "Enter and confirm the new password." }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return Response.json({ ok: false, message: "The passwords do not match." }, { status: 400 });
  }

  try {
    await setAdminPassword(newPassword);

    const cookieStore = await cookies();
    cookieStore.set(getAdminCookieName(), createAdminSessionValue(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 12,
    });

    return Response.json({ ok: true, passwordChangeRequired: await isAdminPasswordChangeRequired() });
  } catch (error) {
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : "Password could not be updated." },
      { status: 400 },
    );
  }
}
