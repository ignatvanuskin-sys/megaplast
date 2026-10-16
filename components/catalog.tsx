import Image from "next/image";
import CatalogCta from "@/components/catalog-cta";
import { catalog } from "@/data/catalog";
import { extraRubrics } from "@/data/site";

/** Премиальный каталог: крупные визуалы, короткие описания, переход к расчёту. */
export default function Catalog() {
  const featured = catalog.filter((item) => item.feature);
  const rest = catalog.filter((item) => !item.feature);

  return (
    <section id="katalog" className="scroll-mt-24 py-16 sm:py-20 lg:py-28">
      <div className="shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[44rem]" data-reveal>
            <p className="eyebrow">Каталог</p>
            <h2 className="mt-4 text-[clamp(1.75rem,4.2vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              Категории, из которых собирается объект
            </h2>
            <p className="mt-5 text-[16px] leading-[1.65] text-ink-2">
              Шесть направлений: окна из ПВХ и алюминия, двери, витражи,
              балконы, москитные сетки. Выберите категорию — форма расчёта
              подставит изделие сама.
            </p>
          </div>
          <CatalogCta
            product="Пластиковые окна (ПВХ)"
            label="Перейти к расчёту"
            variant="solid"
          />
        </div>

        {/* Две крупные категории */}
        <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-2 lg:gap-10">
          {featured.map((item, index) => (
            <article
              key={item.id}
              className="group"
              data-reveal
              style={{ "--reveal-delay": `${index * 70}ms` } as React.CSSProperties}
            >
              <div className="frame aspect-4/5 sm:aspect-4/3 lg:aspect-4/5">
                <Image
                  src={item.image}
                  alt={item.imageAlt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 1023px) 100vw, 46vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.03]"
                />
              </div>

              <h3 className="mt-5 text-[clamp(1.35rem,2.6vw,1.85rem)] font-semibold leading-[1.12] tracking-[-0.025em]">
                {item.title}
              </h3>
              <p className="mt-3 max-w-[34rem] text-[14.5px] leading-[1.6] text-ink-2">
                {item.tagline}
              </p>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                {item.specs.map((spec) => (
                  <li
                    key={spec}
                    className="text-[12.5px] uppercase tracking-[0.1em] text-ink-3"
                  >
                    {spec}
                  </li>
                ))}
              </ul>
              <div className="mt-5 border-t border-line pt-4">
                <CatalogCta product={item.formValue} label="Рассчитать этот вариант" />
              </div>
            </article>
          ))}
        </div>

        {/* Остальные категории */}
        <div className="mt-12 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:mt-16 lg:grid-cols-4">
          {rest.map((item, index) => (
            <article
              key={item.id}
              className="group border-t border-line pt-5"
              data-reveal
              style={{ "--reveal-delay": `${(index % 4) * 60}ms` } as React.CSSProperties}
            >
              <div className="frame aspect-4/3">
                <Image
                  src={item.image}
                  alt={item.imageAlt}
                  fill
                  loading="lazy"
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 45vw, 22vw"
                  className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                />
              </div>
              <h3 className="mt-4 text-[17px] font-semibold leading-[1.25] tracking-[-0.02em]">
                {item.title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-[1.55] text-ink-2">
                {item.tagline}
              </p>
              <ul className="mt-3 space-y-1">
                {item.specs.map((spec) => (
                  <li key={spec} className="text-[12.5px] text-ink-3">
                    {spec}
                  </li>
                ))}
              </ul>
              <div className="mt-4">
                <CatalogCta product={item.formValue} label="Рассчитать" />
              </div>
            </article>
          ))}
        </div>

        <p className="mt-10 text-[13.5px] leading-[1.6] text-ink-3" data-reveal>
          Также в карточке компании указаны направления:{" "}
          {extraRubrics.join(" · ").toLowerCase()}.
        </p>
      </div>
    </section>
  );
}
