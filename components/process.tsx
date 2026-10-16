import { steps } from "@/data/content";

export default function Process() {
  return (
    <section id="process" className="scroll-mt-24 py-16 sm:py-20 lg:py-28">
      <div className="shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-[44rem]" data-reveal>
            <p className="eyebrow">Как проходит заказ</p>
            <h2 className="mt-4 text-[clamp(1.75rem,4.2vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              Шесть шагов от обращения до установки
            </h2>
            <p className="mt-5 text-[16px] leading-[1.65] text-ink-2">
              Мы не обещаем сроков, которые не зафиксированы в договоре. Порядок
              работ выглядит так — сроки и стоимость согласуем на шаге расчёта.
            </p>
          </div>
          <a
            href="#raschet"
            className="btn btn-primary shrink-0 self-start lg:self-auto"
            data-reveal
          >
            Начать с расчёта
          </a>
        </div>

        <ol className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {steps.map((s, i) => (
            <li
              key={s.n}
              className="border-t border-line pt-5"
              data-reveal
              style={{ "--reveal-delay": `${(i % 3) * 70}ms` } as React.CSSProperties}
            >
              <span className="block text-[34px] font-light leading-none tracking-[-0.04em] text-paper-3">
                {s.n}
              </span>
              <h3 className="mt-4 text-[17px] font-semibold leading-[1.3] tracking-[-0.015em]">
                {s.title}
              </h3>
              <p className="mt-2 max-w-[30rem] text-[14.5px] leading-[1.6] text-ink-2">
                {s.text}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
