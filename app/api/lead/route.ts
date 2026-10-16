import { NextResponse } from "next/server";
import { leadToMessage, validateLead, type LeadInput } from "@/lib/leads";
import { createLead, storageInfo } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Единая точка приёма заявок: принимает поля формы и фотографии объекта.
 *
 * Порядок работы:
 *   1) заявка сохраняется в базу (файл или Postgres — см. lib/store.ts);
 *   2) менеджер получает уведомление в Telegram и/или на вебхук;
 *   3) клиенту подтверждается успех ТОЛЬКО если заявка действительно сохранена
 *      либо доставлена менеджеру. Иначе возвращается NOT_CONFIGURED, и интерфейс
 *      предлагает отправить те же данные в WhatsApp — без имитации отправки.
 */

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 8;

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

type FieldBag = Record<string, string>;

function toInput(fields: FieldBag, extras: { aiSummary?: string; turns?: number }) {
  const candidate: Partial<LeadInput> = {
    name: fields.name,
    phone: fields.phone,
    contactMethod: fields.contactMethod,
    product: fields.product,
    objectType: fields.objectType,
    size: fields.size,
    qty: fields.qty,
    system: fields.system,
    color: fields.color,
    mesh: fields.mesh,
    comment: fields.comment,
    preferredDate: fields.preferredDate,
    consent: fields.consent === "true" || fields.consent === "on",
  };
  const validated = validateLead(candidate);
  return {
    ...validated,
    ai: { summary: extras.aiSummary ?? "", turns: extras.turns ?? 0 },
  };
}

function collectSource(request: Request, fields: FieldBag) {
  const url = new URL(request.url);
  const utm: Record<string, string> = {};
  for (const key of [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "source",
  ]) {
    const value = fields[key] ?? url.searchParams.get(key) ?? "";
    if (value) utm[key] = value.slice(0, 120);
  }

  const ua = request.headers.get("user-agent") ?? "";
  const device = /Mobi|Android|iPhone|iPad/i.test(ua)
    ? /iPad|Tablet/i.test(ua)
      ? "планшет"
      : "телефон"
    : "компьютер";

  return {
    landing: (fields.landing || request.headers.get("referer") || "").slice(0, 500),
    referrer: (fields.referrer || "").slice(0, 500),
    utm,
    device,
  };
}

async function notifyTelegram(
  message: string,
  photos: File[],
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();
  if (!token || !chatId) return { ok: false, error: "telegram not configured" };

  try {
    const textResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!textResponse.ok) {
      return { ok: false, error: `sendMessage ${textResponse.status}` };
    }

    for (const photo of photos) {
      const form = new FormData();
      form.append("chat_id", chatId);
      form.append("caption", photo.name);
      form.append("photo", photo, photo.name || "photo.jpg");
      const photoResponse = await fetch(
        `https://api.telegram.org/bot${token}/sendPhoto`,
        { method: "POST", body: form, signal: AbortSignal.timeout(30_000) },
      );
      if (!photoResponse.ok) {
        console.error("[lead] фото не ушло в Telegram:", photoResponse.status);
      }
    }

    return { ok: true };
  } catch (error) {
    console.error("[lead] Telegram недоступен:", error);
    return { ok: false, error: "telegram request failed" };
  }
}

async function notifyWebhook(payload: unknown): Promise<{ ok: boolean }> {
  const url = process.env.LEAD_WEBHOOK_URL?.trim();
  if (!url) return { ok: false };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
    return { ok: response.ok };
  } catch (error) {
    console.error("[lead] вебхук недоступен:", error);
    return { ok: false };
  }
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, code: "RATE_LIMITED", message: "Слишком много заявок. Позвоните нам." },
      { status: 429 },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  const fields: FieldBag = {};
  let photos: File[] = [];

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      for (const [key, value] of form.entries()) {
        if (typeof value === "string") fields[key] = value;
      }
      photos = form
        .getAll("photos")
        .filter((v): v is File => v instanceof File && v.size > 0)
        .slice(0, MAX_PHOTOS);
    } else {
      const body = (await request.json()) as Record<string, unknown>;
      for (const [key, value] of Object.entries(body ?? {})) {
        if (typeof value === "string") fields[key] = value;
        else if (typeof value === "boolean") fields[key] = String(value);
      }
    }
  } catch {
    return NextResponse.json(
      { ok: false, code: "BAD_REQUEST", message: "Некорректный запрос." },
      { status: 400 },
    );
  }

  // Ловушка для ботов: скрытое поле остаётся пустым
  if ((fields.company ?? "").trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  if (photos.length > 0) {
    const bad = photos.find(
      (p) => !ALLOWED_PHOTO_TYPES.includes(p.type) || p.size > MAX_PHOTO_BYTES,
    );
    if (bad) {
      return NextResponse.json(
        {
          ok: false,
          code: "BAD_PHOTO",
          message: "Фото: только JPG, PNG или WEBP и не больше 8 МБ каждое.",
        },
        { status: 415 },
      );
    }
  }

  let aiSummary = fields.aiSummary ?? "";
  let turns = Number(fields.aiTurns ?? 0);
  if (!Number.isFinite(turns) || turns < 0) turns = 0;

  const { ok, errors, value, ai } = toInput(fields, {
    aiSummary,
    turns: Math.floor(turns),
  });
  aiSummary = ai.summary;

  if (!ok) {
    return NextResponse.json({ ok: false, code: "VALIDATION", errors }, { status: 422 });
  }

  const message = leadToMessage(value, {
    aiSummary: aiSummary || undefined,
    photos: photos.map((p) => ({ name: p.name })),
  });

  let recordId: string | null = null;
  let stored = false;
  let storageError = "";

  try {
    const record = await createLead({
      lead: value,
      photos: photos.map((p) => ({ name: p.name, size: p.size, type: p.type })),
      ai: { summary: aiSummary, turns: Math.floor(turns) },
      source: collectSource(request, fields),
    });
    recordId = record.id;
    stored = true;
  } catch (error) {
    storageError = error instanceof Error ? error.message : "unknown";
    console.error("[lead] не удалось сохранить заявку:", error);
  }

  const info = storageInfo();
  const telegram = await notifyTelegram(
    recordId ? `[${recordId}]\n${message}` : message,
    photos,
  );
  const webhook = await notifyWebhook({
    id: recordId,
    ...value,
    message,
    aiSummary,
    photos: photos.map((p) => ({ name: p.name, size: p.size, type: p.type })),
    source: collectSource(request, fields),
    receivedAt: new Date().toISOString(),
  });

  const notified = telegram.ok || webhook.ok;

  // Успех подтверждаем только при сохранении в постоянную базу
  // либо при фактической доставке менеджеру.
  if (stored && info.durable) {
    return NextResponse.json({ ok: true, id: recordId, notified });
  }
  if (notified) {
    return NextResponse.json({ ok: true, id: recordId, notified: true });
  }

  console.warn("[lead] заявка не сохранена надёжно и уведомление не ушло:", {
    stored,
    storageError,
    storage: info.kind,
    telegram: telegram.error,
    webhook,
  });

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

export async function GET() {
  const info = storageInfo();
  return NextResponse.json(
    {
      ok: false,
      code: "METHOD_NOT_ALLOWED",
      storage: { kind: info.kind, durable: info.durable },
    },
    { status: 405 },
  );
}
