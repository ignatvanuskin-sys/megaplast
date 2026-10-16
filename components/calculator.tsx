"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CircleAlert,
  CircleCheck,
  ImagePlus,
  LoaderCircle,
  MessageCircle,
  Phone,
  Sliders,
  X,
} from "lucide-react";
import { company, primaryPhone, waLink } from "@/data/site";
import {
  colorOptions,
  contactMethodOptions,
  meshOptions,
  objectTypeOptions,
  productOptions,
  systemOptions,
} from "@/data/catalog";
import {
  CONSULT_EVENT,
  PRODUCT_EVENT,
  scrollToForm,
} from "@/lib/bridge";
import {
  formatPhone,
  leadToMessage,
  validateLead,
  type LeadErrors,
  type LeadInput,
} from "@/lib/leads";

type Status = "idle" | "sending" | "sent" | "fallback" | "error";

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

const empty: LeadInput = {
  name: "",
  phone: "",
  contactMethod: "WhatsApp",
  product: "",
  objectType: "",
  size: "",
  qty: "",
  system: "",
  color: "",
  mesh: "",
  comment: "",
  preferredDate: "",
  consent: false,
};

const FIELD_IDS: Record<string, string> = {
  name: "lead-name",
  phone: "lead-phone",
  qty: "lead-qty",
  consent: "lead-consent",
  size: "lead-size",
  comment: "lead-comment",
  preferredDate: "lead-date",
};

