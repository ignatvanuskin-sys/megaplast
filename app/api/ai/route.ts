import { NextResponse } from "next/server";
import { askConsultant, isConfigured, sanitizeMessages } from "@/lib/groq";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** ИИ-консультант. Ключ Groq используется только на сервере. */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 40;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const current = buckets.get(ip);
  if (!current || current.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > LIMIT;
}

export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        code: "NOT_CONFIGURED",
        message:
          "Онлайн-консультант ещё не подключён. Оставьте заявку — менеджер ответит на все вопросы.",
      },
      { status: 503 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      {
        ok: false,
        code: "RATE_LIMITED",
        message: "Слишком много сообщений. Позвоните нам или оставьте заявку.",
      },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "BAD_REQUEST", message: "Некорректный запрос." },
      { status: 400 },
    );
  }

  const messages = sanitizeMessages((body as { messages?: unknown })?.messages);
  if (messages.length === 0) {
    return NextResponse.json(
      { ok: false, code: "BAD_INPUT", message: "Пустой запрос." },
      { status: 400 },
    );
  }

  const result = await askConsultant(messages);
  if (!result.ok) {
    return NextResponse.json(result, { status: result.code === "UPSTREAM" ? 502 : 400 });
  }

  return NextResponse.json({ ok: true, reply: result.reply });
}

export async function GET() {
  return NextResponse.json({ ok: false, code: "METHOD_NOT_ALLOWED" }, { status: 405 });
}
