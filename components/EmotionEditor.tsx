"use client";

import { useState } from "react";
import type { Emotion } from "@/lib/types";
import { PRESET_EMOTIONS } from "@/lib/types";

export function EmotionSliders({
  emotions,
  onChange,
  baseline,
}: {
  emotions: Emotion[];
  onChange: (next: Emotion[]) => void;
  /** 再評価モードのとき、変化量を表示するための元の値 */
  baseline?: Emotion[];
}) {
  const setIntensity = (name: string, intensity: number) => {
    onChange(emotions.map((e) => (e.name === name ? { ...e, intensity } : e)));
  };

  return (
    <div>
      {emotions.map((e) => {
        const before = baseline?.find((b) => b.name === e.name)?.intensity;
        const delta = before !== undefined ? e.intensity - before : null;
        return (
          <div className="emotion-slider" key={e.name}>
            <div className="emotion-slider-head">
              <span className="emotion-name">{e.name}</span>
              <span>
                {delta !== null && delta !== 0 && (
                  <span className="emotion-delta">
                    {before}% → {delta > 0 ? "+" : ""}
                    {delta}{" "}
                  </span>
                )}
                <span className="emotion-value">
                  {e.intensity}
                  <small>%</small>
                </span>
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={e.intensity}
              style={{ "--pct": `${e.intensity}%` } as React.CSSProperties}
              onChange={(ev) => setIntensity(e.name, Number(ev.target.value))}
              aria-label={`${e.name}の強さ`}
            />
          </div>
        );
      })}
    </div>
  );
}

export function EmotionPicker({
  emotions,
  onChange,
}: {
  emotions: Emotion[];
  onChange: (next: Emotion[]) => void;
}) {
  const [custom, setCustom] = useState("");
  const names = new Set(emotions.map((e) => e.name));
  const customNames = emotions
    .map((e) => e.name)
    .filter((n) => !(PRESET_EMOTIONS as readonly string[]).includes(n));

  const toggle = (name: string) => {
    if (names.has(name)) {
      onChange(emotions.filter((e) => e.name !== name));
    } else {
      onChange([...emotions, { name, intensity: 50 }]);
    }
  };

  const addCustom = () => {
    const name = custom.trim();
    if (!name || names.has(name)) return;
    onChange([...emotions, { name, intensity: 50 }]);
    setCustom("");
  };

  return (
    <div>
      <div className="chip-row">
        {[...PRESET_EMOTIONS, ...customNames].map((name) => (
          <button
            key={name}
            type="button"
            className={`chip ${names.has(name) ? "selected" : ""}`}
            onClick={() => toggle(name)}
          >
            {name}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 26 }}>
        <input
          type="text"
          placeholder="その他の感情を追加"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
        />
        <button type="button" className="btn btn-ghost" onClick={addCustom}>
          追加
        </button>
      </div>
      {emotions.length > 0 && (
        <EmotionSliders emotions={emotions} onChange={onChange} />
      )}
    </div>
  );
}
