import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { promisify } from "util";

const cookieName = "kricks_admin_session";
const scrypt = promisify(scryptCallback);
const credentialsPath = path.join(process.cwd(), "data", "admin-credentials.json");

type StoredAdminCredentials = {
  passwordHash?: string;
  salt?: string;
  updatedAt?: string;
};

export function getAdminCookieName() {
  return cookieName;
}

export async function isAdminPassword(value: string) {
  if (!value) return false;

  const storedCredentials = await readActiveCredentials();
  if (storedCredentials?.passwordHash && storedCredentials.salt) {
    return verifyPassword(value, storedCredentials);
  }

  const password = process.env.ADMIN_GALLERY_PASSWORD;
  return Boolean(password && safeEqual(value, password));
}

export async function isAdminPasswordChangeRequired() {
  const forcePasswordChange = process.env.ADMIN_FORCE_PASSWORD_CHANGE === "true";
  if (!forcePasswordChange) return false;

  const storedCredentials = await readActiveCredentials();
  return !storedCredentials?.passwordHash || !storedCredentials.salt;
}

export async function isAdminSessionReady(value: string | undefined) {
  return isValidAdminSession(value) && !(await isAdminPasswordChangeRequired());
}

export async function setAdminPassword(password: string) {
  const trimmedPassword = password.trim();

  if (trimmedPassword.length < 12) {
    throw new Error("Use at least 12 characters for the new admin password.");
  }

  const salt = randomBytes(16).toString("base64url");
  const passwordHash = await hashPassword(trimmedPassword, salt);
  await writeStoredCredentialsFile({
    passwordHash,
    salt,
    updatedAt: new Date().toISOString(),
  });

  const storedCredentials = await readStoredCredentialsFile();
  if (!(await verifyPassword(trimmedPassword, storedCredentials ?? {}))) {
    throw new Error("Admin password could not be verified after saving. Check that the host allows persistent file storage or use ADMIN_PASSWORD_HASH and ADMIN_PASSWORD_SALT.");
  }
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

async function verifyPassword(password: string, credentials: StoredAdminCredentials) {
  if (!credentials.salt || !credentials.passwordHash) return false;
  const passwordHash = await hashPassword(password.trim(), credentials.salt);
  return safeEqual(passwordHash, credentials.passwordHash);
}

async function hashPassword(password: string, salt: string) {
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return derivedKey.toString("base64url");
}

async function readActiveCredentials(): Promise<StoredAdminCredentials | null> {
  return (await readStoredCredentialsFile()) ?? readEnvStoredCredentials();
}

async function readStoredCredentialsFile(): Promise<StoredAdminCredentials | null> {
  try {
    const raw = await readFile(credentialsPath, "utf8");
    const parsed = JSON.parse(raw) as StoredAdminCredentials;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function readEnvStoredCredentials(): StoredAdminCredentials | null {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const salt = process.env.ADMIN_PASSWORD_SALT;

  if (!passwordHash || !salt) return null;

  return {
    passwordHash,
    salt,
    updatedAt: "env",
  };
}

async function writeStoredCredentialsFile(credentials: StoredAdminCredentials) {
  await mkdir(path.dirname(credentialsPath), { recursive: true });
  await writeFile(credentialsPath, `${JSON.stringify(credentials, null, 2)}\n`, "utf8");
}
