import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminConfigured, checkPassword, createToken, cookieOptions } from "@/lib/auth";
import { clientIp, RateLimiter } from "@/lib/request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Защита от подбора пароля: 10 попыток за 15 минут на адрес */
const attempts = new RateLimiter(10, 15 * 60 * 1000);

export async function POST(request: Request) {
  if (attempts.hit(clientIp(request))) {
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
