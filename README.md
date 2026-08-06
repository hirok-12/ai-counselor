# こころの記録 — 認知療法ジャーナル

認知行動療法（CBT）の思考記録（コラム法）をつけて、AIカウンセラー（Claude）からフィードバックを受け取るWebアプリ。

## 構成

- **Next.js 15**（App Router / TypeScript）
- **Cloudflare Workers** にデプロイ（[@opennextjs/cloudflare](https://opennext.js.org/cloudflare)）
- **Claude API**（`@anthropic-ai/sdk`、ストリーミング応答）
- 記録はブラウザの localStorage に保存（サーバーには残らない）

## 記録の流れ

1. 出来事（事実だけ）
2. 浮かんだ想い（自動思考）
3. 感情と強度（0〜100%）
4. 反対の証拠・違う可能性
5. コントロールできる／できないの仕分け
6. 親友が同じ相談をしてきたら？
7. AIカウンセラーのフィードバック → 感情の再評価 → 保存

## ローカル開発

```bash
npm install
cp .dev.vars.example .dev.vars   # wrangler preview 用
cp .dev.vars.example .env        # next dev 用（同じ内容でOK）
npm run dev                      # http://localhost:3000
```

## Cloudflare へのデプロイ

```bash
npx wrangler login                              # 初回のみ
npx wrangler secret put ANTHROPIC_API_KEY       # APIキーを本番シークレットに登録
npx wrangler secret put APP_PASSWORD            # アプリの入室パスワード
npm run deploy
```

main ブランチへの push で GitHub Actions から自動デプロイされる（`.github/workflows/deploy.yml`、要 `CLOUDFLARE_API_TOKEN` シークレット）。

## アクセス保護

全ページ・APIは `APP_PASSWORD` による簡易認証で保護される（初回にパスワード入力 → Cookie で30日間維持）。未設定の場合はアプリ全体が 503 でロックされる。

ローカルで Workers ランタイム（workerd）上の挙動を確認するには:

```bash
npm run preview
```

## 注意

このアプリはセルフケアの補助を目的としたものであり、医療行為・診断・治療の代替ではありません。つらい状態が続く場合は専門機関に相談してください。
