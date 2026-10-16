/**
 * Статусы заявки. Отдельный модуль без серверных зависимостей —
 * чтобы его можно было использовать и в клиентских компонентах.
 */

export type LeadStatus =
  | "new"
  | "contacted"
  | "measured"
  | "proposal"
  | "won"
  | "lost";

export const LEAD_STATUSES: { id: LeadStatus; label: string }[] = [
  { id: "new", label: "Новая" },
  { id: "contacted", label: "Связались" },
  { id: "measured", label: "Замер назначен" },
  { id: "proposal", label: "КП отправлено" },
  { id: "won", label: "Заказ" },
  { id: "lost", label: "Отказ" },
];

export function statusLabel(id: LeadStatus): string {
  return LEAD_STATUSES.find((status) => status.id === id)?.label ?? id;
}
