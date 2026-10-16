import { advantages, company } from "@/data/site";

export default function Advantages() {
  return (
    <section
      id="pochemu"
      className="scroll-mt-24 border-y border-line bg-paper-2 py-16 sm:py-20 lg:py-28"
    >
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28" data-reveal>
              <p className="eyebrow">Почему MEGAPLAST</p>
              <h2 className="mt-4 text-[clamp(1.75rem,4.2vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
                Производство, договор и три бесплатные услуги
              </h2>
              <p className="mt-5 text-[16px] leading-[1.65] text-ink-2">
                Мы не пишем «лучшие в Казахстане» и «20 лет на рынке» — этих
                цифр нет в открытых данных компании. Вместо этого — то, что
                можно проверить: условия заказа, линейка профилей, способы
                оплаты и оценки клиентов в 2ГИС.
              </p>

              <a
                href={company.twoGisReviews}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-baseline gap-3 border-t border-line pt-5"
              >
                <span className="text-[2rem] font-semibold leading-none tracking-[-0.03em]">
                  {company.rating.value}
                </span>
                <span className="text-[13px] leading-[1.4] text-ink-3">
                  рейтинг в 2ГИС
                  <br />
                  {company.rating.count} оценок · {company.reviewsCount} отзывов
                </span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-7 lg:col-start-6">
            <ul>
              {advantages.map((a, i) => (
                <li
                  key={a.title}
                  className="grid gap-2 border-t border-line py-6 sm:grid-cols-[3rem_1fr] sm:gap-6 last:border-b"
                  data-reveal
                  style={{ "--reveal-delay": `${(i % 2) * 60}ms` } as React.CSSProperties}
                >
                  <span className="text-[12px] font-semibold tracking-[0.16em] text-ink-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-[17px] font-semibold leading-[1.3] tracking-[-0.015em]">
                      {a.title}
                    </h3>
                    <p className="mt-2 max-w-[34rem] text-[14.5px] leading-[1.6] text-ink-2">
                      {a.text}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3" data-reveal>
              <div>
                <p className="eyebrow">Оплата</p>
                <p className="mt-2 max-w-[30rem] text-[13.5px] leading-[1.6] text-ink-2">
                  {company.payments.join(" · ")}
                </p>
              </div>
              <div>
                <p className="eyebrow">График</p>
                <p className="mt-2 text-[13.5px] text-ink-2">
                  {company.hoursLabel}{" "}
                  <span className="text-ink-3">({company.hoursNote})</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
