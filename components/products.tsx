import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { extraRubrics, products } from "@/data/site";

/** Ячейки модульной сетки: на десктопе — 12 колонок с разными пролётами. */
const spans = [
  "sm:col-span-1 lg:col-span-7",
  "sm:col-span-1 lg:col-span-5",
  "sm:col-span-1 lg:col-span-4",
  "sm:col-span-1 lg:col-span-4",
  "sm:col-span-1 lg:col-span-4",
  "sm:col-span-1 lg:col-span-12",
];

const imageAspect = [
  "aspect-4/3 lg:aspect-16/10",
  "aspect-4/3 lg:aspect-4/3",
  "aspect-4/3",
  "aspect-4/3",
  "aspect-4/3",
  "aspect-4/3 lg:aspect-21/9",
];

export default function Products() {
  return (
    <section id="produkciya" className="scroll-mt-24 py-16 sm:py-20 lg:py-28">
      <div className="shell">
        <div className="max-w-[46rem]" data-reveal>
          <p className="eyebrow">Продукция и решения</p>
          <h2 className="mt-4 text-[clamp(1.75rem,4.2vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
            Шесть направлений, из которых собирается объект
          </h2>
          <p className="mt-5 text-[16px] leading-[1.65] text-ink-2">
            Компания изготавливает окна и двери, выполняет остекление больших
            проёмов, балконов и лоджий. Ниже — направления, которые подтверждены
            карточкой в 2ГИС, вывеской офиса и фотографиями работ.
          </p>
        </div>

        <div className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:mt-14 lg:grid-cols-12">
          {products.map((p, i) => {
            const isWide = i === 5;
            return (
              <article
                key={p.id}
                className={`${spans[i]} bg-paper p-5 sm:p-7 lg:p-8 ${
                  isWide ? "lg:flex lg:items-stretch lg:gap-10" : ""
                }`}
                data-reveal
                style={{ "--reveal-delay": `${(i % 3) * 70}ms` } as React.CSSProperties}
              >
                <div className={isWide ? "lg:w-1/2" : ""}>
                  <div className={`frame ${imageAspect[i]}`}>
                    <Image
                      src={p.image}
                      alt={p.imageAlt}
                      fill
                      loading="lazy"
                      sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 40vw"
                      className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                    />
                  </div>
                </div>

                <div className={isWide ? "mt-6 lg:mt-0 lg:flex lg:w-1/2 lg:flex-col lg:justify-center" : ""}>
                  <p className="mt-5 text-[12px] font-semibold tracking-[0.18em] text-ink-3 lg:mt-6">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-[clamp(1.25rem,2vw,1.6rem)] font-semibold leading-[1.15] tracking-[-0.02em]">
                    {p.title}
                  </h3>
                  <p className="mt-3 max-w-[38rem] text-[14.5px] leading-[1.6] text-ink-2">
                    {p.lead}
                  </p>

                  <ul className="mt-5 space-y-2 border-t border-line pt-4">
                    {p.points.map((pt) => (
                      <li
                        key={pt}
                        className="flex gap-3 text-[13.5px] leading-[1.5] text-ink-2"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-px w-3 shrink-0 bg-accent"
                        />
                        {pt}
                      </li>
                    ))}
                  </ul>

                  <a
                    href="#raschet"
                    className="group mt-6 inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold text-ink"
                  >
                    Обсудить проект
                    <ArrowUpRight
                      className="h-4 w-4 text-accent transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-6 text-[13.5px] leading-[1.6] text-ink-3" data-reveal>
          Также в карточке компании указаны направления:{" "}
          {extraRubrics.join(" · ").toLowerCase()}.
        </p>
      </div>
    </section>
  );
}
