"use server"

import { createClient } from "@/utils/supabase/server"
import type { CardReferenceData, Tag } from "@/types/loreCard"
import { isTag } from "@/types/loreCard"

// グラフ用カードデータ
export type GraphCardData = {
  id: string
  title: string
  tags: Tag[]
}

// グラフ用データ取得結果
export type GraphDataResult = {
  cards: GraphCardData[]
  references: CardReferenceData[]
}

// card_tagsからTagを抽出するユーティリティ関数
function extractTags(
  cardTags: Array<{ tags: unknown }> | null | undefined
): Tag[] {
  if (!cardTags) return []
  return cardTags.map((ct) => ct.tags).filter(isTag)
}

// プロジェクト内のカード参照関係を取得
export async function getCardReferences(
  projectId: string
): Promise<{ success: boolean; data?: GraphDataResult; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  // プロジェクト内のカードとタグを取得
  const { data: cards, error: cardsError } = await supabase
    .from("lore_cards")
    .select(`
      id,
      title,
      card_tags (
        tags (*)
      )
    `)
    .eq("project_id", projectId)

  if (cardsError) {
    console.error("Failed to fetch cards for graph:", cardsError)
    return { success: false, error: "カードの取得に失敗しました" }
  }

  const cardIds = (cards ?? []).map((c) => c.id)

  // カード間の参照関係を取得
  let references: CardReferenceData[] = []
  if (cardIds.length > 0) {
    const { data: refs, error: refsError } = await supabase
      .from("card_references")
      .select("id, source_card_id, target_card_id, reference_type")
      .in("source_card_id", cardIds)

    if (refsError) {
      console.error("Failed to fetch card references:", refsError)
      return { success: false, error: "参照関係の取得に失敗しました" }
    }

    references = (refs ?? []).map((ref) => ({
      id: ref.id,
      sourceCardId: ref.source_card_id,
      targetCardId: ref.target_card_id,
      referenceType: ref.reference_type,
    }))
  }

  const graphCards: GraphCardData[] = (cards ?? []).map((card) => ({
    id: card.id,
    title: card.title,
    tags: extractTags(card.card_tags),
  }))

  return {
    success: true,
    data: { cards: graphCards, references },
  }
}
