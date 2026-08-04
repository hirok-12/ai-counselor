"use client";

import { useEffect, useState } from "react";
import type { ThoughtRecord } from "@/lib/types";
import { deleteRecord, loadRecords } from "@/lib/storage";
import { RecordFlow } from "@/components/RecordFlow";

type View =
  | { kind: "home" }
  | { kind: "record" }
  | { kind: "detail"; record: ThoughtRecord };

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${String(
    d.getHours(),
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function Home() {
  const [view, setView] = useState<View>({ kind: "home" });
  const [records, setRecords] = useState<ThoughtRecord[]>([]);

  useEffect(() => {
    setRecords(loadRecords());
  }, [view]);

  return (
    <main>
      <header className="app-header">
        <h1 className="app-title">
          こころ<span className="accent">の</span>記録
        </h1>
        <span className="app-subtitle">認知療法ジャーナル</span>
      </header>

      {view.kind === "record" && (
        <RecordFlow onDone={() => setView({ kind: "home" })} />
      )}

      {view.kind === "home" && (
        <div className="fade-in">
          <section className="hero">
            <p className="hero-lead">
              現実と想像を分けて、
              <br />
              事実を静かに見つめ直す。
            </p>
            <p className="hero-note">
              7つの問いに答えるだけ。最後にAIカウンセラーがプロの目線でフィードバックします。
            </p>
            <button
              type="button"
              className="btn btn-primary btn-wide"
              onClick={() => setView({ kind: "record" })}
            >
              今日の記録をはじめる
            </button>
          </section>

          <div className="section-label">これまでの記録</div>
          {records.length === 0 ? (
            <p className="empty-note">
              まだ記録がありません。最初の一枚を書いてみましょう。
            </p>
          ) : (
            records.map((r) => (
              <button
                key={r.id}
                type="button"
                className="record-card"
                onClick={() => setView({ kind: "detail", record: r })}
              >
                <div className="record-card-date">{formatDate(r.createdAt)}</div>
                <div className="record-card-event">{r.event}</div>
                <div className="record-card-emotions">
                  {r.emotions.slice(0, 4).map((e) => (
                    <span key={e.name} className="chip-small">
                      {e.name} {e.intensity}%
                    </span>
                  ))}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {view.kind === "detail" && (
        <RecordDetail
          record={view.record}
          onBack={() => setView({ kind: "home" })}
          onDelete={() => {
            deleteRecord(view.record.id);
            setView({ kind: "home" });
          }}
        />
      )}
    </main>
  );
}

function RecordDetail({
  record,
  onBack,
  onDelete,
}: {
  record: ThoughtRecord;
  onBack: () => void;
  onDelete: () => void;
}) {
  const emotionLine = (emotions: ThoughtRecord["emotions"]) =>
    emotions.map((e) => `${e.name} ${e.intensity}%`).join(" ／ ");

  return (
    <div className="fade-in">
      <button type="button" className="back-link" onClick={onBack}>
        ← 一覧にもどる
      </button>

      <div className="step-header" style={{ paddingTop: 16 }}>
        <div className="step-count">{formatDate(record.createdAt)}</div>
        <h2 className="step-title">{record.event}</h2>
      </div>

      <div className="detail-section">
        <div className="detail-q">浮かんだ想い</div>
        <div className="detail-a">{record.automaticThought}</div>
      </div>

      <div className="detail-section">
        <div className="detail-q">感情</div>
        <div className="detail-a">{emotionLine(record.emotions)}</div>
        {record.emotionsAfter && (
          <div className="detail-a muted">
            振り返り後：{emotionLine(record.emotionsAfter)}
          </div>
        )}
      </div>

      <div className="detail-section">
        <div className="detail-q">違う可能性</div>
        <div className="detail-a">{record.counterEvidence}</div>
      </div>

      <div className="detail-section">
        <div className="detail-q">コントロールの仕分け</div>
        <div className="detail-a">
          できないこと：{record.uncontrollable || "—"}
          {"\n"}できること：{record.controllable || "—"}
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-q">親友への言葉</div>
        <div className="detail-a">{record.friendAdvice}</div>
      </div>

      {record.aiFeedback && (
        <div className="feedback-card">
          <div className="feedback-label">カウンセラーより</div>
          <div className="feedback-body">{record.aiFeedback}</div>
        </div>
      )}

      <button
        type="button"
        className="danger-link"
        onClick={() => {
          if (window.confirm("この記録を削除しますか？")) onDelete();
        }}
      >
        この記録を削除する
      </button>
    </div>
  );
}
