import type { ThoughtRecord } from "./types";

const KEY = "ai-counselor:records";

export function loadRecords(): ThoughtRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ThoughtRecord[];
    return parsed.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export function saveRecord(record: ThoughtRecord): void {
  const records = loadRecords().filter((r) => r.id !== record.id);
  records.unshift(record);
  window.localStorage.setItem(KEY, JSON.stringify(records));
}

export function deleteRecord(id: string): void {
  const records = loadRecords().filter((r) => r.id !== id);
  window.localStorage.setItem(KEY, JSON.stringify(records));
}
