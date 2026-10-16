import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminLogin from "@/components/admin/admin-login";
import PrintButton from "@/components/admin/print-button";
import Logo from "@/components/logo";
import { isAdmin } from "@/lib/auth";
import { getLead } from "@/lib/store";
import { formatPhone } from "@/lib/leads";
import { company } from "@/data/site";

export const metadata: Metadata = {
  title: "Коммерческое предложение",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export default async function ProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) return <AdminLogin />;

  const { id } = await params;
  const lead = await getLead(decodeURIComponent(id));
  if (!lead) notFound();

  const proposal = lead.proposal;
  const items = (proposal?.items ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const waText = encodeURIComponent(
    [
      "Коммерческое предложение MEGAPLAST KZ",
      `Заявка ${lead.id}`,
      "",
      ...items,
      "",
      proposal?.price ? `Стоимость: ${proposal.price}` : "",
      proposal?.note ?? "",
      "",
      `Вопросы: ${company.phones[0].label}`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  const waNumber = company.phones[0].wa;

  return (
    <div className="min-h-dvh bg-paper-2">
      {/* Панель действий — не попадает в печать */}
      <div className="no-print border-b border-line bg-paper">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-4">
          <a
            href={`/admin/leads/${lead.id}`}
            className="inline-flex min-h-11 items-center text-[13px] text-ink-3 hover:text-ink"
          >
            ← К заявке {lead.id}
          </a>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`https://wa.me/${waNumber}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              Отправить клиенту в WhatsApp
            </a>
            <PrintButton />
          </div>
        </div>
      </div>

      {!proposal ? (
        <div className="shell py-16">
          <p className="max-w-xl border border-line bg-paper p-6 text-[14.5px] leading-[1.6] text-ink-2">
            Предложение ещё не сформировано. Вернитесь к заявке, укажите стоимость и
            комплектацию — после этого КП можно будет открыть и отправить клиенту.
          </p>
        </div>
      ) : (
        <article className="shell py-10 print:py-0">
          <div className="mx-auto max-w-[52rem] bg-white p-8 shadow-none print:max-w-none print:p-0">
            <header className="flex flex-wrap items-start justify-between gap-6 border-b border-line pb-6">
              <Logo compact />
              <div className="text-right">
                <p className="text-[12px] uppercase tracking-[0.18em] text-ink-3">
                  Коммерческое предложение
                </p>
                <p className="mt-1 text-[14px] font-semibold">{lead.id}</p>
                <p className="mt-0.5 text-[13px] text-ink-3">
                  {dateFormat.format(new Date(proposal.createdAt))}
                </p>
              </div>
            </header>

            <section className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="eyebrow">Заказчик</p>
                <p className="mt-2 text-[16px] font-semibold">{lead.contact.name}</p>
                <p className="mt-1 text-[14px] text-ink-2">{formatPhone(lead.contact.phone)}</p>
              </div>
              <div>
                <p className="eyebrow">Объект</p>
                <p className="mt-2 text-[14px] text-ink-2">
                  {[lead.request.objectType, lead.request.product]
                    .filter((v) => v && v !== "Не указано")
                    .join(" · ") || "уточняется"}
                </p>
                {lead.request.preferredDate && (
                  <p className="mt-1 text-[14px] text-ink-2">
                    Замер: {lead.request.preferredDate}
                  </p>
                )}
              </div>
            </section>

            <section className="mt-8">
              <p className="eyebrow">Комплектация</p>
              {items.length > 0 ? (
                <ol className="mt-3 border-t border-line">
                  {items.map((item, index) => (
                    <li
                      key={`${item}-${index}`}
                      className="flex gap-4 border-b border-line py-3 text-[14.5px] text-ink-2"
                    >
                      <span className="w-6 shrink-0 text-ink-3">{index + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-3 border border-line p-4 text-[14px] text-ink-3">
                  Позиции не заполнены — уточняются при согласовании.
                </p>
              )}
            </section>

            {(lead.request.size || lead.request.qty || lead.request.system || lead.request.color) && (
              <section className="mt-8">
                <p className="eyebrow">Исходные параметры заявки</p>
                <dl className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2">
                  {[
                    ["Размеры", lead.request.size],
                    ["Количество", lead.request.qty],
                    ["Система", lead.request.system],
                    ["Цвет профиля", lead.request.color],
                    ["Москитные сетки", lead.request.mesh],
                  ]
                    .filter(([, value]) => value && value.trim() !== "")
                    .map(([label, value]) => (
                      <div key={label} className="flex gap-3 text-[14px]">
                        <dt className="w-40 shrink-0 text-ink-3">{label}</dt>
                        <dd className="text-ink-2">{value}</dd>
                      </div>
                    ))}
                </dl>
              </section>
            )}

            <section className="mt-8 border-t-2 border-ink pt-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="eyebrow">Стоимость</p>
                <p className="text-[clamp(1.5rem,4vw,2.25rem)] font-semibold leading-none tracking-[-0.03em]">
                  {proposal.price || "уточняется"}
                </p>
              </div>
              {proposal.note && (
                <p className="mt-4 text-[14px] leading-[1.6] text-ink-2">{proposal.note}</p>
              )}
              <p className="mt-4 text-[12.5px] leading-[1.6] text-ink-3">
                Замер, доставка и монтаж выполняются бесплатно. Итоговая стоимость
                подтверждается после замера и фиксируется договором.
              </p>
            </section>

            <footer className="mt-10 grid gap-4 border-t border-line pt-5 text-[13px] text-ink-2 sm:grid-cols-2">
              <div>
                <p className="eyebrow">Компания</p>
                <p className="mt-2">{company.fullName}</p>
                <p className="mt-1 text-ink-3">{company.addressFull}</p>
              </div>
              <div>
                <p className="eyebrow">Контакты</p>
                {company.phones.map((phone) => (
                  <p key={phone.tel} className="mt-2">
                    {phone.label}
                  </p>
                ))}
                <p className="mt-1 text-ink-3">
                  {company.hoursLabel} ({company.hoursNote})
                </p>
              </div>
            </footer>
          </div>
        </article>
      )}
    </div>
  );
}
