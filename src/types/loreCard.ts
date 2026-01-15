import type { Tables, Enums } from "./database"

// 基本型（DBテーブルから自動生成される型を再エクスポート）
export type LoreCard = Tables<"lore_cards">
export type Tag = Tables<"tags">
export type CardTag = Tables<"card_tags">
export type CardReference = Tables<"card_references">
export type ReferenceType = Enums<"reference_type">

// 作成者情報
export type Author = {
  id: string
  display_name: string | null
  avatar_url: string | null
}

// カード一覧用（タグ付き）
export type LoreCardWithTags = LoreCard & {
  tags: Tag[]
}

// カード詳細用（タグ + 作成者付き）
export type LoreCardWithRelations = LoreCard & {
  tags: Tag[]
  author: Author | null
}

// 参照タイプの日本語ラベル
export const referenceTypeLabels: Record<ReferenceType, string> = {
  depends_on: "依存",
  derives_from: "派生元",
  contradicts: "矛盾",
  related: "関連",
  mentions: "言及",
}

// 参照タイプの説明
export const referenceTypeDescriptions: Record<ReferenceType, string> = {
  depends_on: "この設定を前提とする",
  derives_from: "この設定から派生している",
  contradicts: "この設定と矛盾する",
  related: "この設定と関連がある",
  mentions: "この設定に言及している",
}
