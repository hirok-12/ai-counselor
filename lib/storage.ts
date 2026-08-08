import type { ThoughtRecord } from "./types";

/** 認証切れなら再ログインへ誘導し、それ以外の失敗は例外にする */
async function ensureOk(res: Response, failMessage: string): Promise<void> {
  if (res.status === 401) {
    if (typeof window !== "undefined") window.location.href = "/login";
    throw new Error("認証が必要です");
  }
  if (!res.ok) throw new Error(failMessage);
}

export async function loadRecords(): Promise<ThoughtRecord[]> {
  const res = await fetch("/api/records", { cache: "no-store" });
  await ensureOk(res, "記録の読み込みに失敗しました");
  const records = (await res.json()) as ThoughtRecord[];
  return records;
}

export async function saveRecord(record: ThoughtRecord): Promise<void> {
  const res = await fetch("/api/records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
  await ensureOk(res, "記録の保存に失敗しました");
}

export async function deleteRecord(id: string): Promise<void> {
  const res = await fetch(`/api/records/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  await ensureOk(res, "記録の削除に失敗しました");
}
