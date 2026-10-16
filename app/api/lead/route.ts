import { NextResponse } from "next/server";
import { leadToMessage, validateLead } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Приём заявок.
 *
 * Канал доставки задаётся переменными окружения (см. .env.example):
 *   LEAD_WEBHOOK_URL                     — POST JSON в CRM / Make / n8n / свой endpoint
 *   TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID — уведомление в Telegram
 *
 * Если ни один канал не настроен, сервер НЕ отвечает «успешно». Он возвращает
 * код NOT_CONFIGURED, и клиент предлагает отправить те же данные в WhatsApp —
 * таким образом ни одна заявка не теряется и мы не имитируем отправку.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 6;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || b.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  b.count += 1;
  return b.count > LIMIT;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, code: "RATE_LIMITED", message: "Слишком много заявок. Попробуйте позже." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: "BAD_JSON", message: "Некорректный запрос." },
      { status: 400 },
    );
  }

  // Ловушка для ботов: скрытое поле должно остаться пустым
  const hp = (body as Record<string, unknown> | null)?.["company"];
  if (typeof hp === "string" && hp.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const { ok, errors, value } = validateLead(
    (body ?? {}) as Partial<import("@/lib/leads").LeadInput>,
  );

  if (!ok) {
    return NextResponse.json(
      { ok: false, code: "VALIDATION", errors },
      { status: 422 },
    );
  }

  const webhook = process.env.LEAD_WEBHOOK_URL?.trim();
  const tgToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const tgChat = process.env.TELEGRAM_CHAT_ID?.trim();
  const hasTelegram = Boolean(tgToken && tgChat);

  if (!webhook && !hasTelegram) {
    // Заявка фиксируется в логах, но НЕ подтверждается как доставленная
    console.warn("[lead] канал доставки не настроен. Заявка:", leadToMessage(value));
    return NextResponse.json(
      {
        ok: false,
        code: "NOT_CONFIGURED",
        message:
          "Онлайн-приём заявок ещё не подключён. Отправьте те же данные в WhatsApp — менеджер получит их сразу.",
      },
      { status: 503 },
    );
  }

  const payload = {
    ...value,
    message: leadToMessage(value),
    page: request.headers.get("referer") ?? "",
    receivedAt: new Date().toISOString(),
  };

  try {
    if (webhook) {
      const res = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`webhook responded ${res.status}`);
    }

    if (hasTelegram) {
      const res = await fetch(
        `https://api.telegram.org/bot${tgToken}/sendMessage`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ chat_id: tgChat, text: payload.message }),
          signal: AbortSignal.timeout(10_000),
        },
      );
      if (!res.ok) throw new Error(`telegram responded ${res.status}`);
    }
  } catch (error) {
    console.error("[lead] не удалось доставить заявку:", error);
    return NextResponse.json(
      {
        ok: false,
        code: "DELIVERY_FAILED",
        message:
          "Не удалось передать заявку. Позвоните нам или напишите в WhatsApp — данные уже можно отправить в один клик.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json(
    { ok: false, code: "METHOD_NOT_ALLOWED" },
    { status: 405 },
  );
}
