import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminConfigured, checkPassword, createToken, cookieOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Bucket = { count: number; resetAt: number };
const attempts = new Map<string, Bucket>();
const WINDOW_MS = 15 * 60 * 1000;
const LIMIT = 10;

function tooMany(ip: string): boolean {
  const now = Date.now();
  const current = attempts.get(ip);
  if (!current || current.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > LIMIT;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (tooMany(ip)) {
    return NextResponse.json(
      { ok: false, code: "RATE_LIMITED", message: "Слишком много попыток входа." },
      { status: 429 },
    );
  }

  if (!adminConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        code: "NOT_CONFIGURED",
        message: "Панель отключена: задайте ADMIN_PASSWORD и ADMIN_SESSION_SECRET.",
      },
      { status: 503 },
    );
  }

  let password = "";
  const contentType = request.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as { password?: string };
      password = body.password ?? "";
    } else {
      const form = await request.formData();
      password = String(form.get("password") ?? "");
    }
  } catch {
    password = "";
  }

  if (!checkPassword(password)) {
    return NextResponse.json(
      { ok: false, code: "UNAUTHORIZED", message: "Неверный пароль." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, createToken(), cookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { ...cookieOptions(), maxAge: 0 });
  return response;
}
