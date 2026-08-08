import { getDb, rowToRecord, type RecordRow } from "@/lib/db";
import type { ThoughtRecord } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const db = getDb();
  const { results } = await db
    .prepare("SELECT * FROM records ORDER BY created_at DESC")
    .all<RecordRow>();
  return Response.json(results.map(rowToRecord));
}

export async function POST(req: Request) {
  const r = (await req.json().catch(() => null)) as ThoughtRecord | null;
  if (!r || !r.id || !r.createdAt) {
    return Response.json({ error: "不正なデータです" }, { status: 400 });
  }

  const db = getDb();
  await db
    .prepare(
      `INSERT INTO records (
         id, created_at, event, automatic_thought, emotions,
         supporting_evidence, counter_evidence, uncontrollable, controllable,
         friend_advice, balanced_thought, ai_feedback, emotions_after
       ) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11,?12,?13)
       ON CONFLICT(id) DO UPDATE SET
         created_at          = excluded.created_at,
         event               = excluded.event,
         automatic_thought   = excluded.automatic_thought,
         emotions            = excluded.emotions,
         supporting_evidence = excluded.supporting_evidence,
         counter_evidence    = excluded.counter_evidence,
         uncontrollable      = excluded.uncontrollable,
         controllable        = excluded.controllable,
         friend_advice       = excluded.friend_advice,
         balanced_thought    = excluded.balanced_thought,
         ai_feedback         = excluded.ai_feedback,
         emotions_after      = excluded.emotions_after`,
    )
    .bind(
      r.id,
      r.createdAt,
      r.event ?? "",
      r.automaticThought ?? "",
      JSON.stringify(r.emotions ?? []),
      r.supportingEvidence ?? "",
      r.counterEvidence ?? "",
      r.uncontrollable ?? "",
      r.controllable ?? "",
      r.friendAdvice ?? "",
      r.balancedThought ?? "",
      r.aiFeedback ?? null,
      r.emotionsAfter ? JSON.stringify(r.emotionsAfter) : null,
    )
    .run();

  return Response.json({ ok: true });
}
