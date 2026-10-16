import type { Metadata } from "next";
import AdminLogin from "@/components/admin/admin-login";
import LogoutButton from "@/components/admin/logout-button";
import { isAdmin } from "@/lib/auth";
import {
  LEAD_STATUSES,
  buildAnalytics,
  listLeads,
  statusLabel,
  storageInfo,
  type LeadStatus,
} from "@/lib/store";

export const metadata: Metadata = {
  title: "Заявки",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const dateFormat = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

function relativeDays(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "сегодня";
  if (days === 1) return "вчера";
  return `${days} дн. назад`;
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  if (!(await isAdmin())) {
    return <AdminLogin />;
  }

  const params = await searchParams;
  const activeFilter = LEAD_STATUSES.some((s) => s.id === params.status)
    ? (params.status as LeadStatus)
    : null;

  const leads = await listLeads();
  const analytics = buildAnalytics(leads);
  const visible = activeFilter ? leads.filter((l) => l.status === activeFilter) : leads;
  const storage = storageInfo();
  const maxDay = Math.max(1, ...analytics.byDay.map((d) => d.count));

  return (
    <div className="min-h-dvh bg-paper">
      <header className="border-b border-line bg-paper-2">
        <div className="shell flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="eyebrow">Панель менеджера</p>
            <h1 className="mt-1 text-[20px] font-semibold tracking-[-0.02em]">
              Заявки MEGAPLAST KZ
            </h1>
          </div>
          <div className="flex items-center gap-5">
            <a
              href="/"
              className="inline-flex min-h-11 items-center text-[13px] font-medium text-ink-2 hover:text-ink"
            >
              Открыть сайт
            </a>
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="shell py-8">
        {/* Диагностика интеграций */}
        <div className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-paper p-4">
            <p className="eyebrow">Хранилище</p>
            <p className="mt-2 text-[14px] font-semibold">
              {storage.kind === "postgres" ? "Postgres" : "Файл .data/leads.json"}
            </p>
            <p
              className={`mt-1 text-[12.5px] ${
                storage.durable ? "text-ink-3" : "text-[#8a4b00]"
              }`}
            >
              {storage.durable
                ? "Заявки сохраняются постоянно"
                : "Внимание: на этом хостинге файлы не сохраняются — укажите DATABASE_URL"}
            </p>
          </div>
          <div className="bg-paper p-4">
            <p className="eyebrow">Уведомления менеджеру</p>
            <p className="mt-2 text-[14px] font-semibold">
              {storage.notifications.telegram
                ? "Telegram подключён"
                : "Telegram не подключён"}
            </p>
            <p className="mt-1 text-[12.5px] text-ink-3">
              {storage.notifications.telegram || storage.notifications.webhook
                ? "Заявки приходят автоматически"
                : "Задайте TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID"}
            </p>
          </div>
          <div className="bg-paper p-4">
            <p className="eyebrow">Всего заявок</p>
            <p className="mt-2 text-[26px] font-semibold leading-none tracking-[-0.03em]">
              {analytics.total}
            </p>
            <p className="mt-1 text-[12.5px] text-ink-3">
              {analytics.withPhotos} с фотографиями · {analytics.conversion.percent}% в заказ
            </p>
          </div>
        </div>

        {/* Аналитика */}
        <section className="mt-8 grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="eyebrow">Обращения за 30 дней</h2>
            <div className="mt-4 flex h-32 items-end gap-1 border-b border-line">
              {analytics.byDay.map((day) => (
                <div
                  key={day.date}
                  className="group relative flex-1 bg-accent/25 transition-colors hover:bg-accent"
                  style={{ height: `${Math.max((day.count / maxDay) * 100, day.count ? 8 : 2)}%` }}
                  title={`${day.date}: ${day.count}`}
                >
                  {day.count > 0 && (
                    <span className="absolute -top-5 left-1/2 hidden -translate-x-1/2 text-[11px] font-semibold text-ink-2 group-hover:block">
                      {day.count}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <p className="mt-2 flex justify-between text-[11.5px] text-ink-3">
              <span>{analytics.byDay[0]?.date}</span>
              <span>{analytics.byDay[analytics.byDay.length - 1]?.date}</span>
            </p>

            <h2 className="eyebrow mt-8">Статусы</h2>
            <ul className="mt-3 grid gap-px border border-line bg-line sm:grid-cols-3">
              {analytics.byStatus.map((status) => (
                <li key={status.id} className="bg-paper px-4 py-3">
                  <p className="text-[12px] uppercase tracking-[0.12em] text-ink-3">
                    {status.label}
                  </p>
                  <p className="mt-1 text-[19px] font-semibold">{status.count}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5">
            <h2 className="eyebrow">Источники обращений</h2>
            <ul className="mt-3 space-y-2 border-t border-line pt-3">
              {analytics.bySource.length === 0 && (
                <li className="text-[13.5px] text-ink-3">Пока нет данных</li>
              )}
              {analytics.bySource.map((source) => (
                <li key={source.source} className="flex items-baseline justify-between gap-4">
                  <span className="truncate text-[13.5px] text-ink-2">{source.source}</span>
                  <span className="text-[13.5px] font-semibold">{source.count}</span>
                </li>
              ))}
            </ul>

            <h2 className="eyebrow mt-8">Что спрашивают</h2>
            <ul className="mt-3 space-y-2 border-t border-line pt-3">
              {analytics.byProduct.length === 0 && (
                <li className="text-[13.5px] text-ink-3">Пока нет данных</li>
              )}
              {analytics.byProduct.map((product) => (
                <li key={product.product} className="flex items-baseline justify-between gap-4">
                  <span className="truncate text-[13.5px] text-ink-2">{product.product}</span>
                  <span className="text-[13.5px] font-semibold">{product.count}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-[12.5px] leading-[1.6] text-ink-3">
              Средняя длина диалога с консультантом — {analytics.averageTurns} реплик.
              Аналитика доступна только в этой панели.
            </p>
          </div>
        </section>

        {/* Заявки */}
        <section className="mt-10">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/admin"
              className={`inline-flex min-h-9 items-center border px-3 text-[13px] font-medium ${
                activeFilter ? "border-line-2 text-ink-2" : "border-ink bg-ink text-paper"
              }`}
            >
              Все · {analytics.total}
            </a>
            {LEAD_STATUSES.map((status) => {
              const count = analytics.byStatus.find((s) => s.id === status.id)?.count ?? 0;
              return (
                <a
                  key={status.id}
                  href={`/admin?status=${status.id}`}
                  className={`inline-flex min-h-9 items-center border px-3 text-[13px] font-medium ${
                    activeFilter === status.id
                      ? "border-ink bg-ink text-paper"
                      : "border-line-2 text-ink-2 hover:border-ink-3"
                  }`}
                >
                  {status.label} · {count}
                </a>
              );
            })}
          </div>

          {visible.length === 0 ? (
            <p className="mt-8 border border-line bg-paper-2 p-6 text-[14.5px] text-ink-2">
              Заявок пока нет. Как только посетитель отправит форму, она появится здесь,
              а менеджер получит уведомление.
            </p>
          ) : (
            <ul className="mt-6 border-t border-line">
              {visible.map((lead) => (
                <li key={lead.id} className="border-b border-line">
                  <a
                    href={`/admin/leads/${lead.id}`}
                    className="grid gap-3 py-4 transition-colors hover:bg-paper-2 sm:grid-cols-12 sm:items-center sm:gap-4"
                  >
                    <div className="sm:col-span-3">
                      <p className="text-[13.5px] font-semibold">{lead.contact.name}</p>
                      <p className="mt-0.5 text-[13px] text-ink-3">
                        {lead.contact.phone} · {lead.contact.method}
                      </p>
                    </div>
                    <div className="sm:col-span-4">
                      <p className="text-[13.5px] text-ink-2">{lead.request.product}</p>
                      <p className="mt-0.5 text-[12.5px] text-ink-3">
                        {[
                          lead.request.size,
                          lead.request.qty && `${lead.request.qty} шт.`,
                          lead.request.preferredDate && `замер ${lead.request.preferredDate}`,
                        ]
                          .filter(Boolean)
                          .join(" · ") || "параметры не указаны"}
                      </p>
                    </div>
                    <div className="sm:col-span-3">
                      <span className="inline-flex items-center border border-line-2 px-2.5 py-1 text-[12px] font-medium">
                        {statusLabel(lead.status)}
                      </span>
                      <p className="mt-1.5 text-[12.5px] text-ink-3">{lead.nextStep}</p>
                    </div>
                    <div className="sm:col-span-2 sm:text-right">
                      <p className="text-[12.5px] font-medium text-ink-2">
                        {lead.id}
                      </p>
                      <p className="mt-0.5 text-[12px] text-ink-3">
                        {relativeDays(lead.createdAt)} · {dateFormat.format(new Date(lead.createdAt))}
                      </p>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
