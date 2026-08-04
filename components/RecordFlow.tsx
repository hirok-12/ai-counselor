"use client";

import { useRef, useState } from "react";
import type { Emotion, ThoughtRecord } from "@/lib/types";
import { saveRecord } from "@/lib/storage";
import { EmotionPicker, EmotionSliders } from "./EmotionEditor";

const TOTAL_STEPS = 7;

type StepMeta = {
  title: string;
  guide: string;
};

const STEPS: StepMeta[] = [
  {
    title: "出来事",
    guide: "何がありましたか。カメラで撮ったように、事実だけを書きます。解釈や想像はまだ入れません。",
  },
  {
    title: "浮かんだ想い",
    guide: "その出来事のとき、頭に自動的に浮かんだ考えをそのまま書きます。正しさは気にしなくて大丈夫です。",
  },
  {
    title: "感情",
    guide: "いま感じている感情を選んで、強さを 0〜100% で記録します。",
  },
  {
    title: "違う可能性",
    guide: "浮かんだ想いに対する「反対の証拠」や「別の見方」を探してみます。弁護士になったつもりで。",
  },
  {
    title: "コントロールできる？",
    guide: "自分でコントロールできないことと、できることを仕分けます。エネルギーは「できること」に注ぎます。",
  },
  {
    title: "親友の視点",
    guide: "もし親友がまったく同じ相談をしてきたら、あなたは何と言ってあげますか。",
  },
  {
    title: "カウンセラーの言葉",
    guide: "記録全体をAIカウンセラーが読み、プロの目線でフィードバックします。",
  },
];

