"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import type { CreateLoreCardFormData } from "@/schemas/loreCard"
import {
  isTag,
  isAuthor,
  type LoreCardWithTags,
  type LoreCardWithRelations,
  type Tag,
} from "@/types/loreCard"
import type {
  GetLoreCardsOptions,
  PaginatedLoreCards,
} from "@/types/filter"
import { getDateRangeEndDate, calculatePagination } from "@/utils/pagination"

// アクション結果の型
export type LoreCardActionResult<T = void> = {
  success: boolean
  error?: string
  data?: T
}

// プロジェクト情報の型
type ProjectInfo = {
  id: string
  name: string
  description: string | null
}

// card_tagsからTagを抽出するユーティリティ関数
function extractTags(
  cardTags: Array<{ tags: unknown }> | null | undefined
): Tag[] {
  if (!cardTags) return []
  return cardTags.map((ct) => ct.tags).filter(isTag)
}

// タグIDからフィルタ対象のカードIDを取得
async function getCardIdsByTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  tagIds: string[]
): Promise<{ success: true; cardIds: string[] } | { success: false; error: string }> {
  const { data: cardTagData, error } = await supabase
    .from("card_tags")
    .select("card_id")
    .in("tag_id", tagIds)

  if (error) {
    console.error("Failed to fetch card tags:", error)
    return { success: false, error: "カードの取得に失敗しました" }
  }

  // 重複を除去
  const cardIds = [...new Set(cardTagData.map((ct) => ct.card_id))]
  return { success: true, cardIds }
}

// カード一覧取得
export async function getLoreCards(
  projectId: string
): Promise<LoreCardActionResult<LoreCardWithTags[]>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  // カードとタグを取得
  const { data: cards, error } = await supabase
    .from("lore_cards")
    .select(
      `
      *,
      card_tags (
        tags (*)
      )
    `
    )
    .eq("project_id", projectId)
    .order("updated_at", { ascending: false })

  if (error) {
    console.error("Failed to fetch lore cards:", error)
    return { success: false, error: "カードの取得に失敗しました" }
  }

  // タグをフラット化
  const cardsWithTags: LoreCardWithTags[] = cards.map((card) => ({
    ...card,
    tags: extractTags(card.card_tags),
  }))

  return { success: true, data: cardsWithTags }
}

