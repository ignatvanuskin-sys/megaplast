"use client";

import { useMemo, useRef, useState } from "react";
import {
  CircleAlert,
  CircleCheck,
  LoaderCircle,
  MessageCircle,
  Phone,
  Ruler,
} from "lucide-react";
import { company, primaryPhone, waLink } from "@/data/site";
import { contactMethods, objectTypes, productOptions } from "@/data/content";
import {
  type LeadErrors,
  type LeadInput,
  formatPhone,
  leadToMessage,
  validateLead,
} from "@/lib/leads";

type Status = "idle" | "sending" | "sent" | "fallback" | "error";

const empty: LeadInput = {
  name: "",
  phone: "",
  contactMethod: "WhatsApp",
  product: "",
  size: "",
  qty: "",
  objectType: "",
  comment: "",
  consent: false,
};

const fieldIds: Record<string, string> = {
  name: "lead-name",
  phone: "lead-phone",
  qty: "lead-qty",
  consent: "lead-consent",
  size: "lead-size",
  comment: "lead-comment",
};

export default function Calculator() {
  const [values, setValues] = useState<LeadInput>(empty);
  const [errors, setErrors] = useState<LeadErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);

  const set = <K extends keyof LeadInput>(key: K, v: LeadInput[K]) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const waHref = useMemo(
    () => waLink(0, leadToMessage({ ...values, product: values.product || "Окно / конструкция" })),
    [values],
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;

    const { ok, errors: found } = validateLead(values);
    if (!ok) {
      setErrors(found);
      const firstKey = Object.keys(found)[0];
      const el = document.getElementById(fieldIds[firstKey] ?? firstKey);
      el?.focus();
      return;
    }

    setStatus("sending");
    setServerMessage("");

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...values,
          company: (formRef.current?.elements.namedItem("company") as HTMLInputElement | null)?.value ?? "",
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        code?: string;
        message?: string;
        errors?: LeadErrors;
      };

      if (res.ok && data.ok) {
        setStatus("sent");
        setValues(empty);
        return;
      }

      if (data.code === "VALIDATION" && data.errors) {
        setErrors(data.errors as LeadErrors);
        setStatus("idle");
        return;
      }

      if (data.code === "NOT_CONFIGURED") {
        setServerMessage(data.message ?? "");
        setStatus("fallback");
        return;
      }

      setServerMessage(data.message ?? "");
      setStatus("error");
    } catch {
      setServerMessage(
        "Сеть недоступна. Позвоните или отправьте заявку в WhatsApp — данные сохранятся в сообщении.",
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
          {/* Пояснение */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28" data-reveal>
              <p className="eyebrow">Подбор решения и расчёт</p>
              <h2 className="mt-4 text-[clamp(1.75rem,4.2vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
                Соберём заявку за минуту — без точных размеров
              </h2>
              <p className="mt-5 text-[16px] leading-[1.65] text-ink-2">
                Для предварительной консультации достаточно примерных размеров и
                пожеланий. Точные цифры снимет замерщик — выезд бесплатный.
                Стоимость менеджер считает по вашей заявке: мы не показываем
                калькулятор с выдуманной ценой.
              </p>

              <ul className="mt-8 space-y-4 border-t border-line pt-6">
                <li className="flex gap-3 text-[14.5px] leading-[1.6] text-ink-2">
                  <Ruler className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  Примерно: «окно 1300 × 1400, три штуки, спальня и кухня».
                </li>
                <li className="flex gap-3 text-[14.5px] leading-[1.6] text-ink-2">
                  <CircleCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  Замер, доставка и монтаж — бесплатно, по данным компании.
                </li>
                <li className="flex gap-3 text-[14.5px] leading-[1.6] text-ink-2">
                  <CircleCheck
                    className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  Ответим в WhatsApp или звонком — как вам удобнее.
                </li>
              </ul>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`tel:${primaryPhone.tel}`}
                  className="btn btn-outline"
                >
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

          {/* Форма */}
          <div className="lg:col-span-7">
            <div
              className="border border-line bg-paper p-5 sm:p-8 lg:p-10"
              data-reveal
            >
              {status === "sent" ? (
                <Outcome
                  tone="success"
                  title="Заявка отправлена"
                  text="Менеджер получил данные и свяжется с вами, чтобы уточнить детали и посчитать стоимость."
                  waHref={waLink(0, "Здравствуйте! Я отправил(а) заявку на сайте. Хочу ускорить расчёт.")}
                />
              ) : status === "fallback" ? (
                <Outcome
                  tone="info"
                  title="Отправим заявку в WhatsApp"
                  text={
                    serverMessage ||
                    "Онлайн-приём заявок ещё не подключён. Нажмите кнопку — сообщение с вашими данными откроется в WhatsApp, останется только отправить."
                  }
                  waHref={waHref}
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
                    Заявка на расчёт стоимости
                  </h3>
                  <p className="mt-2 text-[13.5px] text-ink-3">
                    Поля со звёздочкой обязательны. Остальное — если знаете.
                  </p>

                  <div className="mt-7 grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="field-label" htmlFor="lead-product">
                        Что требуется <span className="text-accent">*</span>
                      </label>
                      <select
                        id="lead-product"
                        className="field appearance-none"
                        value={values.product}
                        onChange={(e) => set("product", e.target.value)}
                        aria-invalid={Boolean(errors.product)}
                      >
                        <option value="">Выберите изделие</option>
                        {productOptions.map((o) => (
                          <option key={o} value={o}>
                            {o}
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
                        onChange={(e) => set("objectType", e.target.value)}
                      >
                        <option value="">Не указано</option>
                        {objectTypes.map((o) => (
                          <option key={o} value={o}>
                            {o}
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
                        onChange={(e) => set("qty", e.target.value)}
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
                        onChange={(e) => set("size", e.target.value)}
                        aria-invalid={Boolean(errors.size)}
                        aria-describedby={errors.size ? "lead-size-error" : undefined}
                      />
                      {errors.size && (
                        <FieldError id="lead-size-error">{errors.size}</FieldError>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="field-label" htmlFor="lead-comment">
                        Пожелания
                      </label>
                      <textarea
                        id="lead-comment"
                        className="field min-h-28 resize-y"
                        placeholder="Этаж, сторона света, шум с улицы, цвет профиля, нужны ли москитные сетки"
                        value={values.comment}
                        onChange={(e) => set("comment", e.target.value)}
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
                        onChange={(e) => set("name", e.target.value)}
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
                        onChange={(e) => set("phone", e.target.value)}
                        onBlur={(e) => {
                          if (e.target.value.trim())
                            set("phone", formatPhone(e.target.value));
                        }}
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={errors.phone ? "lead-phone-error" : undefined}
                      />
                      {errors.phone && (
                        <FieldError id="lead-phone-error">{errors.phone}</FieldError>
                      )}
                    </div>

                    <fieldset className="sm:col-span-2">
                      <legend className="field-label">Предпочтительный способ связи</legend>
                      <div className="flex flex-wrap gap-2">
                        {contactMethods.map((m) => (
                          <label
                            key={m.id}
                            className={`inline-flex min-h-11 cursor-pointer items-center border px-4 text-[14px] font-medium transition-colors ${
                              values.contactMethod === m.label
                                ? "border-accent bg-accent-tint text-accent-ink"
                                : "border-line-2 text-ink-2 hover:border-ink-3"
                            }`}
                          >
                            <input
                              type="radio"
                              name="contactMethod"
                              value={m.label}
                              checked={values.contactMethod === m.label}
                              onChange={() => set("contactMethod", m.label)}
                              className="sr-only"
                            />
                            {m.label}
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    {/* Ловушка для ботов */}
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
                          onChange={(e) => set("consent", e.target.checked)}
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
                      — номер {company.phones[0].label}.
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

function FieldError({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
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
}: {
  tone: "success" | "info" | "error";
  title: string;
  text?: string;
  waHref: string;
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
      {text && <p className="mt-3 max-w-[36rem] text-[14.5px] leading-[1.6] text-ink-2">{text}</p>}

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-accent"
        >
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
