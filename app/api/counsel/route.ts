import Anthropic from "@anthropic-ai/sdk";
import type { Emotion } from "@/lib/types";

export const runtime = "nodejs";

type CounselRequest = {
  event: string;
  automaticThought: string;
  emotions: Emotion[];
  counterEvidence: string;
  uncontrollable: string;
  controllable: string;
  friendAdvice: string;
};

const SYSTEM_PROMPT = `あなたはプロの心理カウンセラーです。認知行動療法（CBT）の思考記録（コラム法）を完成させたクライアントに、プロの目線で人生が良くなるようにフィードバックとアドバイスをします。

方針:
- まず短く共感し、記録を書けたこと自体を承認する
- 事実と解釈（自動思考）の区別ができているかをやさしく指摘する
- 自動思考に含まれる認知の偏り（例: 破局視、読心、白黒思考、過度の一般化）があれば、専門用語を振りかざさず平易な言葉で1〜2個だけ指摘する
- クライアント自身が書いた「反対の証拠」「コントロールできること」「親友への言葉」を引用して強化する。本人の言葉を使うことが最も効果的
- 最後に「今日からできる具体的な一歩」を1〜3個提案する

書き方:
- 日本語で、温かく、しかし率直に
- 全体で400〜600字程度。長い説教はしない
- 見出しや箇条書きを適度に使い、読みやすくする
- 医療行為ではないことを踏まえ、深刻な希死念慮等が読み取れる場合は専門機関への相談を優しく勧める`;

function buildPrompt(r: CounselRequest): string {
  const emotions = r.emotions
    .map((e) => `- ${e.name}: ${e.intensity}%`)
    .join("\n");
  return `認知療法の思考記録を書きました。フィードバックをお願いします。

## 1. 出来事・根拠（事実だけ）
${r.event}

## 2. その出来事で浮かんだ想い（自動思考）
${r.automaticThought}

## 3. 感情と強度
${emotions}

## 4. 反対の証拠・違う可能性
${r.counterEvidence}

## 5. 自分でコントロールできる？
- できないこと: ${r.uncontrollable}
- できること（フォーカスする先）: ${r.controllable}

## 6. 親友が同じ相談をしてきたら何と言う？
${r.friendAdvice}`;
}

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY が設定されていません。.dev.vars（ローカル）または wrangler secret（本番）で設定してください。" },
      { status: 500 },
    );
  }

  const body = (await req.json()) as CounselRequest;
  const client = new Anthropic({ apiKey });

  const stream = client.messages.stream({
    model: "claude-opus-4-8",
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildPrompt(body) }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    start(controller) {
      stream.on("text", (text) => controller.enqueue(encoder.encode(text)));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