// カード一覧取得（ページネーション・フィルタ・ソート対応）
export async function getLoreCardsPaginated(
  options: GetLoreCardsOptions
): Promise<LoreCardActionResult<PaginatedLoreCards>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  const {
    projectId,
    page = 1,
    limit = 12,
    search,
    tagIds,
    authorIds,
    dateFrom,
    dateTo,
    sortBy = "updated_at",
    sortOrder = "desc",
  } = options

  // タグフィルタがある場合、対象のカードIDを先に取得
  let filteredCardIds: string[] | null = null
  if (tagIds && tagIds.length > 0) {
    const tagFilterResult = await getCardIdsByTags(supabase, tagIds)
    if (!tagFilterResult.success) {
      return { success: false, error: tagFilterResult.error }
    }

    // タグに該当するカードがない場合は空の結果を返す
    if (tagFilterResult.cardIds.length === 0) {
      return {
        success: true,
        data: { cards: [], total: 0, page, totalPages: 0 },
      }
    }
    filteredCardIds = tagFilterResult.cardIds
  }

  // ベースクエリを構築
  let query = supabase
    .from("lore_cards")
    .select(
      `
      *,
      card_tags (
        tags (*)
      )
    `,
      { count: "exact" }
    )
    .eq("project_id", projectId)

  // フィルタを適用
  if (filteredCardIds) {
    query = query.in("id", filteredCardIds)
  }
  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`
    query = query.or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
  }
  if (authorIds && authorIds.length > 0) {
    query = query.in("author_id", authorIds)
  }
  if (dateFrom) {
    query = query.gte("created_at", dateFrom)
  }
  if (dateTo) {
    query = query.lt("created_at", getDateRangeEndDate(dateTo))
  }

  // ソートとページネーションを適用
  query = query.order(sortBy, { ascending: sortOrder === "asc" })
  const { offset } = calculatePagination(0, page, limit)
  query = query.range(offset, offset + limit - 1)

  const { data: cards, error, count } = await query

  if (error) {
    console.error("Failed to fetch lore cards:", error)
    return { success: false, error: "カードの取得に失敗しました" }
  }

  // 結果を整形して返す
  const cardsWithTags: LoreCardWithTags[] = (cards ?? []).map((card) => ({
    ...card,
    tags: extractTags(card.card_tags),
  }))

  const total = count ?? 0
  const { totalPages } = calculatePagination(total, page, limit)

  return {
    success: true,
    data: { cards: cardsWithTags, total, page, totalPages },
  }
}

// カード詳細取得
export async function getLoreCard(
  projectId: string,
  cardId: string
): Promise<LoreCardActionResult<LoreCardWithRelations>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  // カード、タグ、作成者を取得（プロジェクトIDでスコープ）
  const { data: card, error } = await supabase
    .from("lore_cards")
    .select(
      `
      *,
      card_tags (
        tags (*)
      ),
      profiles:author_id (
        id,
        display_name,
        avatar_url
      )
    `
    )
    .eq("id", cardId)
    .eq("project_id", projectId)
    .single()

  if (error) {
    console.error("Failed to fetch lore card:", error)
    return { success: false, error: "カードの取得に失敗しました" }
  }

  if (!card) {
    return { success: false, error: "カードが見つかりません" }
  }

  // タグをフラット化
  const cardWithRelations: LoreCardWithRelations = {
    ...card,
    tags: extractTags(card.card_tags),
    author: isAuthor(card.profiles) ? card.profiles : null,
  }

  return { success: true, data: cardWithRelations }
}

// カード作成
export async function createLoreCard(
  projectId: string,
  formData: CreateLoreCardFormData
): Promise<LoreCardActionResult<{ id: string }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  // プロジェクトメンバーシップを確認（editor以上）
  const { data: isEditor } = await supabase.rpc("is_project_editor", {
    p_project_id: projectId,
  })

  if (!isEditor) {
    return { success: false, error: "カードを作成する権限がありません" }
  }

  // カード作成
  const { data: card, error } = await supabase
    .from("lore_cards")
    .insert({
      project_id: projectId,
      title: formData.title,
      content: formData.content,
      author_id: user.id,
    })
    .select("id")
    .single()

  if (error || !card) {
    console.error("Failed to create lore card:", error)
    return { success: false, error: "カードの作成に失敗しました" }
  }

  revalidatePath(`/projects/${projectId}/cards`)

  return { success: true, data: { id: card.id } }
}

// プロジェクト情報取得（ヘッダー表示用）
export async function getProject(
  projectId: string
): Promise<ProjectInfo | null> {
  const supabase = await createClient()

  const { data: project, error } = await supabase
    .from("projects")
    .select("id, name, description")
    .eq("id", projectId)
    .single()

  if (error || !project) {
    return null
  }

  return project
}

// @メンション用カード検索の結果型
export type CardMentionSuggestion = {
  id: string
  title: string
}

// @メンション用カード検索
export async function searchCardsForMention(
  projectId: string,
  query: string
): Promise<LoreCardActionResult<CardMentionSuggestion[]>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  // タイトルで部分一致検索（最大10件）
  const { data: cards, error } = await supabase
    .from("lore_cards")
    .select("id, title")
    .eq("project_id", projectId)
    .ilike("title", `%${query}%`)
    .order("title")
    .limit(10)

  if (error) {
    console.error("Failed to search cards for mention:", error)
    return { success: false, error: "カードの検索に失敗しました" }
  }

  return { success: true, data: cards ?? [] }
}

// card_references更新（mentionsタイプ）
export async function updateCardReferences(
  sourceCardId: string,
  mentionedCardIds: string[]
): Promise<LoreCardActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  // 既存のmentions参照を削除
  const { error: deleteError } = await supabase
    .from("card_references")
    .delete()
    .eq("source_card_id", sourceCardId)
    .eq("reference_type", "mentions")

  if (deleteError) {
    console.error("Failed to delete card references:", deleteError)
    return { success: false, error: "参照の更新に失敗しました" }
  }

  // メンションがなければここで終了
  if (mentionedCardIds.length === 0) {
    return { success: true }
  }

  // 重複を除去
  const uniqueCardIds = [...new Set(mentionedCardIds)]

  // 新しい参照を追加
  const references = uniqueCardIds.map((targetCardId) => ({
    source_card_id: sourceCardId,
    target_card_id: targetCardId,
    reference_type: "mentions" as const,
    created_by: user.id,
  }))

  const { error: insertError } = await supabase
    .from("card_references")
    .insert(references)

  if (insertError) {
    console.error("Failed to insert card references:", insertError)
    return { success: false, error: "参照の追加に失敗しました" }
  }

  return { success: true }
}

// カードIDの存在確認（バリデーション用）
export async function validateCardIds(
  projectId: string,
  cardIds: string[]
): Promise<LoreCardActionResult<{ validIds: string[]; invalidIds: string[] }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  if (cardIds.length === 0) {
    return { success: true, data: { validIds: [], invalidIds: [] } }
  }

  // 存在するカードIDを取得
  const { data: existingCards, error } = await supabase
    .from("lore_cards")
    .select("id")
    .eq("project_id", projectId)
    .in("id", cardIds)

  if (error) {
    console.error("Failed to validate card ids:", error)
    return { success: false, error: "カードの検証に失敗しました" }
  }

  const existingIds = new Set(existingCards?.map((c) => c.id) ?? [])
  const validIds = cardIds.filter((id) => existingIds.has(id))
  const invalidIds = cardIds.filter((id) => !existingIds.has(id))

  return { success: true, data: { validIds, invalidIds } }
}