export default function Calculator() {
  const [values, setValues] = useState<LeadInput>(empty);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [leadId, setLeadId] = useState("");
  const [extras, setExtras] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [ai, setAi] = useState<{ summary: string; turns: number } | null>(null);
  const [highlight, setHighlight] = useState(false);

  const formRef = useRef<HTMLFormElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const previews = useMemo(
    () => photos.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [photos],
  );
  useEffect(
    () => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)),
    [previews],
  );

  const set = <K extends keyof LeadInput>(key: K, value: LeadInput[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // Каталог подставляет изделие, консультант — резюме диалога
  useEffect(() => {
    const onProduct = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (!detail) return;
      setValues((prev) => ({ ...prev, product: detail }));
      setErrors((prev) => ({ ...prev, product: undefined }));
      setHighlight(true);
      window.setTimeout(() => setHighlight(false), 2400);
    };
    const onConsult = (event: Event) => {
      const detail = (event as CustomEvent<{ summary: string; turns: number }>).detail;
      if (detail) setAi(detail);
      setHighlight(true);
      window.setTimeout(() => setHighlight(false), 2400);
    };
    window.addEventListener(PRODUCT_EVENT, onProduct);
    window.addEventListener(CONSULT_EVENT, onConsult);
    return () => {
      window.removeEventListener(PRODUCT_EVENT, onProduct);
      window.removeEventListener(CONSULT_EVENT, onConsult);
    };
  }, []);

  const waHref = useMemo(
    () => waLink(0, leadToMessage({ ...values, product: values.product || "Окно / конструкция" })),
    [values],
  );

  function addPhotos(files: FileList | null) {
    if (!files?.length) return;
    setPhotoError("");
    const accepted: File[] = [];
    for (const file of Array.from(files)) {
      if (!ALLOWED.includes(file.type)) {
        setPhotoError("Фото: только JPG, PNG или WEBP.");
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        setPhotoError("Каждое фото — не больше 8 МБ.");
        continue;
      }
      accepted.push(file);
    }
    const next = [...photos, ...accepted].slice(0, MAX_PHOTOS);
    if (photos.length + accepted.length > MAX_PHOTOS) {
      setPhotoError(`Можно приложить не больше ${MAX_PHOTOS} фотографий.`);
    }
    setPhotos(next);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const { ok, errors: found } = validateLead(values);
    if (!ok) {
      setErrors(found);
      const firstKey = Object.keys(found)[0];
      document.getElementById(FIELD_IDS[firstKey] ?? firstKey)?.focus();
      return;
    }

    setStatus("sending");
    setServerMessage("");

    const form = new FormData();
    for (const [key, value] of Object.entries(values)) {
      form.append(key, typeof value === "boolean" ? String(value) : String(value));
    }
    form.append("company", "");
    if (ai) {
      form.append("aiSummary", ai.summary);
      form.append("aiTurns", String(ai.turns));
    }
    if (typeof window !== "undefined") {
      form.append("landing", window.location.href);
      form.append("referrer", document.referrer ?? "");
    }
    photos.forEach((photo) => form.append("photos", photo));

    try {
      const response = await fetch("/api/lead", { method: "POST", body: form });
      const data = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        id?: string;
        code?: string;
        message?: string;
        errors?: LeadErrors;
      };

      if (response.ok && data.ok) {
        setLeadId(data.id ?? "");
        setStatus("sent");
        setValues(empty);
        setPhotos([]);
        setAi(null);
        return;
      }

      if (data.code === "VALIDATION" && data.errors) {
        setErrors(data.errors as LeadErrors);
        setStatus("idle");
        return;
      }

      setServerMessage(data.message ?? "");
      setStatus(data.code === "NOT_CONFIGURED" ? "fallback" : "error");
    } catch {
      setServerMessage(
        "Сеть недоступна. Отправьте заявку в WhatsApp — данные уже собраны в сообщении.",
      );
      setStatus("error");
    }
  }

  return (
    <section
      id="raschet"
      className="scroll-mt-24 border-y border-line bg-paper-2 py-16 sm:py-20 lg:py-28"
    >
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28" data-reveal>
              <p className="eyebrow">Заявка на расчёт</p>
              <h2 className="mt-4 text-[clamp(1.75rem,4.2vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
                Одна форма на весь сайт
              </h2>
              <p className="mt-5 text-[16px] leading-[1.65] text-ink-2">
                Достаточно примерных размеров и телефона. Остальное уточнит
                менеджер, а точные цифры снимет замерщик — выезд бесплатный.
                Стоимость считает человек по вашей заявке, поэтому мы не
                показываем цену, посчитанную «на глаз».
              </p>

              <ul className="mt-8 space-y-4 border-t border-line pt-6">
                {[
                  "Замер, доставка и монтаж — бесплатно.",
                  "Можно приложить фото проёма или дома — так точнее.",
                  "Ответим в WhatsApp или звонком, как вам удобнее.",
                ].map((line) => (
                  <li
                    key={line}
                    className="flex gap-3 text-[14.5px] leading-[1.6] text-ink-2"
                  >
                    <CircleCheck
                      className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                      aria-hidden="true"
                    />
                    {line}
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href={`tel:${primaryPhone.tel}`} className="btn btn-outline">
                  <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
                  {primaryPhone.label}
                </a>
                <a
                  href={waLink(0, "Здравствуйте! Хочу рассчитать стоимость окон.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  <MessageCircle className="h-4 w-4 text-accent" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div
              className={`border bg-paper p-5 transition-colors duration-500 sm:p-8 lg:p-10 ${
                highlight ? "border-accent" : "border-line"
              }`}
              data-reveal
            >
              {status === "sent" ? (
                <Outcome
                  tone="success"
                  title="Заявка принята"
                  text={`Мы сохранили заявку${leadId ? ` под номером ${leadId}` : ""} и передали её менеджеру. Он свяжется с вами, уточнит детали и подготовит расчёт.`}
                  waHref={waLink(0, `Здравствуйте! Я отправил(а) заявку ${leadId} с сайта.`)}
                />
              ) : status === "fallback" ? (
                <Outcome
                  tone="info"
                  title="Отправим заявку в WhatsApp"
                  text={
                    serverMessage ||
                    "Онлайн-приём заявок ещё не подключён. Нажмите кнопку — сообщение с вашими данными откроется в WhatsApp, останется отправить его."
                  }
                  waHref={waHref}
                  note={
                    photos.length > 0
                      ? "Фотографии приложите к сообщению в WhatsApp — здесь они не сохраняются."
                      : undefined
                  }
                />
              ) : status === "error" ? (
                <Outcome
                  tone="error"
                  title="Не удалось передать заявку"
                  text={serverMessage}
                  waHref={waHref}
                />
              ) : (
                <form ref={formRef} onSubmit={onSubmit} noValidate>
                  <h3 className="text-[18px] font-semibold tracking-[-0.02em]">
                    Что нужно рассчитать
                  </h3>
                  <p className="mt-2 text-[13.5px] text-ink-3">
                    Поля со звёздочкой обязательны, остальные — если знаете.
                  </p>

                  {ai?.summary && (
                    <p className="mt-5 border border-accent/30 bg-accent-tint px-3.5 py-3 text-[13px] leading-[1.55] text-accent-ink">
                      Из диалога с консультантом: {ai.summary}
                    </p>
                  )}

                  <div className="mt-6 grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="field-label" htmlFor="lead-product">
                        Что требуется <span className="text-accent">*</span>
                      </label>
                      <select
                        id="lead-product"
                        className="field appearance-none"
                        value={values.product}
                        onChange={(event) => set("product", event.target.value)}
                        aria-invalid={Boolean(errors.product)}
                      >
                        <option value="">Выберите изделие</option>
                        {productOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="field-label" htmlFor="lead-object">
                        Тип объекта
                      </label>
                      <select
                        id="lead-object"
                        className="field appearance-none"
                        value={values.objectType}
                        onChange={(event) => set("objectType", event.target.value)}
                      >
                        <option value="">Не указано</option>
                        {objectTypeOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="field-label" htmlFor="lead-qty">
                        Количество конструкций
                      </label>
                      <input
                        id="lead-qty"
                        className="field"
                        inputMode="numeric"
                        placeholder="например, 3"
                        value={values.qty}
                        onChange={(event) => set("qty", event.target.value)}
                        aria-invalid={Boolean(errors.qty)}
                        aria-describedby={errors.qty ? "lead-qty-error" : undefined}
                      />
                      {errors.qty && <FieldError id="lead-qty-error">{errors.qty}</FieldError>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="field-label" htmlFor="lead-size">
                        Примерные размеры
                      </label>
                      <input
                        id="lead-size"
                        className="field"
                        placeholder="ширина × высота в мм, например 1300 × 1400"
                        value={values.size}
                        onChange={(event) => set("size", event.target.value)}
                        aria-invalid={Boolean(errors.size)}
                        aria-describedby={errors.size ? "lead-size-error" : undefined}
                      />
                      {errors.size && <FieldError id="lead-size-error">{errors.size}</FieldError>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="field-label" htmlFor="lead-date">
                        Удобная дата замера
                      </label>
                      <input
                        id="lead-date"
                        type="date"
                        className="field"
                        min={new Date().toISOString().slice(0, 10)}
                        value={values.preferredDate}
                        onChange={(event) => set("preferredDate", event.target.value)}
                        aria-invalid={Boolean(errors.preferredDate)}
                        aria-describedby={
                          errors.preferredDate ? "lead-date-error" : "lead-date-hint"
                        }
                      />
                      <p id="lead-date-hint" className="mt-1.5 text-[12.5px] text-ink-3">
                        Необязательно — менеджер подтвердит время.
                      </p>
                      {errors.preferredDate && (
                        <FieldError id="lead-date-error">{errors.preferredDate}</FieldError>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <button
                        type="button"
                        onClick={() => setExtras((value) => !value)}
                        aria-expanded={extras}
                        aria-controls="lead-extras"
                        className="inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold text-ink"
                      >
                        <Sliders className="h-4 w-4 text-accent" aria-hidden="true" />
                        {extras ? "Скрыть параметры" : "Уточнить систему, цвет и фото"}
                      </button>
                    </div>

                    {extras && (
                      <div
                        id="lead-extras"
                        className="grid gap-5 border-t border-line pt-5 sm:col-span-2 sm:grid-cols-2"
                      >
                        <div>
                          <label className="field-label" htmlFor="lead-system">
                            Система профиля
                          </label>
                          <select
                            id="lead-system"
                            className="field appearance-none"
                            value={values.system}
                            onChange={(event) => set("system", event.target.value)}
                          >
                            <option value="">Не выбрано</option>
                            {systemOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="field-label" htmlFor="lead-color">
                            Цвет профиля
                          </label>
                          <select
                            id="lead-color"
                            className="field appearance-none"
                            value={values.color}
                            onChange={(event) => set("color", event.target.value)}
                          >
                            <option value="">Не выбрано</option>
                            {colorOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="field-label" htmlFor="lead-mesh">
                            Москитные сетки
                          </label>
                          <select
                            id="lead-mesh"
                            className="field appearance-none"
                            value={values.mesh}
                            onChange={(event) => set("mesh", event.target.value)}
                          >
                            <option value="">Не выбрано</option>
                            {meshOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <span className="field-label">
                            Фото объекта (до {MAX_PHOTOS} штук)
                          </span>
                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="button"
                              onClick={() => fileRef.current?.click()}
                              disabled={photos.length >= MAX_PHOTOS}
                              className="inline-flex min-h-11 items-center gap-2 border border-line-2 px-4 text-[14px] font-medium text-ink-2 transition-colors hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <ImagePlus className="h-4 w-4 text-accent" aria-hidden="true" />
                              Приложить фото
                            </button>
                            <span className="text-[12.5px] text-ink-3">JPG, PNG, WEBP · до 8 МБ</span>
                          </div>
                          <input
                            ref={fileRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={(event) => addPhotos(event.target.files)}
                            className="sr-only"
                            aria-label="Фотографии объекта"
                          />

                          {previews.length > 0 && (
                            <ul className="mt-3 flex flex-wrap gap-3">
                              {previews.map((preview, index) => (
                                <li key={preview.url} className="relative">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={preview.url}
                                    alt={`Фото ${index + 1}: ${preview.file.name}`}
                                    className="h-20 w-20 border border-line object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setPhotos((prev) =>
                                        prev.filter((_, i) => i !== index),
                                      )
                                    }
                                    aria-label={`Убрать фото ${index + 1}`}
                                    className="absolute -right-2 -top-2 inline-flex h-7 w-7 items-center justify-center border border-line bg-paper text-ink"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                          {photoError && <FieldError id="lead-photo-error">{photoError}</FieldError>}
                        </div>
                      </div>
                    )}

                    <div className="sm:col-span-2">
                      <label className="field-label" htmlFor="lead-comment">
                        Пожелания
                      </label>
                      <textarea
                        id="lead-comment"
                        className="field min-h-28 resize-y"
                        placeholder="Этаж, сторона света, шум с улицы, что не устраивает в текущих окнах"
                        value={values.comment}
                        onChange={(event) => set("comment", event.target.value)}
                        aria-invalid={Boolean(errors.comment)}
                      />
                    </div>

                    <div>
                      <label className="field-label" htmlFor="lead-name">
                        Имя <span className="text-accent">*</span>
                      </label>
                      <input
                        id="lead-name"
                        className="field"
                        autoComplete="name"
                        placeholder="Как к вам обращаться"
                        value={values.name}
                        onChange={(event) => set("name", event.target.value)}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? "lead-name-error" : undefined}
                      />
                      {errors.name && <FieldError id="lead-name-error">{errors.name}</FieldError>}
                    </div>

                    <div>
                      <label className="field-label" htmlFor="lead-phone">
                        Телефон <span className="text-accent">*</span>
                      </label>
                      <input
                        id="lead-phone"
                        className="field"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        placeholder="+7 ___ ___ __ __"
                        value={values.phone}
                        onChange={(event) => set("phone", event.target.value)}
                        onBlur={(event) => {
                          if (event.target.value.trim()) {
                            set("phone", formatPhone(event.target.value));
                          }
                        }}
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={errors.phone ? "lead-phone-error" : undefined}
                      />
                      {errors.phone && <FieldError id="lead-phone-error">{errors.phone}</FieldError>}
                    </div>

                    <fieldset className="sm:col-span-2">
                      <legend className="field-label">Предпочтительный способ связи</legend>
                      <div className="flex flex-wrap gap-2">
                        {contactMethodOptions.map((method) => (
                          <label
                            key={method.id}
                            className={`inline-flex min-h-11 cursor-pointer items-center border px-4 text-[14px] font-medium transition-colors ${
                              values.contactMethod === method.label
                                ? "border-accent bg-accent-tint text-accent-ink"
                                : "border-line-2 text-ink-2 hover:border-ink-3"
                            }`}
                          >
                            <input
                              type="radio"
                              name="contactMethod"
                              value={method.label}
                              checked={values.contactMethod === method.label}
                              onChange={() => set("contactMethod", method.label)}
                              className="sr-only"
                            />
                            {method.label}
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <div aria-hidden="true" className="hidden">
                      <label htmlFor="company">Компания</label>
                      <input id="company" name="company" tabIndex={-1} autoComplete="off" />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="flex min-h-11 cursor-pointer items-start gap-3 text-[13px] leading-[1.55] text-ink-2">
                        <input
                          id="lead-consent"
                          type="checkbox"
                          checked={values.consent}
                          onChange={(event) => set("consent", event.target.checked)}
                          aria-invalid={Boolean(errors.consent)}
                          aria-describedby={errors.consent ? "lead-consent-error" : undefined}
                          className="mt-0.5 h-6 w-6 shrink-0 accent-[#1f6b4f]"
                        />
                        <span>
                          Согласен на обработку персональных данных в целях
                          подготовки расчёта —{" "}
                          <a
                            href="/privacy"
                            className="py-2 underline decoration-accent/50 underline-offset-2 hover:decoration-accent"
                          >
                            политика обработки данных
                          </a>
                          .
                        </span>
                      </label>
                      {errors.consent && (
                        <FieldError id="lead-consent-error">{errors.consent}</FieldError>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                    <button
                      type="submit"
                      className="btn btn-accent w-full sm:w-auto"
                      disabled={status === "sending"}
                    >
                      {status === "sending" ? (
                        <>
                          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                          Отправляем…
                        </>
                      ) : (
                        "Получить расчёт"
                      )}
                    </button>
                    <p className="text-[12.5px] leading-[1.5] text-ink-3">
                      Или сразу{" "}
                      <a
                        href={waHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2 font-semibold text-ink underline decoration-accent/40 underline-offset-2"
                      >
                        напишите в WhatsApp
                      </a>{" "}
                      — {company.phones[0].label}.
                    </p>
                  </div>

                  <p aria-live="polite" className="sr-only">
                    {status === "sending" ? "Заявка отправляется" : ""}
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldError({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <p id={id} role="alert" className="mt-1.5 text-[12.5px] font-medium text-[#b3261e]">
      {children}
    </p>
  );
}

function Outcome({
  tone,
  title,
  text,
  waHref,
  note,
}: {
  tone: "success" | "info" | "error";
  title: string;
  text?: string;
  waHref: string;
  note?: string;
}) {
  const styles = {
    success: "border-accent/30 bg-accent-tint",
    info: "border-line-2 bg-paper-2",
    error: "border-[#b3261e]/25 bg-[#fdf1f0]",
  }[tone];

  const Icon =
    tone === "error" ? CircleAlert : tone === "success" ? CircleCheck : MessageCircle;

  return (
    <div role="status" aria-live="polite" className={`border p-6 sm:p-8 ${styles}`}>
      <Icon
        className={`h-7 w-7 ${tone === "error" ? "text-[#b3261e]" : "text-accent"}`}
        aria-hidden="true"
      />
      <h3 className="mt-4 text-[20px] font-semibold tracking-[-0.02em]">{title}</h3>
      {text && (
        <p className="mt-3 max-w-[36rem] text-[14.5px] leading-[1.6] text-ink-2">{text}</p>
      )}
      {note && (
        <p className="mt-3 border-l-2 border-accent pl-3 text-[13px] leading-[1.55] text-ink-2">
          {note}
        </p>
      )}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <a href={waHref} target="_blank" rel="noopener noreferrer" className="btn btn-accent">
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Отправить в WhatsApp
        </a>
        <a href={`tel:${primaryPhone.tel}`} className="btn btn-outline">
          <Phone className="h-4 w-4 text-accent" aria-hidden="true" />
          {primaryPhone.label}
        </a>
      </div>

      <p className="mt-6 text-[12.5px] leading-[1.55] text-ink-3">
        Второй номер компании: {company.phones[1].label}. График: {company.hoursLabel}{" "}
        ({company.hoursNote}).
      </p>
    </div>
  );
}
