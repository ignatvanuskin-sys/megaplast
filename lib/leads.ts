/** Валидация заявки и сборка сообщения для WhatsApp. Чистые функции — можно
 *  использовать и на сервере (API route), и на клиенте (инлайн-подсказки). */

export type LeadInput = {
  name: string;
  phone: string;
  contactMethod: string;
  product: string;
  size: string;
  qty: string;
  objectType: string;
  comment: string;
  consent: boolean;
};

export type LeadErrors = Partial<Record<keyof LeadInput, string>>;

const MAX = 600;

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

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim().slice(0, MAX) : "";
}

export function validateLead(input: Partial<LeadInput>): {
  ok: boolean;
  errors: LeadErrors;
  value: LeadInput;
} {
  const errors: LeadErrors = {};

  const name = clean(input.name);
  const phoneRaw = clean(input.phone);
  const comment = clean(input.comment);

  const value: LeadInput = {
    name,
    phone: phoneRaw,
    contactMethod: clean(input.contactMethod) || "Любой способ",
    product: clean(input.product) || "Не указано",
    size: clean(input.size),
    qty: clean(input.qty),
    objectType: clean(input.objectType) || "Не указано",
    comment,
    consent: input.consent === true,
  };

  if (name.length < 2) errors.name = "Укажите имя — минимум 2 символа";
  else if (name.length > 80) errors.name = "Слишком длинное имя";

  if (!phoneRaw) errors.phone = "Укажите номер телефона";
  else if (!normalizePhone(phoneRaw))
    errors.phone = "Проверьте номер — нужен формат +7 XXX XXX XX XX";

  if (value.qty && !/^\d{1,3}$/.test(value.qty))
    errors.qty = "Только число, например 3";

  if (value.size.length > 120) errors.size = "Слишком длинное описание размеров";
  if (comment.length > MAX) errors.comment = "Слишком длинный комментарий";

  if (!value.consent) errors.consent = "Нужно согласие на обработку данных";

  return { ok: Object.keys(errors).length === 0, errors, value };
}

/** Текст заявки для WhatsApp / уведомления менеджеру. */
export function leadToMessage(lead: LeadInput): string {
  const lines = [
    "Заявка на расчёт — MEGAPLAST KZ",
    "",
    `Изделие: ${lead.product}`,
    lead.objectType !== "Не указано" ? `Тип объекта: ${lead.objectType}` : null,
    lead.size ? `Размеры: ${lead.size}` : null,
    lead.qty ? `Количество: ${lead.qty}` : null,
    lead.comment ? `Пожелания: ${lead.comment}` : null,
    "",
    `Имя: ${lead.name}`,
    `Телефон: ${formatPhone(lead.phone)}`,
    `Связь: ${lead.contactMethod}`,
  ].filter(Boolean);

  return lines.join("\n");
}
