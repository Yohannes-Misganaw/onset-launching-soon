import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const WAITLIST_ADMIN_COOKIE = "onset-waitlist-admin";
export const WAITLIST_ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;

const SESSION_VERSION = "v1";

function getAdminPassword(): string | null {
  const password = process.env.WAITLIST_ADMIN_PASSWORD;
  return password && password.length > 0 ? password : null;
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function safeEqual(left: string, right: string): boolean {
  return timingSafeEqual(digest(left), digest(right));
}

function signSession(expiresAt: number, password: string): string {
  return createHmac("sha256", password)
    .update(`${SESSION_VERSION}.${expiresAt}`)
    .digest("base64url");
}

export function isWaitlistAdminConfigured(): boolean {
  return getAdminPassword() !== null;
}

export function isValidWaitlistAdminPassword(candidate: string): boolean {
  const password = getAdminPassword();
  return password !== null && safeEqual(candidate, password);
}

export function createWaitlistAdminSession(): string {
  const password = getAdminPassword();

  if (!password) {
    throw new Error("WAITLIST_ADMIN_PASSWORD is not configured");
  }

  const expiresAt =
    Math.floor(Date.now() / 1000) + WAITLIST_ADMIN_SESSION_MAX_AGE;
  const signature = signSession(expiresAt, password);

  return `${expiresAt}.${signature}`;
}

export function verifyWaitlistAdminSession(token?: string): boolean {
  const password = getAdminPassword();

  if (!password || !token) {
    return false;
  }

  const [expiresAtValue, signature, ...extraParts] = token.split(".");
  const expiresAt = Number(expiresAtValue);

  if (
    extraParts.length > 0 ||
    !expiresAtValue ||
    !signature ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Math.floor(Date.now() / 1000)
  ) {
    return false;
  }

  return safeEqual(signature, signSession(expiresAt, password));
}

export async function hasWaitlistAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifyWaitlistAdminSession(
    cookieStore.get(WAITLIST_ADMIN_COOKIE)?.value
  );
}
