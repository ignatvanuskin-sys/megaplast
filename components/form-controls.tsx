"use client";

import {
  Check,
  CircleAlert,
  CircleCheck,
  ImagePlus,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  X,
} from "lucide-react";
import { company, primaryPhone } from "@/data/site";

/** Атомы формы: используются в пошаговой заявке. */

export function FieldError({
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

/** Выбор варианта плиткой на всю ширину — удобно нажимать пальцем. */
export function OptionTiles({
  name,
  options,
  value,
  onChange,
  columns = "sm:grid-cols-2",
  ariaLabel,
}: {
  name: string;
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
  columns?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel ?? name}
      className={`grid gap-px border border-line bg-line ${columns}`}
    >
      {options.map((option) => {
        const active = value === option;
        return (
          <label
            key={option}
            className={`tile flex min-h-14 cursor-pointer items-center gap-3 px-4 py-3 transition-colors ${
              active ? "bg-accent-tint" : "bg-paper hover:bg-paper-2"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={active}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            <span
              aria-hidden="true"
              className={`flex h-5 w-5 shrink-0 items-center justify-center border transition-colors ${
                active ? "border-accent bg-accent text-white" : "border-line-2 bg-white"
              }`}
            >
              {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
            </span>
            <span
              className={`text-[14.5px] leading-[1.35] ${
                active ? "font-semibold text-accent-ink" : "text-ink-2"
              }`}
            >
              {option}
            </span>
          </label>
        );
      })}
    </div>
  );
}

/** Короткие варианты — компактными кнопками выбора. */
export function ChipGroup({
  name,
  options,
  value,
  onChange,
  ariaLabel,
}: {
  name: string;
  options: readonly string[];
  value: string;
  onChange: (next: string) => void;
  ariaLabel?: string;
}) {
  return (
    <div role="radiogroup" aria-label={ariaLabel ?? name} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value === option;
        return (
          <label
            key={option}
            className={`tile inline-flex min-h-11 cursor-pointer items-center border px-4 text-[14px] font-medium transition-colors ${
              active
                ? "border-accent bg-accent-tint text-accent-ink"
                : "border-line-2 text-ink-2 hover:border-ink-3"
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={active}
              onChange={() => onChange(option)}
              className="sr-only"
            />
            {option}
          </label>
        );
      })}
    </div>
  );
}

/** Счётчик количества: минус, число, плюс. */
export function QtyStepper({
  id,
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  min?: number;
  max?: number;
}) {
  const current = Number(value) || 0;
  const clamp = (next: number) => Math.min(Math.max(next, min), max);

  return (
    <div className="flex items-stretch border border-line-2 bg-white">
      <button
        type="button"
        onClick={() => onChange(String(clamp(current - 1)))}
        disabled={current <= min}
        aria-label="Уменьшить количество"
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center text-ink transition-colors hover:bg-paper-2 disabled:opacity-35 disabled:hover:bg-transparent"
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>

      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 2))}
        aria-label="Количество конструкций"
        className="h-12 w-full min-w-0 border-x border-line-2 bg-white text-center text-[16px] font-semibold text-ink outline-none focus:bg-accent-tint/40"
      />

      <button
        type="button"
        onClick={() => onChange(String(clamp(current + 1)))}
        disabled={current >= max}
        aria-label="Увеличить количество"
        className="inline-flex h-12 w-12 shrink-0 items-center justify-center text-ink transition-colors hover:bg-paper-2 disabled:opacity-35 disabled:hover:bg-transparent"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

/** Фотографии объекта: выбор, превью, удаление. */
export function PhotoPicker({
  photos,
  previews,
  onAdd,
  onRemove,
  onClearError,
  error,
  max,
}: {
  photos: File[];
  previews: { file: File; url: string }[];
  onAdd: (files: FileList | null) => void;
  onRemove: (index: number) => void;
  onClearError: () => void;
  error: string;
  max: number;
}) {
  const inputId = "lead-photos";

  return (
    <div>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(event) => onAdd(event.target.files)}
        className="sr-only"
      />

      <label
        htmlFor={inputId}
        className={`tile flex min-h-20 cursor-pointer items-center gap-4 border border-dashed px-4 py-4 transition-colors ${
          photos.length >= max
            ? "border-line-2 opacity-50"
            : "border-line-2 hover:border-accent hover:bg-accent-tint/30"
        }`}
      >
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center border border-line-2 bg-white">
          <ImagePlus className="h-4 w-4 text-accent" aria-hidden="true" />
        </span>
        <span>
          <span className="block text-[14.5px] font-semibold text-ink">
            {photos.length === 0 ? "Приложить фото объекта" : "Добавить ещё"}
          </span>
          <span className="mt-0.5 block text-[12.5px] text-ink-3">
            До {max} фото · JPG, PNG, WEBP · до 8 МБ
          </span>
        </span>
      </label>

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
                onClick={() => onRemove(index)}
                aria-label={`Убрать фото ${index + 1}`}
                className="absolute -right-2 -top-2 inline-flex h-7 w-7 items-center justify-center border border-line bg-paper text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error ? (
        <button
          type="button"
          onClick={onClearError}
          className="mt-2 block text-left text-[12.5px] font-medium text-[#b3261e]"
        >
          {error}
        </button>
      ) : null}
    </div>
  );
}

/** Итоговый экран после отправки или при ошибке. */
export function Outcome({
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
