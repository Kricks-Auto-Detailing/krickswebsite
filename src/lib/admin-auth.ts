import { createHmac, timingSafeEqual } from "crypto";

const cookieName = "kricks_admin_session";

export function getAdminCookieName() {
  return cookieName;
}

export function isAdminPassword(value: string) {
  const password = process.env.ADMIN_GALLERY_PASSWORD;
  return Boolean(password && value && safeEqual(value, password));
}

export function createAdminSessionValue() {
  const secret = getSessionSecret();
  const issuedAt = Date.now().toString();
  const signature = createHmac("sha256", secret).update(issuedAt).digest("base64url");
  return `${issuedAt}.${signature}`;
}

export function isValidAdminSession(value: string | undefined) {
  if (!value) return false;

  const [issuedAt, signature] = value.split(".");
  const secret = getSessionSecret();
  if (!issuedAt || !signature || !secret) return false;

  const ageMs = Date.now() - Number(issuedAt);
  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > 1000 * 60 * 60 * 12) return false;

  const expected = createHmac("sha256", secret).update(issuedAt).digest("base64url");
  return safeEqual(signature, expected);
}

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.BOOKING_TOKEN_SECRET || process.env.ADMIN_GALLERY_PASSWORD || "";
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
