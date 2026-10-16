import Image from "next/image";
import { ArrowRight, MessageCircle } from "lucide-react";
import { company, heroFacts, profileSystems, waLink } from "@/data/site";

/**
 * Первый экран.
 *
 * Телефон: фотография отдельной полосой сверху — её видно целиком, текст ниже
 * лежит на глухой графитовой панели, поэтому контраст не зависит от кадра.
 * Широкий экран: фотография становится фоном всей шапки, а затемнение
 * остаётся только слева под текстом — правая часть снимка видна.
 *
 * Фотография поднята под шапку отрицательным отступом: шапка лежит прямо на
 * снимке и переключает текст на светлый (см. site-header).
 */
export default function Hero() {
  return (
    <section id="top" className="relative isolate -mt-16 lg:-mt-20">
      {/* Фотография объекта */}
      <div className="hero-media relative overflow-hidden bg-ink lg:absolute lg:inset-0 lg:h-auto">
        <Image
          src="/images/projects/project-05.jpg"
          alt="Фасад с рядом установленных белых окон — объект MEGAPLAST KZ в Алматы"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-[50%_34%] lg:object-[50%_30%]"
        />

        {/* Затемнение сверху — под светлую шапку */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-ink/85 to-transparent sm:h-28 lg:h-32"
        />

        {/* Мягкий переход к панели с текстом на телефоне */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-b from-transparent to-ink lg:hidden"
        />

        {/* На широком экране затемняем только левую часть под текстом */}
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden bg-linear-to-r from-ink/92 via-ink/55 to-ink/10 lg:block"
        />

        {/* Техническая плашка — только на широком экране */}
        <div className="absolute right-0 top-24 hidden border-b border-l border-paper/25 px-5 py-3 text-right lg:block">
          <span className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-paper/60">
            Система
          </span>
          <span className="mt-1 block text-[14px] font-semibold text-paper">
            KS Helios · 70 мм
          </span>
        </div>
      </div>

      {/* Текст: на телефоне — графитовая панель, на широком экране — поверх фото */}
      <div className="hero-photo relative flex items-end bg-ink lg:bg-transparent">
        <div className="shell w-full pb-10 pt-8 sm:pb-14 lg:pb-20 lg:pt-44">
          <div className="max-w-[46rem]">
            <p className="eyebrow text-paper/80" data-reveal>
              {company.city} · окна и остекление
            </p>

            <h1
              className="mt-5 text-[clamp(2.1rem,7.4vw,4.25rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-paper lg:mt-6"
              data-reveal
              style={{ "--reveal-delay": "60ms" } as React.CSSProperties}
            >
              Окна, которые
              <br />
              меняют пространство
            </h1>

            <p
              className="mt-5 max-w-[34rem] text-[clamp(1rem,1.15vw,1.125rem)] leading-[1.6] text-paper/85"
              data-reveal
              style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
            >
              Окна из ПВХ и алюминия, двери, витражи и остекление балконов.
              Замер, доставка и монтаж — бесплатно.
            </p>

            <div
              className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
              data-reveal
              style={{ "--reveal-delay": "180ms" } as React.CSSProperties}
            >
              <a href="/#raschet" className="btn btn-accent group">
                Рассчитать стоимость
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </a>
              <a
                href="/#proekty"
                className="btn border border-paper/35 text-paper hover:border-paper hover:bg-paper/10"
              >
                Смотреть проекты
              </a>
            </div>

            <dl
              className="mt-8 grid grid-cols-3 gap-4 border-t border-paper/25 pt-5"
              data-reveal
              style={{ "--reveal-delay": "220ms" } as React.CSSProperties}
            >
              {heroFacts.map((fact) => (
                <div key={fact.label}>
                  <dt className="sr-only">{fact.label}</dt>
                  <dd>
                    <span className="block text-[clamp(1.25rem,2.2vw,1.75rem)] font-semibold leading-none tracking-[-0.03em] text-paper">
                      {fact.value}
                    </span>
                    <span className="mt-2 block text-[12px] font-medium uppercase tracking-[0.14em] text-paper/75">
                      {fact.label}
                    </span>
                    <span className="mt-1 block text-[12px] text-paper/70">
                      {fact.sub}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-paper/20 pt-4 text-[12px] uppercase tracking-[0.12em] text-paper/75">
            <span>Фото объекта из карточки компании в 2ГИС</span>
            <a
              href={waLink(0, "Здравствуйте! Хочу рассчитать стоимость окон.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-8 items-center gap-2 normal-case tracking-normal text-paper underline decoration-paper/50 underline-offset-4 hover:decoration-paper"
            >
              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Спросить в WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Полоса профильных систем */}
      <div className="border-b border-line bg-paper-2">
        <div className="shell flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="eyebrow shrink-0">Профильные системы</p>
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] font-medium uppercase tracking-[0.1em] text-ink-2">
            {profileSystems.map((system, index) => (
              <li key={system.name} className="flex items-center gap-3">
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="hidden h-1 w-1 rounded-full bg-line-2 sm:block"
                  />
                )}
                <span className={system.type === "Алюминий" ? "text-accent" : ""}>
                  {system.name}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
