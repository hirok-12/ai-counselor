"use client";

import { useRef, useState } from "react";
import type { Emotion, ThoughtRecord } from "@/lib/types";
import { saveRecord } from "@/lib/storage";
import { EmotionPicker, EmotionSliders } from "./EmotionEditor";
import { Markdown } from "./Markdown";

const TOTAL_STEPS = 8;

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
    title: "証拠を天秤にかける",
    guide: "その想いを「支持する証拠」と「反対の証拠」を両方書き出して、見比べてみます。まず本音を出し、次に弁護士になったつもりで反論を探します。",
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
    title: "新しい考え",
    guide: "ここまでを踏まえて、いまのあなたが納得できる「バランスの取れた考え」を、自分の言葉でまとめてみます。",
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
  const [supportingEvidence, setSupportingEvidence] = useState("");
  const [counterEvidence, setCounterEvidence] = useState("");
  const [uncontrollable, setUncontrollable] = useState("");
  const [controllable, setControllable] = useState("");
  const [friendAdvice, setFriendAdvice] = useState("");
  const [balancedThought, setBalancedThought] = useState("");

  const [feedback, setFeedback] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emotionsAfter, setEmotionsAfter] = useState<Emotion[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
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
      case 3: return supportingEvidence.trim().length > 0 && counterEvidence.trim().length > 0;
      case 4: return uncontrollable.trim().length > 0 || controllable.trim().length > 0;
      case 5: return friendAdvice.trim().length > 0;
      case 6: return balancedThought.trim().length > 0;
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
          supportingEvidence,
          counterEvidence,
          uncontrollable,
          controllable,
          friendAdvice,
          balancedThought,
        }),
      });
      if (res.status === 401) {
        // セッション切れ。ログイン画面へ戻す（ここで再試行しても必ず失敗するため）
        window.location.href = "/login";
        return;
      }
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
    if (next === 7 && !requestedRef.current) {
      requestedRef.current = true;
      void fetchFeedback();
    }
    window.scrollTo({ top: 0 });
  };

  const save = async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    const record: ThoughtRecord = {
      id: recordId.current,
      createdAt: new Date().toISOString(),
      event,
      automaticThought,
      emotions,
      supportingEvidence,
      counterEvidence,
      uncontrollable,
      controllable,
      friendAdvice,
      balancedThought,
      aiFeedback: feedback || undefined,
      emotionsAfter: emotionsAfter ?? undefined,
    };
    try {
      await saveRecord(record);
      onDone();
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "保存に失敗しました");
      setSaving(false);
    }
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
          <label className="field-label">支持する証拠</label>
          <div className="hint-card">
            問いかけ：その想いを裏づける具体的な事実は？ 過去に似たことは実際に起きた？
          </div>
          <textarea
            rows={4}
            autoFocus
            value={supportingEvidence}
            onChange={(e) => setSupportingEvidence(e.target.value)}
            placeholder="例）前の現場で一部の人とうまくいかなかったのは事実。"
          />
          <label className="field-label">反対の証拠・違う可能性</label>
          <div className="hint-card">
            問いかけ：その考えを支持しない事実は？ 最悪以外のシナリオは？ 5年後のあなたはどう見る？
          </div>
          <textarea
            rows={4}
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
        <>
          <div className="hint-card">
            ヒント：反対の証拠や、親友にかけた言葉を思い出しながら、いまの自分がしっくりくる言い方でまとめてみましょう。
          </div>
          <textarea
            rows={6}
            autoFocus
            value={balancedThought}
            onChange={(e) => setBalancedThought(e.target.value)}
            placeholder="例）不安はあるけど、相手の評価はコントロールできない。いまの現場で自分にできることに集中すれば大丈夫。"
          />
        </>
      )}

      {step === 7 && (
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
                  <Markdown source={feedback} />
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

      {saveError && step === 7 && (
        <div className="error-card" style={{ marginTop: 16 }}>{saveError}</div>
      )}

      <div className="wizard-nav">
        {step > 0 && step < 7 ? (
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

        {step < 7 ? (
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canProceed()}
            onClick={goNext}
          >
            {step === 6 ? "フィードバックを受け取る" : "次へ"}
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-primary"
            disabled={streaming || saving}
            onClick={save}
          >
            {saving ? "保存中…" : "記録を保存する"}
          </button>
        )}
      </div>
    </div>
  );
}