export function RecordFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [event, setEvent] = useState("");
  const [automaticThought, setAutomaticThought] = useState("");
  const [emotions, setEmotions] = useState<Emotion[]>([]);
  const [counterEvidence, setCounterEvidence] = useState("");
  const [uncontrollable, setUncontrollable] = useState("");
  const [controllable, setControllable] = useState("");
  const [friendAdvice, setFriendAdvice] = useState("");

  const [feedback, setFeedback] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emotionsAfter, setEmotionsAfter] = useState<Emotion[] | null>(null);
  const requestedRef = useRef(false);

  const recordId = useRef(
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : String(Date.now()),
  );

  const canProceed = () => {
    switch (step) {
      case 0: return event.trim().length > 0;
      case 1: return automaticThought.trim().length > 0;
      case 2: return emotions.length > 0;
      case 3: return counterEvidence.trim().length > 0;
      case 4: return uncontrollable.trim().length > 0 || controllable.trim().length > 0;
      case 5: return friendAdvice.trim().length > 0;
      default: return true;
    }
  };

  const fetchFeedback = async () => {
    setStreaming(true);
    setError(null);
    setFeedback("");
    try {
      const res = await fetch("/api/counsel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          automaticThought,
          emotions,
          counterEvidence,
          uncontrollable,
          controllable,
          friendAdvice,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? `エラーが発生しました (${res.status})`);
      }
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setFeedback(text);
      }
      setEmotionsAfter(emotions.map((e) => ({ ...e })));
    } catch (e) {
      setError(e instanceof Error ? e.message : "通信に失敗しました");
      requestedRef.current = false;
    } finally {
      setStreaming(false);
    }
  };

  const goNext = () => {
    const next = step + 1;
    setStep(next);
    if (next === 6 && !requestedRef.current) {
      requestedRef.current = true;
      void fetchFeedback();
    }
    window.scrollTo({ top: 0 });
  };

  const save = () => {
    const record: ThoughtRecord = {
      id: recordId.current,
      createdAt: new Date().toISOString(),
      event,
      automaticThought,
      emotions,
      counterEvidence,
      uncontrollable,
      controllable,
      friendAdvice,
      aiFeedback: feedback || undefined,
      emotionsAfter: emotionsAfter ?? undefined,
    };
    saveRecord(record);
    onDone();
  };

  const meta = STEPS[step];

  return (
    <div className="fade-in" key={step}>
      <div className="step-header">
        <div className="step-count">
          {step + 1} / {TOTAL_STEPS}
        </div>
        <h2 className="step-title">{meta.title}</h2>
        <p className="step-guide">{meta.guide}</p>
      </div>

      {step === 0 && (
        <textarea
          rows={5}
          autoFocus
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          placeholder="例）以前の同僚と同じ現場になった。"
        />
      )}

      {step === 1 && (
        <textarea
          rows={5}
          autoFocus
          value={automaticThought}
          onChange={(e) => setAutomaticThought(e.target.value)}
          placeholder="例）前の現場では評判が良くなかったので、今の現場でも悪い噂を立てられるのではないかと心配。"
        />
      )}

      {step === 2 && (
        <EmotionPicker emotions={emotions} onChange={setEmotions} />
      )}

      {step === 3 && (
        <>
          <div className="hint-card">
            問いかけ：その考えを支持しない事実は？ 最悪以外のシナリオは？ 5年後のあなたはどう見る？
          </div>
          <textarea
            rows={5}
            autoFocus
            value={counterEvidence}
            onChange={(e) => setCounterEvidence(e.target.value)}
            placeholder="例）以前の同僚が自分の悪口を言っているとは限らない。"
          />
        </>
      )}

      {step === 4 && (
        <>
          <label className="field-label">自分でコントロールできないこと</label>
          <textarea
            rows={3}
            autoFocus
            value={uncontrollable}
            onChange={(e) => setUncontrollable(e.target.value)}
            placeholder="例）相手が自分のことをどう言うかはコントロールできない。"
          />
          <label className="field-label">自分でできること（ここにフォーカスする）</label>
          <textarea
            rows={3}
            value={controllable}
            onChange={(e) => setControllable(e.target.value)}
            placeholder="例）今の現場で目の前の仕事を頑張ることは自分でできる。"
          />
        </>
      )}

      {step === 5 && (
        <textarea
          rows={6}
          autoFocus
          value={friendAdvice}
          onChange={(e) => setFriendAdvice(e.target.value)}
          placeholder="例）心配なのはわかるけど、相手がどう言うかはコントロールできないし、考えすぎない方がいいよ。"
        />
      )}

      {step === 6 && (
        <div>
          {error && (
            <div className="error-card">
              {error}
              <div style={{ marginTop: 10 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    requestedRef.current = true;
                    void fetchFeedback();
                  }}
                >
                  もう一度試す
                </button>
              </div>
            </div>
          )}

          {(feedback || streaming) && (
            <div className="feedback-card">
              <div className="feedback-label">カウンセラーより</div>
              {feedback ? (
                <div className={`feedback-body ${streaming ? "cursor-blink" : ""}`}>
                  {feedback}
                </div>
              ) : (
                <div className="thinking-dots" aria-label="考え中">
                  <span /><span /><span />
                </div>
              )}
            </div>
          )}

          {!streaming && feedback && emotionsAfter && (
            <>
              <div className="section-label">いまの感情を再評価</div>
              <p className="step-guide">
                書き終えたいま、感情の強さはどう変わりましたか。
              </p>
              <EmotionSliders
                emotions={emotionsAfter}
                onChange={setEmotionsAfter}
                baseline={emotions}
              />
            </>
          )}
        </div>
      )}

      <div className="wizard-nav">
        {step > 0 && step < 6 ? (
          <button type="button" className="btn btn-ghost" onClick={() => setStep(step - 1)}>
            戻る
          </button>
        ) : step === 0 ? (
          <button type="button" className="btn btn-ghost" onClick={onDone}>
            やめる
          </button>
        ) : (
          <span />
        )}

        {step < 6 ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canProceed()}
            onClick={goNext}
          >
            {step === 5 ? "フィードバックを受け取る" : "次へ"}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            disabled={streaming}
            onClick={save}
          >
            記録を保存する
          </button>
        )}
      </div>
    </div>
  );
}
