/**
 * Единая база заявок.
 *
 * Два драйвера:
 *  · postgres (если задан DATABASE_URL) — постоянное хранение, работает на Vercel;
 *  · file (по умолчанию) — .data/leads.json на диске, для локальной работы
 *    и обычного Node-сервера.
 *
 * Компания видит заявки в закрытой панели /admin: статус, историю, следующий шаг.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { makeLeadId, type LeadInput } from "@/lib/leads";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/lead-status";

export { LEAD_STATUSES, statusLabel } from "@/lib/lead-status";
export type { LeadStatus } from "@/lib/lead-status";

export type HistoryEntry = { at: string; event: string; by?: string };

export type LeadRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: LeadStatus;
  nextStep: string;
  managerNote: string;
  contact: { name: string; phone: string; method: string };
  request: {
    product: string;
    objectType: string;
    size: string;
    qty: string;
    system: string;
    color: string;
    mesh: string;
    comment: string;
    preferredDate: string;
  };
  source: {
    landing: string;
    referrer: string;
    utm: Record<string, string>;
    device: string;
  };
  photos: { name: string; size: number; type: string }[];
  ai: { summary: string; turns: number };
  proposal: { createdAt: string; price: string; items: string; note: string } | null;
  history: HistoryEntry[];
};

export type CreateLeadInput = {
  lead: LeadInput;
  photos?: { name: string; size: number; type: string }[];
  ai?: { summary: string; turns: number };
  source?: Partial<LeadRecord["source"]>;
};

/* -------------------------------------------------------------------------- */
/* Драйверы                                                                   */
/* -------------------------------------------------------------------------- */

interface Driver {
  kind: "postgres" | "file";
  durable: boolean;
  all(): Promise<LeadRecord[]>;
  one(id: string): Promise<LeadRecord | null>;
  upsert(record: LeadRecord): Promise<void>;
}

const DATA_DIR = process.env.LEADS_DATA_DIR
  ? path.resolve(process.env.LEADS_DATA_DIR)
  : path.join(process.cwd(), ".data");
const FILE_PATH = path.join(DATA_DIR, "leads.json");

/** Последовательная очередь записи: исключает гонку «прочитал—изменил—записал». */
let queue: Promise<unknown> = Promise.resolve();
function serialize<T>(task: () => Promise<T>): Promise<T> {
  const next = queue.then(task, task);
  queue = next.catch(() => undefined);
  return next;
}

