import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = getDb();
  await db.prepare("DELETE FROM records WHERE id = ?1").bind(id).run();
  return Response.json({ ok: true });
}
