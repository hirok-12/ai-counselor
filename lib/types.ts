export type Emotion = {
  name: string;
  intensity: number; // 0-100
};

export type ThoughtRecord = {
  id: string;
  createdAt: string; // ISO 8601
  /** 1. 出来事・根拠（事実だけ） */
  event: string;
  /** 2. その出来事で浮かんだ想い（自動思考） */
  automaticThought: string;
  /** 3. 感情と強度 */
  emotions: Emotion[];
  /** 4. 自動思考を支持する証拠 */
  supportingEvidence: string;
  /** 5. 反対の証拠・違う可能性 */
  counterEvidence: string;
  /** 6a. 自分でコントロールできないこと */
  uncontrollable: string;
  /** 6b. 自分でコントロールできること（フォーカスする先） */
  controllable: string;
  /** 7. 親友が同じ相談をしてきたら何と言うか */
  friendAdvice: string;
  /** 8. 自分の言葉でまとめた新しい考え（バランス思考） */
  balancedThought: string;
  /** 9. AI カウンセラーからのフィードバック */
  aiFeedback?: string;
  /** 10. 振り返り後の感情の再評価 */
  emotionsAfter?: Emotion[];
};

export const PRESET_EMOTIONS = [
  "不安",
  "焦り",
  "悲しさ",
  "恥ずかしさ",
  "孤独感",
  "自己嫌悪",
  "恐怖",
  "怒り",
  "罪悪感",
  "無力感",
] as const;