const fileDriver: Driver = {
  kind: "file",
  // На Vercel файловая система эфемерна — считать такое хранилище постоянным нельзя
  durable: !process.env.VERCEL,
  async all() {
    try {
      const raw = await fs.readFile(FILE_PATH, "utf8");
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? (parsed as LeadRecord[]) : [];
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  },
  async one(id) {
    return (await this.all()).find((l) => l.id === id) ?? null;
  },
  async upsert(record) {
    await serialize(async () => {
      const list = await this.all();
      const index = list.findIndex((l) => l.id === record.id);
      if (index >= 0) list[index] = record;
      else list.push(record);

      await fs.mkdir(DATA_DIR, { recursive: true });
      const tmp = `${FILE_PATH}.${process.pid}.tmp`;
      await fs.writeFile(tmp, JSON.stringify(list, null, 2), "utf8");
      await fs.rename(tmp, FILE_PATH);
    });
  },
};

type PgPool = {
  query: (text: string, values?: unknown[]) => Promise<{ rows: unknown[] }>;
};
let pool: PgPool | null = null;
let schemaReady: Promise<void> | null = null;

async function getPool(): Promise<PgPool> {
  if (pool) return pool;
  const { Pool } = (await import("pg")) as unknown as {
    Pool: new (config: { connectionString: string; ssl?: unknown }) => PgPool;
  };
  pool = new Pool({
    connectionString: process.env.DATABASE_URL as string,
    ssl: process.env.DATABASE_SSL === "false" ? undefined : { rejectUnauthorized: false },
  });
  return pool;
}

async function ensureSchema(p: PgPool): Promise<void> {
  if (!schemaReady) {
    schemaReady = p
      .query(
        `create table if not exists leads (
           id text primary key,
           created_at timestamptz not null,
           updated_at timestamptz not null,
           status text not null,
           data jsonb not null
         )`,
      )
      .then(() => undefined);
  }
  return schemaReady;
}

const pgDriver: Driver = {
  kind: "postgres",
  durable: true,
  async all() {
    const p = await getPool();
    await ensureSchema(p);
    const { rows } = await p.query(
      "select data from leads order by created_at desc limit 5000",
    );
    return rows.map((r) => (r as { data: LeadRecord }).data);
  },
  async one(id) {
    const p = await getPool();
    await ensureSchema(p);
    const { rows } = await p.query("select data from leads where id = $1", [id]);
    const first = rows[0] as { data: LeadRecord } | undefined;
    return first?.data ?? null;
  },
  async upsert(record) {
    const p = await getPool();
    await ensureSchema(p);
    await p.query(
      `insert into leads (id, created_at, updated_at, status, data)
       values ($1, $2, $3, $4, $5)
       on conflict (id) do update
         set updated_at = excluded.updated_at,
             status = excluded.status,
             data = excluded.data`,
      [
        record.id,
        record.createdAt,
        record.updatedAt,
        record.status,
        JSON.stringify(record),
      ],
    );
  },
};

function driver(): Driver {
  return process.env.DATABASE_URL?.trim() ? pgDriver : fileDriver;
}

/* -------------------------------------------------------------------------- */
/* Публичный интерфейс                                                        */
/* -------------------------------------------------------------------------- */

export function storageInfo() {
  const d = driver();
  return {
    kind: d.kind,
    durable: d.durable,
    /** Передан ли webhook/Telegram — нужен для честного ответа клиенту */
    notifications: {
      telegram: Boolean(
        process.env.TELEGRAM_BOT_TOKEN?.trim() && process.env.TELEGRAM_CHAT_ID?.trim(),
      ),
      webhook: Boolean(process.env.LEAD_WEBHOOK_URL?.trim()),
    },
  };
}

export async function createLead(input: CreateLeadInput): Promise<LeadRecord> {
  const now = new Date().toISOString();
  const record: LeadRecord = {
    id: makeLeadId(),
    createdAt: now,
    updatedAt: now,
    status: "new",
    nextStep: "Связаться с клиентом",
    managerNote: "",
    contact: {
      name: input.lead.name,
      phone: input.lead.phone,
      method: input.lead.contactMethod,
    },
    request: {
      product: input.lead.product,
      objectType: input.lead.objectType,
      size: input.lead.size,
      qty: input.lead.qty,
      system: input.lead.system,
      color: input.lead.color,
      mesh: input.lead.mesh,
      comment: input.lead.comment,
      preferredDate: input.lead.preferredDate,
    },
    source: {
      landing: input.source?.landing ?? "",
      referrer: input.source?.referrer ?? "",
      utm: input.source?.utm ?? {},
      device: input.source?.device ?? "",
    },
    photos: input.photos ?? [],
    ai: input.ai ?? { summary: "", turns: 0 },
    proposal: null,
    history: [{ at: now, event: "Заявка получена с сайта" }],
  };

  await driver().upsert(record);
  return record;
}

export async function listLeads(): Promise<LeadRecord[]> {
  return driver().all();
}

export async function getLead(id: string): Promise<LeadRecord | null> {
  return driver().one(id);
}

export async function updateLead(
  id: string,
  patch: Partial<
    Pick<LeadRecord, "status" | "nextStep" | "managerNote" | "proposal">
  > & { historyEvent?: string; by?: string },
): Promise<LeadRecord | null> {
  const current = await driver().one(id);
  if (!current) return null;

  const next: LeadRecord = {
    ...current,
    ...(patch.status ? { status: patch.status } : {}),
    ...(patch.nextStep !== undefined ? { nextStep: patch.nextStep } : {}),
    ...(patch.managerNote !== undefined ? { managerNote: patch.managerNote } : {}),
    ...(patch.proposal !== undefined ? { proposal: patch.proposal } : {}),
    updatedAt: new Date().toISOString(),
  };

  if (patch.historyEvent) {
    next.history = [
      ...next.history,
      { at: next.updatedAt, event: patch.historyEvent, by: patch.by },
    ];
  }

  await driver().upsert(next);
  return next;
}

/* -------------------------------------------------------------------------- */
/* Аналитика (только для закрытой панели)                                     */
/* -------------------------------------------------------------------------- */

export type Analytics = {
  total: number;
  byStatus: { id: LeadStatus; label: string; count: number }[];
  byDay: { date: string; count: number }[];
  bySource: { source: string; count: number }[];
  byProduct: { product: string; count: number }[];
  conversion: { won: number; percent: number };
  withPhotos: number;
  averageTurns: number;
};

export function buildAnalytics(leads: LeadRecord[]): Analytics {
  const dayKey = (iso: string) => iso.slice(0, 10);
  const days: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: 0 });
  }
  const dayIndex = new Map(days.map((d, i) => [d.date, i]));

  const bySource = new Map<string, number>();
  const byProduct = new Map<string, number>();

  for (const lead of leads) {
    const key = dayKey(lead.createdAt);
    const idx = dayIndex.get(key);
    if (idx !== undefined) days[idx].count += 1;

    const src =
      lead.source.utm.source ||
      lead.source.utm.utm_source ||
      (lead.source.referrer ? safeHost(lead.source.referrer) : "") ||
      "прямой заход";
    bySource.set(src, (bySource.get(src) ?? 0) + 1);
    byProduct.set(lead.request.product, (byProduct.get(lead.request.product) ?? 0) + 1);
  }

  const won = leads.filter((l) => l.status === "won").length;
  const turns = leads.map((l) => l.ai.turns).filter((n) => n > 0);
  const sumTurns = turns.reduce((a, b) => a + b, 0);

  return {
    total: leads.length,
    byStatus: LEAD_STATUSES.map((s) => ({
      ...s,
      count: leads.filter((l) => l.status === s.id).length,
    })),
    byDay: days,
    bySource: [...bySource.entries()]
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    byProduct: [...byProduct.entries()]
      .map(([product, count]) => ({ product, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    conversion: {
      won,
      percent: leads.length ? Math.round((won / leads.length) * 100) : 0,
    },
    withPhotos: leads.filter((l) => l.photos.length > 0).length,
    averageTurns: turns.length ? Math.round((sumTurns / turns.length) * 10) / 10 : 0,
  };
}

function safeHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
