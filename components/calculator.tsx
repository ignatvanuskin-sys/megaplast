"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CircleCheck,
  LoaderCircle,
  MessageCircle,
  Phone,
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
import { CONSULT_EVENT, PRODUCT_EVENT, scrollToElement } from "@/lib/bridge";
import {
  formatPhone,
  leadToMessage,
  validateLead,
  type LeadErrors,
  type LeadInput,
} from "@/lib/leads";
import {
  ChipGroup,
  FieldError,
  OptionTiles,
  Outcome,
  PhotoPicker,
  QtyStepper,
} from "@/components/form-controls";

type Status = "idle" | "sending" | "sent" | "fallback" | "error";

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

/** Четыре коротких этапа вместо одной длинной формы. */
const STEPS = [
  {
    key: "what",
    short: "Изделие",
    title: "Что нужно рассчитать",
    hint: "Выберите изделие — остальное подскажем и уточним вместе.",
  },
  {
    key: "volume",
    short: "Объём",
    title: "Объём и сроки",
    hint: "Примерных размеров достаточно: точные снимет замерщик на объекте.",
  },
  {
    key: "params",
    short: "Параметры",
    title: "Параметры конструкции",
    hint: "Необязательный шаг — эти детали можно уточнить после замера.",
  },
  {
    key: "contacts",
    short: "Контакты",
    title: "Куда отправить расчёт",
    hint: "Перезвоним или напишем в WhatsApp — как вам удобнее.",
  },
] as const;

const STEP_FIELDS: (keyof LeadInput)[][] = [
  ["product"],
  ["size", "qty", "preferredDate"],
  [],
  ["name", "phone", "consent"],
];

const FIELD_IDS: Record<string, string> = {
  name: "lead-name",
  phone: "lead-phone",
  qty: "lead-qty",
  consent: "lead-consent",
  size: "lead-width",
  preferredDate: "lead-date",
};

const empty: LeadInput = {
  name: "",
  phone: "",
  contactMethod: "WhatsApp",
  product: "",
  objectType: "",
  size: "",
  qty: "1",
  system: "",
  color: "",
  mesh: "",
  comment: "",
  preferredDate: "",
  consent: false,
};

