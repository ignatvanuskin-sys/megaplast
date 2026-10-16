import { Star } from "lucide-react";
import { company, reviews } from "@/data/site";

export default function Reviews() {
  return (
    <section id="otzyvy" className="scroll-mt-24 py-16 sm:py-20 lg:py-28">
      <div className="shell">
        <div className="flex flex-col gap-8 border-b border-line pb-10 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[42rem]" data-reveal>
            <p className="eyebrow">Отзывы</p>
            <h2 className="mt-4 text-[clamp(1.75rem,4.2vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              Что говорят клиенты
            </h2>
            <p className="mt-5 text-[16px] leading-[1.65] text-ink-2">
              Тексты отзывов приведены как есть — из карточки компании в 2ГИС. Мы
              не пишем отзывы за клиентов и не придумываем имена.
            </p>
          </div>

          <div className="flex items-center gap-6" data-reveal>
            <div>
              <div className="flex items-center gap-1.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-accent text-accent"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <p className="mt-2 text-[13px] text-ink-3">
                <span className="text-[15px] font-semibold text-ink">
                  {company.rating.value}
                </span>{" "}
                · {company.rating.count} оценок · {company.reviewsCount} отзывов
              </p>
            </div>
            <a
              href={company.twoGisReviews}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline shrink-0"
            >
              Отзывы в 2ГИС
            </a>
          </div>
        </div>

        {/* Отзывы — «колонки» текста, без ярких карточек */}
        <div className="mt-10 columns-1 gap-10 sm:columns-2 lg:mt-14 lg:columns-3">
          {reviews.map((r, i) => (
            <figure
              key={`${r.author}-${i}`}
              className="mb-9 break-inside-avoid border-t border-line pt-5"
              data-reveal
              style={{ "--reveal-delay": `${(i % 3) * 60}ms` } as React.CSSProperties}
            >
              <blockquote className="text-[15px] leading-[1.62] text-ink-2">
                «{r.text}»
              </blockquote>
              <figcaption className="mt-4 text-[13px]">
                <span className="font-semibold text-ink">{r.author}</span>
                <span className="text-ink-3"> · {r.date}</span>
                <span className="mt-1 block text-[12px] uppercase tracking-[0.14em] text-ink-3">
                  2ГИС
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-6 text-[12.5px] leading-[1.6] text-ink-3" data-reveal>
          Оценки и отзывы опубликованы посетителями карточки компании в 2ГИС.{" "}
          <a
            href={company.twoGisReviews}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 underline decoration-line-2 underline-offset-2 hover:decoration-accent"
          >
            Проверить источник
          </a>
          .
        </p>
      </div>
    </section>
  );
}
