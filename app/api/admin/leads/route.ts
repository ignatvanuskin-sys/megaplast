import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { LEAD_STATUSES, listLeads, updateLead, type LeadStatus } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_IDS = LEAD_STATUSES.map((s) => s.id);

function isStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && (STATUS_IDS as string[]).includes(value);
}

function text(value: unknown, max = 2000): string | undefined {
  return typeof value === "string" ? value.trim().slice(0, max) : undefined;
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });
  }
  return NextResponse.json({ ok: true, leads: await listLeads() });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, code: "UNAUTHORIZED" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, code: "BAD_REQUEST" }, { status: 400 });
  }

  const id = text(body.id, 40);
  if (!id) {
    return NextResponse.json({ ok: false, code: "BAD_REQUEST" }, { status: 400 });
  }

  if (body.status !== undefined && !isStatus(body.status)) {
    return NextResponse.json(
      { ok: false, code: "BAD_STATUS", message: "Неизвестный статус." },
      { status: 422 },
    );
  }

  const status = isStatus(body.status) ? body.status : undefined;
  const nextStep = text(body.nextStep, 200);
  const managerNote = text(body.managerNote, 2000);

  const price = text(body.price, 40);
  const items = text(body.items, 2000);
  const proposalNote = text(body.note, 1000);
  const createProposal = body.proposal === true;

  const patch: Parameters<typeof updateLead>[1] = {
    ...(status ? { status } : {}),
    ...(nextStep !== undefined ? { nextStep } : {}),
    ...(managerNote !== undefined ? { managerNote } : {}),
  };

  if (createProposal) {
    patch.proposal = {
      createdAt: new Date().toISOString(),
      price: price ?? "",
      items: items ?? "",
      note: proposalNote ?? "",
    };
    patch.historyEvent = "Сформировано коммерческое предложение";
  } else if (status) {
    patch.historyEvent = `Статус: ${status}`;
  }

  const updated = await updateLead(id, patch);
  if (!updated) {
    return NextResponse.json({ ok: false, code: "NOT_FOUND" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, lead: updated });
}
