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
cp .dev.vars.example .dev.vars   # ANTHROPIC_API_KEY を設定
npm run dev                      # http://localhost:3000
```

## Cloudflare へのデプロイ

```bash
npx wrangler login                              # 初回のみ
npx wrangler secret put ANTHROPIC_API_KEY       # APIキーを本番シークレットに登録
npm run deploy
```

ローカルで Workers ランタイム（workerd）上の挙動を確認するには:

```bash
npm run preview
```

## 注意

このアプリはセルフケアの補助を目的としたものであり、医療行為・診断・治療の代替ではありません。つらい状態が続く場合は専門機関に相談してください。
