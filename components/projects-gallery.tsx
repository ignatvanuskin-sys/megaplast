"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Expand, X } from "lucide-react";
import { company, projects } from "@/data/site";

/** Пропорции выравнивают «разные масштабы» кадров: 3/4, 4/5, 4/3. */
const ratio: Record<string, string> = {
  tall: "aspect-3/4",
  normal: "aspect-4/5",
  wide: "aspect-4/3",
};

export default function ProjectsGallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setOpenIndex(null);
    restoreFocus.current?.focus?.();
  }, []);

  const step = useCallback((dir: 1 | -1) => {
    setOpenIndex((i) =>
      i === null ? i : (i + dir + projects.length) % projects.length,
    );
  }, []);

  useEffect(() => {
    if (openIndex === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [openIndex, close, step]);

  const active = openIndex === null ? null : projects[openIndex];

  return (
    <section
      id="proekty"
      className="scroll-mt-24 bg-ink py-16 text-paper sm:py-20 lg:py-28"
    >
      <div className="shell">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between" data-reveal>
          <div className="max-w-[40rem]">
            <p className="eyebrow text-paper/55">Реализованные проекты</p>
            <h2 className="mt-4 text-[clamp(1.75rem,4.2vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              Остекление домов, фасадов и больших проёмов
            </h2>
            <p className="mt-5 text-[15.5px] leading-[1.65] text-paper/70">
              Кадры с объектов компании: частные дома, фасады с рядами окон,
              панорамное остекление и входные группы в тёмной ламинации. Нажмите
              на фотографию, чтобы рассмотреть детали.
            </p>
          </div>

          <a
            href={company.twoGis}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline shrink-0 border-paper/25 text-paper hover:border-paper hover:bg-paper/10"
          >
            Все фото в 2ГИС
          </a>
        </div>

        <div className="mt-10 columns-2 gap-3 sm:gap-4 lg:mt-14 lg:columns-3">
          {projects.map((p, i) => (
            <figure key={p.src} className="mb-3 break-inside-avoid sm:mb-4">
              <button
                type="button"
                onClick={(e) => {
                  restoreFocus.current = e.currentTarget;
                  setOpenIndex(i);
                }}
                className="group relative block w-full overflow-hidden bg-paper/5 text-left"
                aria-label={`Открыть фотографию: ${p.caption}`}
              >
                <div className={`frame ${ratio[p.span ?? "normal"]}`}>
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    loading="lazy"
                    sizes="(max-width: 639px) 50vw, (max-width: 1023px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                  />
                </div>

                <span className="scrim pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <span className="pointer-events-none absolute bottom-0 left-0 right-0 translate-y-2 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="block text-[14px] font-semibold tracking-[-0.01em] text-white">
                    {p.caption}
                  </span>
                  <span className="mt-1 block text-[12px] text-white/70">
                    {p.meta}
                  </span>
                </span>

                <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center bg-paper/0 text-paper opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                  <Expand className="h-4 w-4" aria-hidden="true" />
                </span>
              </button>

              <figcaption className="mt-3 text-[12px] uppercase tracking-[0.12em] text-paper/50">
                {p.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-6 text-[12.5px] leading-[1.6] text-paper/50" data-reveal>
          Фотографии объектов и образцов предоставлены компанией и опубликованы в
          её карточке 2ГИС.
        </p>
      </div>

      {/* Лайтбокс */}
      {active && openIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Фотография: ${active.caption}`}
          className="fixed inset-0 z-[70] flex flex-col bg-ink/97 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <span className="text-[12px] uppercase tracking-[0.18em] text-paper/55">
              {openIndex + 1} / {projects.length}
            </span>
            <button
              ref={closeBtn}
              type="button"
              onClick={close}
              aria-label="Закрыть просмотр"
              className="inline-flex h-11 w-11 items-center justify-center text-paper transition-colors hover:text-accent-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-2 sm:px-6">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Предыдущая фотография"
              className="absolute left-1 z-10 inline-flex h-12 w-12 items-center justify-center bg-paper/10 text-paper backdrop-blur-sm transition-colors hover:bg-paper/20 sm:left-4"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="relative h-full w-full">
              <Image
                key={active.src}
                src={active.src}
                alt={active.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>

            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Следующая фотография"
              className="absolute right-1 z-10 inline-flex h-12 w-12 items-center justify-center bg-paper/10 text-paper backdrop-blur-sm transition-colors hover:bg-paper/20 sm:right-4"
            >
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          <div className="px-4 pb-6 pt-4 sm:px-6">
            <p className="text-[15px] font-semibold text-paper">{active.caption}</p>
            <p className="mt-1 text-[13px] text-paper/60">{active.meta}</p>
          </div>
        </div>
      )}
    </section>
  );
}
