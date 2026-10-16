import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminLogin from "@/components/admin/admin-login";
import LeadEditor from "@/components/admin/lead-editor";
import { isAdmin } from "@/lib/auth";
import { getLead, statusLabel } from "@/lib/store";
import { formatPhone } from "@/lib/leads";

export const metadata: Metadata = {
  title: "Заявка",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const fullDateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function LeadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) return <AdminLogin />;

  const { id } = await params;
  const lead = await getLead(decodeURIComponent(id));
  if (!lead) notFound();

  const phone = formatPhone(lead.contact.phone);
  const waNumber = lead.contact.phone.replace(/\D/g, "");
  const waText = encodeURIComponent(
    `Здравствуйте, ${lead.contact.name}! Это MEGAPLAST KZ по заявке ${lead.id}.`,
  );

  const rows: { label: string; value: string }[] = [
    { label: "Изделие", value: lead.request.product },
    { label: "Тип объекта", value: lead.request.objectType },
    { label: "Размеры", value: lead.request.size },
    { label: "Количество", value: lead.request.qty },
    { label: "Система", value: lead.request.system },
    { label: "Цвет профиля", value: lead.request.color },
    { label: "Москитные сетки", value: lead.request.mesh },
    { label: "Желаемая дата замера", value: lead.request.preferredDate },
    { label: "Пожелания", value: lead.request.comment },
  ].filter((row) => row.value.trim() !== "");

  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b border-line bg-paper-2">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <a
              href="/admin"
              className="inline-flex min-h-8 items-center text-[12.5px] text-ink-3 hover:text-ink"
            >
              ← Все заявки
            </a>
            <h1 className="mt-1 flex flex-wrap items-center gap-3 text-[20px] font-semibold tracking-[-0.02em]">
              {lead.id}
              <span className="border border-line-2 px-2.5 py-1 text-[12px] font-medium">
                {statusLabel(lead.status)}
              </span>
            </h1>
            <p className="mt-1 text-[12.5px] text-ink-3">
              Создана {fullDateFormat.format(new Date(lead.createdAt))}
              {lead.updatedAt !== lead.createdAt
                ? ` · обновлена ${fullDateFormat.format(new Date(lead.updatedAt))}`
                : ""}
            </p>
          </div>
        </div>
      </header>

      <div className="shell py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Контакты */}
          <section className="border border-line bg-paper p-5">
            <h2 className="eyebrow">Клиент</h2>
            <p className="mt-3 text-[17px] font-semibold">{lead.contact.name}</p>
            <p className="mt-1 text-[15px] text-ink-2">{phone}</p>
            <p className="mt-1 text-[13px] text-ink-3">
              Предпочитает: {lead.contact.method}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={`tel:${lead.contact.phone}`} className="btn btn-primary">
                Позвонить
              </a>
              <a
                href={`https://wa.me/${waNumber}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                WhatsApp
              </a>
            </div>
            <p className="mt-4 text-[12.5px] text-ink-3">
              Устройство: {lead.source.device || "не определено"}
            </p>
          </section>

          {/* Параметры */}
          <section className="border border-line bg-paper p-5 lg:col-span-2">
            <h2 className="eyebrow">Параметры заказа</h2>
            {rows.length === 0 ? (
              <p className="mt-3 text-[14px] text-ink-2">Клиент не указал параметры.</p>
            ) : (
              <dl className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {rows.map((row) => (
                  <div key={row.label} className="border-b border-line pb-2 last:border-0">
                    <dt className="text-[12px] uppercase tracking-[0.12em] text-ink-3">
                      {row.label}
                    </dt>
                    <dd className="mt-1 text-[14.5px] text-ink-2">{row.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {lead.ai.summary && (
              <div className="mt-5 border border-accent/30 bg-accent-tint p-4">
                <p className="eyebrow text-accent-ink">Диалог с консультантом</p>
                <p className="mt-2 text-[14px] leading-[1.6] text-accent-ink">
                  {lead.ai.summary}
                </p>
              </div>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="eyebrow">Источник</p>
                <p className="mt-2 text-[13.5px] text-ink-2">
                  {lead.source.utm.utm_source || lead.source.utm.source || "прямой заход"}
                  {lead.source.utm.utm_campaign
                    ? ` · ${lead.source.utm.utm_campaign}`
                    : ""}
                </p>
                <p className="mt-1 break-all text-[12.5px] text-ink-3">
                  {lead.source.landing || "адрес не передан"}
                </p>
              </div>
              <div>
                <p className="eyebrow">Фотографии</p>
                <p className="mt-2 text-[13.5px] text-ink-2">
                  {lead.photos.length > 0
                    ? `${lead.photos.length} шт.: ${lead.photos.map((p) => p.name).join(", ")}`
                    : "не приложены"}
                </p>
                {lead.photos.length > 0 && (
                  <p className="mt-1 text-[12.5px] text-ink-3">
                    Файлы переданы менеджеру в Telegram.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6">
          <LeadEditor lead={lead} />
        </div>

        {/* История */}
        <section className="mt-6 border border-line bg-paper p-5">
          <h2 className="eyebrow">История заявки</h2>
          <ol className="mt-4 space-y-3">
            {[...lead.history].reverse().map((entry, index) => (
              <li key={`${entry.at}-${index}`} className="flex gap-4 text-[13.5px]">
                <span className="w-44 shrink-0 text-ink-3">
                  {fullDateFormat.format(new Date(entry.at))}
                </span>
                <span className="text-ink-2">{entry.event}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
