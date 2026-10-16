import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import { company, heroFacts, profileSystems, waLink } from "@/data/site";

export default function Hero() {
  return (
    <section id="top" className="relative">
      <div className="shell">
        <div className="grid items-center gap-10 pt-10 pb-12 lg:grid-cols-12 lg:gap-14 lg:pt-14 lg:pb-16">
          {/* Текстовая колонка */}
          <div className="lg:col-span-5">
            <p className="eyebrow" data-reveal>
              {company.city} · окна и остекление
            </p>

            <h1
              className="mt-5 text-[clamp(2.1rem,7.4vw,4rem)] font-semibold leading-[0.98] tracking-[-0.035em] lg:mt-6"
              data-reveal
              style={{ "--reveal-delay": "60ms" } as React.CSSProperties}
            >
              Окна, которые
              <br />
              меняют пространство
            </h1>

            <p
              className="mt-6 max-w-[36rem] text-[clamp(1rem,1.15vw,1.125rem)] leading-[1.6] text-ink-2"
              data-reveal
              style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
            >
              Изготавливаем и устанавливаем окна из ПВХ и алюминия, двери,
              витражи и остекление балконов. Замер, доставка и монтаж — три
              услуги, которые компания выполняет бесплатно.
            </p>

            <div
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
              data-reveal
              style={{ "--reveal-delay": "180ms" } as React.CSSProperties}
            >
              <a href="/#raschet" className="btn btn-primary group">
                Рассчитать стоимость
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </a>
              <a href="/#proekty" className="btn btn-outline">
                Смотреть проекты
              </a>
            </div>

            <dl
              className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-6"
              data-reveal
              style={{ "--reveal-delay": "220ms" } as React.CSSProperties}
            >
              {heroFacts.map((f) => (
                <div key={f.label}>
                  <dt className="sr-only">{f.label}</dt>
                  <dd>
                    <span className="block text-[clamp(1.25rem,2.2vw,1.75rem)] font-semibold leading-none tracking-[-0.03em]">
                      {f.value}
                    </span>
                    <span className="mt-2 block text-[12px] font-medium uppercase tracking-[0.14em] text-ink-3">
                      {f.label}
                    </span>
                    <span className="mt-1 block text-[12px] text-ink-3">
                      {f.sub}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Визуал */}
          <div className="lg:col-span-7">
            <figure
              className="relative"
              data-reveal
              style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
            >
              <div className="frame aspect-4/5 lg:aspect-16/11">
                <Image
                  src="/images/projects/project-02.jpg"
                  alt="Белая ПВХ-створка с чёрной ручкой в интерьере: за стеклом городской пейзаж и растение"
                  fill
                  priority
                  fetchPriority="high"
                  sizes="(max-width: 1023px) 100vw, 58vw"
                  className="object-cover"
                />
              </div>

              <figcaption className="mt-3 flex items-start justify-between gap-4 text-[12px] uppercase tracking-[0.12em] text-ink-3">
                <span>Окно ПВХ в интерьере · фото клиента</span>
                <span className="whitespace-nowrap normal-case tracking-normal">
                  Фото: 2ГИС
                </span>
              </figcaption>

              {/* Техническая плашка — архитектурная деталь */}
              <div className="pointer-events-none absolute left-0 top-0 hidden border-r border-b border-line bg-paper px-4 py-3 sm:block">
                <span className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-ink-3">
                  Система
                </span>
                <span className="mt-1 block text-[13px] font-semibold">
                  KS Helios · 70 мм
                </span>
              </div>
            </figure>
          </div>
        </div>
      </div>

      {/* Полоса профильных систем */}
      <div className="border-y border-line bg-paper-2">
        <div className="shell flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="eyebrow shrink-0">Профильные системы</p>
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] font-medium uppercase tracking-[0.1em] text-ink-2">
            {profileSystems.map((p, i) => (
              <li key={p.name} className="flex items-center gap-3">
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="hidden h-1 w-1 rounded-full bg-line-2 sm:block"
                  />
                )}
                <span className={p.type === "Алюминий" ? "text-accent" : ""}>
                  {p.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
