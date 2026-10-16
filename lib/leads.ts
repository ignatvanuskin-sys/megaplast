/** Валидация единой заявки и сборка сообщений. Чистые функции — используются
 *  и на сервере (route handlers), и на клиенте (инлайн-подсказки). */

export type LeadInput = {
  name: string;
  phone: string;
  contactMethod: string;
  product: string;
  objectType: string;
  size: string;
  qty: string;
  system: string;
  color: string;
  mesh: string;
  comment: string;
  preferredDate: string;
  consent: boolean;
};

export type LeadErrors = Partial<Record<keyof LeadInput, string>>;

const MAX_COMMENT = 800;
const MAX_SIZE = 120;

/** Приводит номер к виду +7XXXXXXXXXX. Возвращает null, если номер не похож на казахстанский. */
export function normalizePhone(raw: string): string | null {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return null;

  let d = digits;
  if (d.length === 11 && d.startsWith("8")) d = `7${d.slice(1)}`;
  if (d.length === 10) d = `7${d}`;
  if (d.length !== 11 || !d.startsWith("7")) return null;
  if (!/^7\d{10}$/.test(d)) return null;

  return `+${d}`;
}

export function formatPhone(raw: string): string {
  const plus = normalizePhone(raw);
  if (!plus) return (raw || "").trim();
  const d = plus.slice(1);
  return `+${d[0]} ${d.slice(1, 4)} ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9)}`;
}

function clean(v: unknown, max = 160): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

/** Проверяет дату в формате YYYY-MM-DD: существует и не в прошлом. */
export function isValidFutureDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Допускаем сегодняшний день и до 2 лет вперёд
  const max = new Date(today);
  max.setFullYear(max.getFullYear() + 2);
  return parsed.getTime() >= today.getTime() && parsed.getTime() <= max.getTime();
}

export function validateLead(input: Partial<LeadInput>): {
  ok: boolean;
  errors: LeadErrors;
  value: LeadInput;
} {
  const errors: LeadErrors = {};

  const name = clean(input.name, 80);
  const phoneRaw = clean(input.phone, 40);
  const size = clean(input.size, MAX_SIZE);
  const comment = clean(input.comment, MAX_COMMENT);
  const preferredDate = clean(input.preferredDate, 10);

  const value: LeadInput = {
    name,
    phone: phoneRaw,
    contactMethod: clean(input.contactMethod, 40) || "Любой способ",
    product: clean(input.product, 80) || "Не указано",
    objectType: clean(input.objectType, 60) || "Не указано",
    size,
    qty: clean(input.qty, 3),
    system: clean(input.system, 60),
    color: clean(input.color, 60),
    mesh: clean(input.mesh, 60),
    comment,
    preferredDate,
    consent: input.consent === true,
  };

  if (name.length < 2) errors.name = "Укажите имя — минимум 2 символа";
  else if (name.length > 80) errors.name = "Слишком длинное имя";

  if (!phoneRaw) errors.phone = "Укажите номер телефона";
  else if (!normalizePhone(phoneRaw))
    errors.phone = "Проверьте номер — нужен формат +7 XXX XXX XX XX";

  if (value.qty && !/^\d{1,3}$/.test(value.qty)) errors.qty = "Только число, например 3";
  if (value.qty && Number(value.qty) === 0) errors.qty = "Укажите хотя бы одну конструкцию";
  if (size.length > MAX_SIZE) errors.size = "Слишком длинное описание размеров";
  if (comment.length > MAX_COMMENT) errors.comment = "Слишком длинный комментарий";

  if (preferredDate && !isValidFutureDate(preferredDate))
    errors.preferredDate = "Выберите дату сегодня или позже";

  if (!value.consent) errors.consent = "Нужно согласие на обработку данных";

  return { ok: Object.keys(errors).length === 0, errors, value };
}

/** Текст заявки для Telegram, вебхука и WhatsApp-фолбэка. */
export function leadToMessage(
  lead: LeadInput,
  extras?: { aiSummary?: string; photos?: { name: string }[] },
): string {
  const lines = [
    "Заявка на расчёт — MEGAPLAST KZ",
    "",
    `Изделие: ${lead.product}`,
    lead.objectType !== "Не указано" ? `Объект: ${lead.objectType}` : null,
    lead.size ? `Размеры: ${lead.size}` : null,
    lead.qty ? `Количество: ${lead.qty}` : null,
    lead.system ? `Система: ${lead.system}` : null,
    lead.color ? `Цвет профиля: ${lead.color}` : null,
    lead.mesh && lead.mesh !== "Не нужно" ? `Сетки: ${lead.mesh}` : null,
    lead.preferredDate ? `Желаемая дата замера: ${lead.preferredDate}` : null,
    lead.comment ? `Пожелания: ${lead.comment}` : null,
    "",
    `Имя: ${lead.name}`,
    `Телефон: ${formatPhone(lead.phone)}`,
    `Связь: ${lead.contactMethod}`,
  ].filter(Boolean) as string[];

  if (extras?.aiSummary) {
    lines.push("", `Диалог с консультантом: ${extras.aiSummary}`);
  }
  if (extras?.photos?.length) {
    lines.push(`Фото объекта: ${extras.photos.length} шт.`);
  }

  return lines.join("\n");
}

/** Короткий человекочитаемый номер заявки, например MP-4F7K2A */
export function makeLeadId(rand: () => number = Math.random): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(rand() * alphabet.length)];
  }
  return `MP-${out}`;
}
