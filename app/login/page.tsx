"use client";

import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "ログインに失敗しました");
      }
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "ログインに失敗しました");
      setBusy(false);
    }
  };

  return (
    <main>
      <header className="app-header">
        <h1 className="app-title">
          こころ<span className="accent">の</span>記録
        </h1>
        <span className="app-subtitle">認知療法ジャーナル</span>
      </header>

      <div className="fade-in" style={{ paddingTop: 40 }}>
        <p className="hero-lead" style={{ marginBottom: 24 }}>
          合言葉を入力してください。
        </p>
        <form onSubmit={submit}>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            aria-label="パスワード"
            style={{ fontFamily: "var(--font-body)" }}
          />
          {error && (
            <div className="error-card" style={{ marginTop: 14 }}>
              {error}
            </div>
          )}
          <div style={{ marginTop: 20 }}>
            <button
              type="submit"
              className="btn btn-primary btn-wide"
              disabled={!password || busy}
            >
              {busy ? "確認中…" : "入室する"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
