"use server"

import { createClient } from "@/utils/supabase/server"
import type { CardReferenceData, CardReferenceWithTitle, Tag } from "@/types/loreCard"
import { isTag } from "@/types/loreCard"
import { createCardReferenceSchema } from "@/schemas/cardReference"

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

// アクション結果の型
type ActionResult<T = void> = {
  success: boolean
  error?: string
  data?: T
}

// 特定カードの参照関係を双方向で取得
export async function getCardReferencesForCard(
  cardId: string
): Promise<ActionResult<CardReferenceWithTitle[]>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  // source（このカードから出ている参照）を取得
  const { data: outgoing, error: outError } = await supabase
    .from("card_references")
    .select(`
      id,
      source_card_id,
      target_card_id,
      reference_type,
      target_card:lore_cards!card_references_target_card_id_fkey (id, title)
    `)
    .eq("source_card_id", cardId)

  if (outError) {
    console.error("Failed to fetch outgoing references:", outError)
    return { success: false, error: "参照関係の取得に失敗しました" }
  }

  // target（このカードに入ってくる参照）を取得
  const { data: incoming, error: inError } = await supabase
    .from("card_references")
    .select(`
      id,
      source_card_id,
      target_card_id,
      reference_type,
      source_card:lore_cards!card_references_source_card_id_fkey (id, title)
    `)
    .eq("target_card_id", cardId)

  if (inError) {
    console.error("Failed to fetch incoming references:", inError)
    return { success: false, error: "参照関係の取得に失敗しました" }
  }

  const references: CardReferenceWithTitle[] = [
    ...(outgoing ?? []).map((ref) => {
      const card = ref.target_card as unknown as { id: string; title: string } | null
      return {
        id: ref.id,
        sourceCardId: ref.source_card_id,
        targetCardId: ref.target_card_id,
        referenceType: ref.reference_type,
        relatedCard: card ?? { id: ref.target_card_id, title: "不明なカード" },
        direction: "outgoing" as const,
      }
    }),
    ...(incoming ?? []).map((ref) => {
      const card = ref.source_card as unknown as { id: string; title: string } | null
      return {
        id: ref.id,
        sourceCardId: ref.source_card_id,
        targetCardId: ref.target_card_id,
        referenceType: ref.reference_type,
        relatedCard: card ?? { id: ref.source_card_id, title: "不明なカード" },
        direction: "incoming" as const,
      }
    }),
  ]

  return { success: true, data: references }
}

// カード参照を作成
export async function createCardReference(
  params: unknown
): Promise<ActionResult<{ id: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  // バリデーション
  const parsed = createCardReferenceSchema.safeParse(params)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "入力が不正です" }
  }

  const { sourceCardId, targetCardId, referenceType } = parsed.data

  // ソースカードのプロジェクトIDを取得して権限チェック
  const { data: sourceCard, error: sourceError } = await supabase
    .from("lore_cards")
    .select("project_id")
    .eq("id", sourceCardId)
    .single()

  if (sourceError || !sourceCard) {
    return { success: false, error: "カードが見つかりません" }
  }

  // editor権限チェック
  const { data: isEditor } = await supabase.rpc("is_project_editor", {
    p_project_id: sourceCard.project_id,
  })
  if (!isEditor) {
    return { success: false, error: "編集権限がありません" }
  }

  // ターゲットカードが同一プロジェクトに属するか確認
  const { data: targetCard, error: targetError } = await supabase
    .from("lore_cards")
    .select("project_id")
    .eq("id", targetCardId)
    .single()

  if (targetError || !targetCard) {
    return { success: false, error: "対象カードが見つかりません" }
  }

  if (sourceCard.project_id !== targetCard.project_id) {
    return { success: false, error: "異なるプロジェクトのカードは参照できません" }
  }

  // 重複チェック
  const { data: existing } = await supabase
    .from("card_references")
    .select("id")
    .eq("source_card_id", sourceCardId)
    .eq("target_card_id", targetCardId)
    .eq("reference_type", referenceType)
    .maybeSingle()

  if (existing) {
    return { success: false, error: "同じ参照が既に存在します" }
  }

  // INSERT
  const { data: inserted, error: insertError } = await supabase
    .from("card_references")
    .insert({
      source_card_id: sourceCardId,
      target_card_id: targetCardId,
      reference_type: referenceType,
      created_by: user.id,
    })
    .select("id")
    .single()

  if (insertError) {
    console.error("Failed to create card reference:", insertError)
    return { success: false, error: "参照の作成に失敗しました" }
  }

  return { success: true, data: { id: inserted.id } }
}

// カード参照を削除
export async function deleteCardReference(
  referenceId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  // 参照を取得して検証
  const { data: reference, error: refError } = await supabase
    .from("card_references")
    .select("id, reference_type, source_card_id")
    .eq("id", referenceId)
    .single()

  if (refError || !reference) {
    return { success: false, error: "参照が見つかりません" }
  }

  // mentionsタイプは手動削除不可（エディタの@mentionで自動管理）
  if (reference.reference_type === "mentions") {
    return { success: false, error: "言及タイプの参照は手動で削除できません" }
  }

  // ソースカードのプロジェクトIDを取得して権限チェック
  const { data: sourceCard, error: sourceError } = await supabase
    .from("lore_cards")
    .select("project_id")
    .eq("id", reference.source_card_id)
    .single()

  if (sourceError || !sourceCard) {
    return { success: false, error: "カードが見つかりません" }
  }

  // editor権限チェック
  const { data: isEditor } = await supabase.rpc("is_project_editor", {
    p_project_id: sourceCard.project_id,
  })
  if (!isEditor) {
    return { success: false, error: "編集権限がありません" }
  }

  // DELETE
  const { error: deleteError } = await supabase
    .from("card_references")
    .delete()
    .eq("id", referenceId)

  if (deleteError) {
    console.error("Failed to delete card reference:", deleteError)
    return { success: false, error: "参照の削除に失敗しました" }
  }

  return { success: true }
}
