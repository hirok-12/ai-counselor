-- 思考記録テーブル。感情の配列は JSON 文字列として保存する。
CREATE TABLE IF NOT EXISTS records (
  id                  TEXT PRIMARY KEY,
  created_at          TEXT NOT NULL,
  event               TEXT NOT NULL DEFAULT '',
  automatic_thought   TEXT NOT NULL DEFAULT '',
  emotions            TEXT NOT NULL DEFAULT '[]',
  supporting_evidence TEXT NOT NULL DEFAULT '',
  counter_evidence    TEXT NOT NULL DEFAULT '',
  uncontrollable      TEXT NOT NULL DEFAULT '',
  controllable        TEXT NOT NULL DEFAULT '',
  friend_advice       TEXT NOT NULL DEFAULT '',
  balanced_thought    TEXT NOT NULL DEFAULT '',
  ai_feedback         TEXT,
  emotions_after      TEXT
);

CREATE INDEX IF NOT EXISTS idx_records_created_at ON records (created_at DESC);
