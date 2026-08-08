import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { Emotion, ThoughtRecord } from "./types";

export function getDb(): D1Database {
  return getCloudflareContext().env.DB;
}

/** D1 の 1 行（snake_case）を ThoughtRecord に変換 */
export type RecordRow = {
  id: string;
  created_at: string;
  event: string;
  automatic_thought: string;
  emotions: string;
  supporting_evidence: string;
  counter_evidence: string;
  uncontrollable: string;
  controllable: string;
  friend_advice: string;
  balanced_thought: string;
  ai_feedback: string | null;
  emotions_after: string | null;
};

function parseEmotions(raw: string | null): Emotion[] | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as Emotion[];
  } catch {
    return undefined;
  }
}

export function rowToRecord(r: RecordRow): ThoughtRecord {
  return {
    id: r.id,
    createdAt: r.created_at,
    event: r.event,
    automaticThought: r.automatic_thought,
    emotions: parseEmotions(r.emotions) ?? [],
    supportingEvidence: r.supporting_evidence,
    counterEvidence: r.counter_evidence,
    uncontrollable: r.uncontrollable,
    controllable: r.controllable,
    friendAdvice: r.friend_advice,
    balancedThought: r.balanced_thought,
    aiFeedback: r.ai_feedback ?? undefined,
    emotionsAfter: parseEmotions(r.emotions_after),
  };
}
