import Image from "next/image";
import { materialGroups, systemSpecs } from "@/data/content";

export default function Materials() {
  return (
    <section
      id="materialy"
      className="scroll-mt-24 border-y border-line bg-paper-2 py-16 sm:py-20 lg:py-28"
    >
      <div className="shell">
        <div className="max-w-[46rem]" data-reveal>
          <p className="eyebrow">Материалы и детали</p>
          <h2 className="mt-4 text-[clamp(1.75rem,4.2vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
            Что внутри конструкции
          </h2>
          <p className="mt-5 text-[16px] leading-[1.65] text-ink-2">
            Мы описываем только те системы и характеристики, которые видно на
            образцах в шоуруме и в списках компании. Если нужна детальная
            спецификация под задачу — попросите её у менеджера при расчёте.
          </p>
        </div>

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-14">
          <figure className="lg:col-span-5" data-reveal>
            <div className="frame aspect-4/5">
              <Image
                src="/images/projects/project-01.jpg"
                alt="Образцы ПВХ-профилей в шоуруме: белый и тёмно-коричневый профиль с карточками систем KS Helios и KS Phoenix"
                fill
                loading="lazy"
                sizes="(max-width: 1023px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 text-[12px] uppercase tracking-[0.12em] text-ink-3">
              Образцы профилей в шоуруме · фото из карточки 2ГИС
            </figcaption>
          </figure>

          <div className="lg:col-span-7">
            <dl>
              {materialGroups.map((g, i) => (
                <div
                  key={g.title}
                  className="border-t border-line py-6 last:border-b"
                  data-reveal
                  style={{ "--reveal-delay": `${(i % 2) * 60}ms` } as React.CSSProperties}
                >
                  <dt className="text-[17px] font-semibold tracking-[-0.015em]">
                    {g.title}
                  </dt>
                  <dd className="mt-3">
                    <p className="max-w-[38rem] text-[14.5px] leading-[1.6] text-ink-2">
                      {g.text}
                    </p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {g.points.map((p) => (
                        <li
                          key={p}
                          className="border border-line-2 px-3 py-1.5 text-[12.5px] font-medium text-ink-2"
                        >
                          {p}
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Сравнение систем */}
        <div className="mt-12 lg:mt-16" data-reveal>
          <p className="eyebrow">Для сравнения</p>
          <div className="mt-5 grid gap-px border border-line bg-line sm:grid-cols-2">
            {systemSpecs.map((s) => (
              <div key={s.name} className="bg-paper p-6 sm:p-8">
                <h3 className="text-[19px] font-semibold tracking-[-0.02em]">
                  {s.name}
                </h3>
                <dl className="mt-5 space-y-3">
                  {[
                    ["Камерность", s.chambers],
                    ["Профиль", s.width],
                    ["Стеклопакет", s.glass],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-baseline justify-between gap-4 border-b border-line pb-3 last:border-0 last:pb-0"
                    >
                      <dt className="text-[13px] uppercase tracking-[0.12em] text-ink-3">
                        {k}
                      </dt>
                      <dd className="text-right text-[14.5px] font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[12.5px] leading-[1.6] text-ink-3">
            Характеристики приведены по карточкам производителя на образцах в
            шоуруме компании. Обе системы отмечены маркировкой европейского
            сертификата качества RAL.
          </p>
        </div>
      </div>
    </section>
  );
}
