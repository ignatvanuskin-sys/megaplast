/** Доступ в закрытую панель менеджера: пароль + подписанная cookie-сессия. */

import crypto from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "mp_admin";
export const ADMIN_MAX_AGE = 60 * 60 * 8; // 8 часов

function sessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET?.trim() ?? "";
}

function adminPassword(): string {
  return process.env.ADMIN_PASSWORD?.trim() ?? "";
}

export function adminConfigured(): boolean {
  return Boolean(sessionSecret() && adminPassword());
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = crypto.createHash("sha256").update(a).digest();
  const bufB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(bufA, bufB);
}

export function checkPassword(input: string): boolean {
  const expected = adminPassword();
  if (!expected || !input) return false;
  return safeEqual(input, expected);
}

export function createToken(): string {
  const expires = Date.now() + ADMIN_MAX_AGE * 1000;
  const payload = `admin.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [scope, expires, signature] = parts;
  if (scope !== "admin") return false;

  const expected = sign(`${scope}.${expires}`);
  if (signature.length !== expected.length) return false;
  if (!safeEqual(signature, expected)) return false;

  return Number(expires) > Date.now();
}

/** Проверка сессии в серверных компонентах и route handlers. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(ADMIN_COOKIE)?.value);
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_MAX_AGE,
  };
}
