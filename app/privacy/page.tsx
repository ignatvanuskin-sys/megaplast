import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import { company } from "@/data/site";

export const metadata: Metadata = {
  title: "Политика обработки персональных данных",
  description:
    "Как MEGAPLAST KZ обрабатывает персональные данные, отправленные через форму заявки на сайте: какие данные собираются, зачем, сколько хранятся и как отозвать согласие.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

const updated = "16 октября 2026 г.";

const blocks: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. Общие положения",
    body: (
      <>
        <p>
          Политика описывает порядок обработки персональных данных посетителей
          сайта {company.fullName} — компании по изготовлению окон, работающей в
          городе {company.city} ({company.addressFull}).
        </p>
        <p>
          Оператор обрабатывает данные в объёме, который посетитель передаёт
          добровольно через форму заявки на этом сайте и при обращении по
          указанным ниже контактам.
        </p>
      </>
    ),
  },
  {
    title: "2. Какие данные мы получаем",
    body: (
      <>
        <p>Через форму заявки передаются только данные, необходимые для расчёта:</p>
        <ul>
          <li>имя, указанное в форме;</li>
          <li>номер телефона;</li>
          <li>
            предпочтительный способ связи (WhatsApp, звонок или любой удобный);
          </li>
          <li>
            параметры запроса: вид изделия, тип объекта, примерные размеры,
            количество конструкций и комментарий, если вы его оставили.
          </li>
        </ul>
        <p>
          Сайт не использует маркетинговые cookie, не устанавливает счётчики
          веб-аналитики и не собирает данные о поведении посетителей.
        </p>
      </>
    ),
  },
  {
    title: "3. Зачем обрабатываются данные",
    body: (
      <ul>
        <li>подготовить предварительный расчёт стоимости и подобрать конструкцию;</li>
        <li>связаться с вами по указанному номеру для уточнения деталей;</li>
        <li>согласовать замер и дальнейшее оформление заказа.</li>
      </ul>
    ),
  },
  {
    title: "4. Правовое основание и согласие",
    body: (
      <p>
        Обработка выполняется на основании согласия посетителя, которое он
        подтверждает обязательной отметкой в форме перед отправкой заявки.
        Согласие можно отозвать в любой момент — см. раздел 7.
      </p>
    ),
  },
  {
    title: "5. Передача данных третьим лицам",
    body: (
      <p>
        Данные не продаются и не передаются третьим лицам для маркетинга.
        Передача возможна только в объёме, необходимом для исполнения заказа
        (доставка и монтаж), либо по требованию уполномоченных государственных
        органов в случаях, предусмотренных законодательством Республики
        Казахстан.
      </p>
    ),
  },
  {
    title: "6. Хранение и защита",
    body: (
      <p>
        Доступ к заявкам имеет ограниченный круг сотрудников компании.
        Персональные данные хранятся не дольше, чем это нужно для достижения
        целей обработки: заявка, по которой не был оформлен заказ, удаляется по
        истечении 12 месяцев. При отзыве согласия данные удаляются.
      </p>
    ),
  },
  {
    title: "7. Ваши права",
    body: (
      <>
        <p>
          Вы можете запросить информацию об обработке своих данных, потребовать
          их исправления или удаления, а также отозвать согласие.
        </p>
        <p>
          Для этого позвоните по номеру{" "}
          <a href={`tel:${company.phones[0].tel}`}>{company.phones[0].label}</a>{" "}
          или напишите в WhatsApp на тот же номер. Мы обработаем обращение в
          разумный срок и подтвердим удаление данных.
        </p>
      </>
    ),
  },
  {
    title: "8. Изменения политики",
    body: (
      <p>
        Актуальная редакция всегда опубликована на этой странице. Дата последнего
        обновления указана в начале документа.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="shell py-14 lg:py-20">
        <div className="max-w-[46rem]">
          <p className="eyebrow">Документы</p>
          <h1 className="mt-4 text-[clamp(1.9rem,4.6vw,2.9rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
            Политика обработки персональных данных
          </h1>
          <p className="mt-4 text-[13px] text-ink-3">
            Редакция от {updated}
          </p>

          <div className="mt-10 space-y-10">
            {blocks.map((b) => (
              <section key={b.title} className="border-t border-line pt-6">
                <h2 className="text-[18px] font-semibold tracking-[-0.02em]">
                  {b.title}
                </h2>
                <div className="mt-3 space-y-3 text-[15px] leading-[1.68] text-ink-2 [&_a]:py-2 [&_a]:text-ink [&_a]:underline [&_a]:decoration-accent/40 [&_a]:underline-offset-2 [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-[0.72em] [&_li]:before:h-px [&_li]:before:w-3 [&_li]:before:bg-accent [&_ul]:space-y-2">
                  {b.body}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-12 border border-line bg-paper-2 p-6">
            <h2 className="text-[15px] font-semibold">Контакты по вопросам данных</h2>
            <p className="mt-3 text-[14.5px] leading-[1.65] text-ink-2">
              {company.fullName}, {company.addressFull}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-6 text-[14.5px]">
              {company.phones.map((p) => (
                <a
                  key={p.tel}
                  href={`tel:${p.tel}`}
                  className="inline-flex min-h-11 items-center font-semibold text-ink hover:text-accent"
                >
                  {p.label}
                </a>
              ))}
              <a
                href={company.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center font-semibold text-ink hover:text-accent"
              >
                {company.instagramHandle}
              </a>
            </div>
          </div>

          <a
            href="/"
            className="mt-10 inline-flex min-h-11 items-center text-[14px] font-semibold text-ink"
          >
            ← Вернуться на главную
          </a>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