export default function Calculator() {
  const [values, setValues] = useState<LeadInput>(empty);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [leadId, setLeadId] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoError, setPhotoError] = useState("");
  const [ai, setAi] = useState<{ summary: string; turns: number } | null>(null);
  const [highlight, setHighlight] = useState(false);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");

  /** Синхронный флаг: защищает от двойного нажатия до обновления состояния */
  const sendingRef = useRef(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const legendRef = useRef<HTMLSpanElement | null>(null);
  const firstRender = useRef(true);

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

  const setSize = (nextWidth: string, nextHeight: string) => {
    setWidth(nextWidth);
    setHeight(nextHeight);
    const clean = (v: string) => v.replace(/\D/g, "").slice(0, 5);
    const w = clean(nextWidth);
    const h = clean(nextHeight);
    set("size", w && h ? `${w} × ${h} мм` : w ? `${w} × ? мм` : h ? `? × ${h} мм` : "");
  };

  /** Каталог подставляет изделие, консультант — резюме диалога. */
  useEffect(() => {
    const onProduct = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      if (!detail) return;
      setValues((prev) => ({ ...prev, product: detail }));
      setErrors((prev) => ({ ...prev, product: undefined }));
      setStep(0);
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

  /** При смене этапа: вернуть карточку в поле зрения и перевести фокус. */
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    scrollToElement(cardRef.current, 88);
    legendRef.current?.focus();
  }, [step]);

  const waHref = useMemo(
    () =>
      waLink(0, leadToMessage({ ...values, product: values.product || "Окно / конструкция" })),
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
    if (photos.length + accepted.length > MAX_PHOTOS) {
      setPhotoError(`Можно приложить не больше ${MAX_PHOTOS} фотографий.`);
    }
    setPhotos([...photos, ...accepted].slice(0, MAX_PHOTOS));
    const input = document.getElementById("lead-photos") as HTMLInputElement | null;
    if (input) input.value = "";
  }

  /** Ошибки только текущего этапа — чтобы не пугать раньше времени. */
  function stepErrors(index: number): LeadErrors {
    const { errors: all } = validateLead(values);
    if (index === 0 && !values.product) {
      all.product = "Выберите, что требуется";
    }
    const scoped: LeadErrors = {};
    for (const key of STEP_FIELDS[index] ?? []) {
      if (all[key]) scoped[key] = all[key];
    }
    return scoped;
  }

  /** Фокус на проблемном поле; для групп плиток — на первый вариант. */
  function focusField(key: string) {
    const direct = document.getElementById(FIELD_IDS[key] ?? key);
    if (direct) {
      direct.focus();
      return;
    }
    document.querySelector<HTMLInputElement>(`input[name="${key}"]`)?.focus();
  }

  function goNext() {
    const found = stepErrors(step);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      focusField(Object.keys(found)[0]);
      return;
    }
    setErrors({});
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  }

  function goBack() {
    setErrors({});
    setStep((current) => Math.max(current - 1, 0));
  }

  function jumpTo(index: number) {
    if (index === step) return;
    setErrors({});
    setStep(index);
  }

  async function submit() {
    const { ok, errors: found } = validateLead(values);
    if (!ok) {
      setErrors(found);
      // Переносим пользователя на этап с первой ошибкой
      const badStep = STEP_FIELDS.findIndex((fields) =>
        fields.some((field) => Boolean(found[field])),
      );
      if (badStep >= 0 && badStep !== step) setStep(badStep);
      const first = Object.keys(found)[0];
      window.setTimeout(() => focusField(first), 260);
      return;
    }

    if (sendingRef.current) return;
    sendingRef.current = true;

    setStatus("sending");
    setServerMessage("");

    const form = new FormData();
    for (const [key, value] of Object.entries(values)) {
      form.append(key, String(value));
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
        setWidth("");
        setHeight("");
        setStep(0);
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
    } finally {
      sendingRef.current = false;
    }
  }

  const summary = [
    {
      step: 0,
      label: "Изделие",
      value: values.product || "не выбрано",
    },
    {
      step: 1,
      label: "Объём",
      value:
        [
          values.size,
          values.qty ? `${values.qty} шт.` : "",
          values.preferredDate ? `замер ${values.preferredDate}` : "",
        ]
          .filter(Boolean)
          .join(" · ") || "уточним при звонке",
    },
    {
      step: 2,
      label: "Параметры",
      value:
        [
          values.system && values.system !== "Не знаю — подскажите" ? values.system : "",
          values.color && values.color !== "Не знаю — подскажите" ? values.color : "",
          values.mesh && values.mesh !== "Не нужно" ? values.mesh : "",
          photos.length ? `${photos.length} фото` : "",
        ]
          .filter(Boolean)
          .join(" · ") || "подберём сами",
    },
  ];

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
                Четыре коротких шага
              </h2>
              <p className="mt-5 text-[16px] leading-[1.65] text-ink-2">
                Никаких длинных анкет: на каждом шаге одно-два поля. Достаточно
                примерных размеров и телефона, остальное уточнит менеджер, а
                точные цифры снимет замерщик — выезд бесплатный.
              </p>

              <ul className="mt-8 space-y-4 border-t border-line pt-6">
                {[
                  "Замер, доставка и монтаж — бесплатно.",
                  "Можно приложить фото проёма или дома — так точнее.",
                  "Цену считает человек по вашей заявке, а не «калькулятор наугад».",
                ].map((line) => (
                  <li key={line} className="flex gap-3 text-[14.5px] leading-[1.6] text-ink-2">
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
              ref={cardRef}
              className={`border bg-paper transition-colors duration-500 ${
                highlight ? "border-accent" : "border-line"
              }`}
              data-reveal
            >
              {status === "idle" || status === "sending" ? (
                <>
                  {/* Прогресс: только цифры на телефоне, с подписями шире */}
                  <div className="border-b border-line p-5 pb-4 sm:p-8 sm:pb-6">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="eyebrow">Пошаговая заявка</p>
                      <p className="text-[12px] font-semibold tracking-[0.1em] text-ink-3">
                        ШАГ {step + 1} ИЗ {STEPS.length}
                      </p>
                    </div>

                    <ol className="mt-4 grid grid-cols-4 gap-px bg-line">
                      {STEPS.map((item, index) => {
                        const done = index < step;
                        const active = index === step;
                        return (
                          <li key={item.key} className="bg-paper">
                            <button
                              type="button"
                              onClick={() => (index < step ? jumpTo(index) : undefined)}
                              disabled={index > step}
                              aria-current={active ? "step" : undefined}
                              aria-label={`Шаг ${index + 1}: ${item.short}`}
                              className={`group w-full px-1 pb-3 pt-1 text-left ${
                                index < step ? "cursor-pointer" : "cursor-default"
                              }`}
                            >
                              <span
                                className={`block text-[12px] font-semibold tracking-[0.14em] ${
                                  active ? "text-ink" : done ? "text-ink-2" : "text-ink-3"
                                }`}
                              >
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <span
                                className={`mt-1 hidden text-[12px] leading-tight sm:block ${
                                  active ? "text-ink" : "text-ink-3"
                                }`}
                              >
                                {item.short}
                              </span>
                              <span
                                aria-hidden="true"
                                className={`mt-2 block h-1 w-full transition-colors ${
                                  active ? "bg-accent" : done ? "bg-ink" : "bg-line-2"
                                }`}
                              />
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </div>

                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (status === "sending") return;
                      if (step < STEPS.length - 1) goNext();
                      else void submit();
                    }}
                    noValidate
                    className="p-5 sm:p-8 lg:p-10"
                  >
                    <p aria-live="polite" className="sr-only">
                      Шаг {step + 1} из {STEPS.length}: {STEPS[step].title}
                    </p>

                    <fieldset>
                      <legend className="w-full">
                        <span
                          ref={legendRef}
                          tabIndex={-1}
                          className="block text-[19px] font-semibold tracking-[-0.02em] outline-none sm:text-[21px]"
                        >
                          {STEPS[step].title}
                        </span>
                        <span className="mt-2 block text-[13.5px] leading-[1.55] text-ink-3">
                          {STEPS[step].hint}
                        </span>
                      </legend>

                      {ai?.summary && step === 0 && (
                        <p className="mt-5 border border-accent/30 bg-accent-tint px-3.5 py-3 text-[13px] leading-[1.55] text-accent-ink">
                          Из диалога с консультантом: {ai.summary}
                        </p>
                      )}

                      {/* ---------------- Шаг 1 ---------------- */}
                      {step === 0 && (
                        <div className="mt-6 space-y-7">
                          <div id="lead-product-group">
                            <span className="field-label">
                              Что требуется <span className="text-accent">*</span>
                            </span>
                            <OptionTiles
                              name="product"
                              options={productOptions}
                              value={values.product}
                              onChange={(next) => set("product", next)}
                              ariaLabel="Что требуется"
                            />
                            {errors.product && (
                              <FieldError id="lead-product-error">{errors.product}</FieldError>
                            )}
                          </div>

                          <div>
                            <span className="field-label">Тип объекта</span>
                            <ChipGroup
                              name="objectType"
                              options={objectTypeOptions}
                              value={values.objectType}
                              onChange={(next) => set("objectType", next)}
                              ariaLabel="Тип объекта"
                            />
                          </div>
                        </div>
                      )}

                      {/* ---------------- Шаг 2 ---------------- */}
                      {step === 1 && (
                        <div className="mt-6 space-y-7">
                          <div>
                            <span className="field-label">Примерные размеры проёма</span>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <input
                                  id="lead-width"
                                  className="field"
                                  inputMode="numeric"
                                  placeholder="Ширина, мм"
                                  aria-label="Ширина в миллиметрах"
                                  value={width}
                                  onChange={(event) =>
                                    setSize(event.target.value, height)
                                  }
                                />
                              </div>
                              <div>
                                <input
                                  id="lead-height"
                                  className="field"
                                  inputMode="numeric"
                                  placeholder="Высота, мм"
                                  aria-label="Высота в миллиметрах"
                                  value={height}
                                  onChange={(event) =>
                                    setSize(width, event.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
                              <p className="text-[12.5px] text-ink-3">
                                Например, 1300 × 1400 — этого достаточно.
                              </p>
                              <button
                                type="button"
                                onClick={() => {
                                  setWidth("");
                                  setHeight("");
                                  set("size", "");
                                  goNext();
                                }}
                                className="min-h-9 text-[12.5px] font-semibold text-ink underline decoration-accent/40 underline-offset-4"
                              >
                                Не знаю размеров
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="field-label" id="lead-qty-label">
                              Количество конструкций
                            </span>
                            <QtyStepper
                              id="lead-qty"
                              value={values.qty}
                              onChange={(next) => set("qty", next)}
                            />
                            {errors.qty && (
                              <FieldError id="lead-qty-error">{errors.qty}</FieldError>
                            )}
                          </div>

                          <div>
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
                        </div>
                      )}

                      {/* ---------------- Шаг 3 ---------------- */}
                      {step === 2 && (
                        <div className="mt-6 space-y-7">
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
                            <span className="field-label">Цвет профиля</span>
                            <ChipGroup
                              name="color"
                              options={colorOptions}
                              value={values.color}
                              onChange={(next) => set("color", next)}
                              ariaLabel="Цвет профиля"
                            />
                          </div>

                          <div>
                            <span className="field-label">Москитные сетки</span>
                            <ChipGroup
                              name="mesh"
                              options={meshOptions}
                              value={values.mesh}
                              onChange={(next) => set("mesh", next)}
                              ariaLabel="Москитные сетки"
                            />
                          </div>

                          <div>
                            <span className="field-label">Фотографии объекта</span>
                            <PhotoPicker
                              photos={photos}
                              previews={previews}
                              onAdd={addPhotos}
                              onRemove={(index) =>
                                setPhotos((prev) => prev.filter((_, i) => i !== index))
                              }
                              onClearError={() => setPhotoError("")}
                              error={photoError}
                              max={MAX_PHOTOS}
                            />
                          </div>

                          <div>
                            <label className="field-label" htmlFor="lead-comment">
                              Пожелания
                            </label>
                            <textarea
                              id="lead-comment"
                              className="field min-h-24 resize-y"
                              placeholder="Этаж, сторона света, шум с улицы, что не устраивает в текущих окнах"
                              value={values.comment}
                              onChange={(event) => set("comment", event.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      {/* ---------------- Шаг 4 ---------------- */}
                      {step === 3 && (
                        <div className="mt-6 space-y-7">
                          <dl className="border border-line">
                            {summary.map((row) => (
                              <div
                                key={row.label}
                                className="flex items-start justify-between gap-4 border-b border-line px-4 py-3 last:border-b-0"
                              >
                                <dt className="w-24 shrink-0 text-[12px] uppercase tracking-[0.12em] text-ink-3">
                                  {row.label}
                                </dt>
                                <dd className="flex-1 text-[14px] leading-[1.5] text-ink-2">
                                  {row.value}
                                </dd>
                                <button
                                  type="button"
                                  onClick={() => jumpTo(row.step)}
                                  className="min-h-8 shrink-0 text-[12.5px] font-semibold text-ink underline decoration-accent/40 underline-offset-4"
                                >
                                  изменить
                                </button>
                              </div>
                            ))}
                          </dl>

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
                            {errors.name && (
                              <FieldError id="lead-name-error">{errors.name}</FieldError>
                            )}
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
                            {errors.phone && (
                              <FieldError id="lead-phone-error">{errors.phone}</FieldError>
                            )}
                          </div>

                          <div>
                            <span className="field-label">Предпочтительный способ связи</span>
                            <ChipGroup
                              name="contactMethod"
                              options={contactMethodOptions.map((m) => m.label)}
                              value={values.contactMethod}
                              onChange={(next) => set("contactMethod", next)}
                              ariaLabel="Способ связи"
                            />
                          </div>

                          <div aria-hidden="true" className="hidden">
                            <label htmlFor="company">Компания</label>
                            <input id="company" name="company" tabIndex={-1} autoComplete="off" />
                          </div>

                          <div>
                            <label className="flex min-h-11 cursor-pointer items-start gap-3 text-[13px] leading-[1.55] text-ink-2">
                              <input
                                id="lead-consent"
                                type="checkbox"
                                checked={values.consent}
                                onChange={(event) => set("consent", event.target.checked)}
                                aria-invalid={Boolean(errors.consent)}
                                aria-describedby={
                                  errors.consent ? "lead-consent-error" : undefined
                                }
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
                      )}
                    </fieldset>

                    {/* Навигация по этапам */}
                    <div className="mt-9 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
                      {step > 0 && (
                        <button
                          type="button"
                          onClick={goBack}
                          className="btn btn-outline sm:order-1"
                        >
                          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                          Назад
                        </button>
                      )}

                      <button
                        type="submit"
                        className="btn btn-accent w-full sm:order-2 sm:w-auto"
                        disabled={status === "sending"}
                      >
                        {status === "sending" ? (
                          <>
                            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                            Отправляем…
                          </>
                        ) : step < STEPS.length - 1 ? (
                          <>
                            Далее
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </>
                        ) : (
                          "Получить расчёт"
                        )}
                      </button>

                      <p className="text-[12.5px] leading-[1.5] text-ink-3 sm:order-3 sm:ml-auto sm:text-right">
                        {step < STEPS.length - 1 ? (
                          <>
                            Или сразу{" "}
                            <a
                              href={waHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2 font-semibold text-ink underline decoration-accent/40 underline-offset-2"
                            >
                              напишите в WhatsApp
                            </a>
                          </>
                        ) : (
                          <>
                            Согласие — и мы передадим заявку менеджеру. Телефоны:{" "}
                            {company.phones[0].label}
                          </>
                        )}
                      </p>
                    </div>
                  </form>
                </>
              ) : status === "sent" ? (
                <div className="p-5 sm:p-8 lg:p-10">
                  <Outcome
                    tone="success"
                    title="Заявка принята"
                    text={`Мы сохранили заявку${leadId ? ` под номером ${leadId}` : ""} и передали её менеджеру. Он свяжется с вами, уточнит детали и подготовит расчёт.`}
                    waHref={waLink(0, `Здравствуйте! Я отправил(а) заявку ${leadId} с сайта.`)}
                  />
                </div>
              ) : status === "fallback" ? (
                <div className="p-5 sm:p-8 lg:p-10">
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
                </div>
              ) : (
                <div className="p-5 sm:p-8 lg:p-10">
                  <Outcome
                    tone="error"
                    title="Не удалось передать заявку"
                    text={serverMessage}
                    waHref={waHref}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
