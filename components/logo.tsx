import { company } from "@/data/site";

/**
 * Логотип-марка: два зеркальных оконных контура из фирменного знака
 * (в оригинале — синий и зелёный) в палитре сайта: графит + глубокий изумруд.
 */
export function LogoMark({
  className = "h-8 w-8",
  tone = "dark",
}: {
  className?: string;
  tone?: "dark" | "light";
}) {
  const a = tone === "dark" ? "#111315" : "#f7f5f1";
  const b = tone === "dark" ? "#1f6b4f" : "#2b8262";

  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 6h18v36H4z"
        stroke={a}
        strokeWidth="3.4"
        strokeLinejoin="miter"
      />
      <path
        d="M22 6h18v36H22z"
        stroke={b}
        strokeWidth="3.4"
        strokeLinejoin="miter"
      />
      <path d="M22 6v36" stroke={a} strokeWidth="3.4" />
    </svg>
  );
}

export function Wordmark({
  tone = "dark",
  className = "",
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <span
      className={`font-semibold leading-none tracking-[-0.02em] ${
        tone === "dark" ? "text-ink" : "text-paper"
      } ${className}`}
    >
      MEGA<span className="text-accent-2 ml-[0.32em]">PLAST</span>
    </span>
  );
}

export default function Logo({
  tone = "dark",
  compact = false,
}: {
  tone?: "dark" | "light";
  compact?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark
        tone={tone}
        className={compact ? "h-7 w-7" : "h-8 w-8 sm:h-9 sm:w-9"}
      />
      <span className="flex flex-col">
        <Wordmark
          tone={tone}
          className={compact ? "text-[15px]" : "text-[16px] sm:text-[17px]"}
        />
        <span
          className={`mt-1 text-[12px] font-medium uppercase leading-none tracking-[0.14em] ${
            tone === "dark" ? "text-ink-3" : "text-paper/60"
          }`}
        >
          {company.city}
        </span>
      </span>
      <span className="sr-only">
        {company.fullName} — {company.descriptor}
      </span>
    </span>
  );
}
