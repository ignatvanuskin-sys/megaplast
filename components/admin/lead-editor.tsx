"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CircleCheck, LoaderCircle } from "lucide-react";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/lead-status";
import type { LeadRecord } from "@/lib/store";

type Props = { lead: LeadRecord };

export default function LeadEditor({ lead }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(lead.status);
  const [nextStep, setNextStep] = useState(lead.nextStep);
  const [managerNote, setManagerNote] = useState(lead.managerNote);
  const [price, setPrice] = useState(lead.proposal?.price ?? "");
  const [items, setItems] = useState(lead.proposal?.items ?? "");
  const [note, setNote] = useState(lead.proposal?.note ?? "");
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");

  async function send(payload: Record<string, unknown>, successText: string) {
    if (pending) return;
    setPending(true);
    setError("");
    setSaved("");
    try {
      const response = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: lead.id, ...payload }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (response.ok) {
        setSaved(successText);
        router.refresh();
      } else {
        setError(data.message ?? "Не удалось сохранить.");
      }
    } catch {
      setError("Сеть недоступна.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <section className="border border-line bg-paper p-5">
        <h2 className="text-[16px] font-semibold tracking-[-0.015em]">Ведение заявки</h2>

        <div className="mt-5">
          <label className="field-label" htmlFor="lead-status">
            Статус
          </label>
          <select
            id="lead-status"
            className="field appearance-none"
            value={status}
            onChange={(event) => setStatus(event.target.value as LeadStatus)}
          >
            {LEAD_STATUSES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="field-label" htmlFor="lead-next">
            Следующий шаг
          </label>
          <input
            id="lead-next"
            className="field"
            placeholder="например: позвонить и согласовать замер"
            value={nextStep}
            onChange={(event) => setNextStep(event.target.value)}
          />
        </div>

        <div className="mt-4">
          <label className="field-label" htmlFor="lead-note">
            Заметка менеджера
          </label>
          <textarea
            id="lead-note"
            className="field min-h-24 resize-y"
            placeholder="Договорились о замере, размеры уточнены…"
            value={managerNote}
            onChange={(event) => setManagerNote(event.target.value)}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="btn btn-primary"
            disabled={pending}
            onClick={() =>
              send(
                { status, nextStep, managerNote },
                "Статус и заметка сохранены",
              )
            }
          >
            {pending ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Сохраняем…
              </>
            ) : (
              "Сохранить"
            )}
          </button>
          {saved && (
            <span className="inline-flex items-center gap-2 text-[13px] text-accent-ink">
              <CircleCheck className="h-4 w-4 text-accent" aria-hidden="true" />
              {saved}
            </span>
          )}
          {error && <span className="text-[13px] text-[#b3261e]">{error}</span>}
        </div>
      </section>

      <section className="border border-line bg-paper p-5">
        <h2 className="text-[16px] font-semibold tracking-[-0.015em]">
          Коммерческое предложение
        </h2>
        <p className="mt-2 text-[13px] leading-[1.55] text-ink-3">
          Стоимость и комплектацию вводит менеджер — сайт не придумывает цену.
          После сохранения КП можно открыть, распечатать в PDF и отправить клиенту.
        </p>

        <div className="mt-5">
          <label className="field-label" htmlFor="proposal-price">
            Стоимость
          </label>
          <input
            id="proposal-price"
            className="field"
            placeholder="например: 1 250 000 ₸"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        </div>

        <div className="mt-4">
          <label className="field-label" htmlFor="proposal-items">
            Комплектация (по строке на позицию)
          </label>
          <textarea
            id="proposal-items"
            className="field min-h-28 resize-y"
            placeholder={"Окно 1300×1400, KS Helios 70 мм, стеклопакет 44 мм — 3 шт.\nМоскитные сетки — 3 шт."}
            value={items}
            onChange={(event) => setItems(event.target.value)}
          />
        </div>

        <div className="mt-4">
          <label className="field-label" htmlFor="proposal-note">
            Примечание для клиента
          </label>
          <textarea
            id="proposal-note"
            className="field min-h-20 resize-y"
            placeholder="Сроки и гарантия — по договору. Замер бесплатный."
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="btn btn-accent"
            disabled={pending}
            onClick={() =>
              send({ proposal: true, price, items, note, status: "proposal" }, "КП сформировано")
            }
          >
            Сформировать КП
          </button>
          {lead.proposal && (
            <a
              href={`/admin/leads/${lead.id}/proposal`}
              className="inline-flex min-h-11 items-center text-[13.5px] font-semibold underline decoration-accent/40 underline-offset-4"
            >
              Открыть предложение
            </a>
          )}
        </div>
      </section>
    </div>
  );
}
