"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import type {
  CreateLoreCardFormData,
  EditLoreCardFormData,
} from "@/schemas/loreCard"
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

  // いいね情報を取得
  const cardIds = cards.map((card) => card.id)
  const likesInfo = await getCardLikesInfo(supabase, cardIds, user.id)

  // タグをフラット化していいね情報を追加
  const cardsWithTags: LoreCardWithTags[] = cards.map((card) => {
    const likeInfo = likesInfo.get(card.id) ?? { likeCount: 0, isLiked: false }
    return {
      ...card,
      tags: extractTags(card.card_tags),
      likeCount: likeInfo.likeCount,
      isLiked: likeInfo.isLiked,
    }
  })

  return { success: true, data: cardsWithTags }
}

// いいね情報を取得するヘルパー関数
async function getCardLikesInfo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  cardIds: string[],
  userId: string | null
): Promise<Map<string, { likeCount: number; isLiked: boolean }>> {
  const likesMap = new Map<string, { likeCount: number; isLiked: boolean }>()

  if (cardIds.length === 0) {
    return likesMap
  }

  // 初期化
  for (const cardId of cardIds) {
    likesMap.set(cardId, { likeCount: 0, isLiked: false })
  }

  // いいね数を取得
  const { data: likeCounts, error: countError } = await supabase
    .from("card_likes")
    .select("card_id")
    .in("card_id", cardIds)

  if (countError) {
    console.error("Failed to fetch like counts:", countError)
    return likesMap
  }

  // いいね数を集計
  const countMap = new Map<string, number>()
  for (const like of likeCounts ?? []) {
    const current = countMap.get(like.card_id) ?? 0
    countMap.set(like.card_id, current + 1)
  }

  for (const [cardId, count] of countMap) {
    const existing = likesMap.get(cardId)
    if (existing) {
      existing.likeCount = count
    }
  }

  // ログインユーザーのいいね状態を取得
  if (userId) {
    const { data: userLikes, error: userLikesError } = await supabase
      .from("card_likes")
      .select("card_id")
      .in("card_id", cardIds)
      .eq("user_id", userId)

    if (!userLikesError && userLikes) {
      for (const like of userLikes) {
        const existing = likesMap.get(like.card_id)
        if (existing) {
          existing.isLiked = true
        }
      }
    }
  }

  return likesMap
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

  // いいね順ソートの場合は特別処理
  if (sortBy === "likes") {
    return getLoreCardsSortedByLikes(
      supabase,
      {
        projectId,
        page,
        limit,
        search,
        filteredCardIds,
        authorIds,
        dateFrom,
        dateTo,
        sortOrder,
      },
      user.id
    )
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

  // いいね情報を取得
  const cardIds = (cards ?? []).map((card) => card.id)
  const likesInfo = await getCardLikesInfo(supabase, cardIds, user.id)

  // 結果を整形して返す
  const cardsWithTags: LoreCardWithTags[] = (cards ?? []).map((card) => {
    const likeInfo = likesInfo.get(card.id) ?? { likeCount: 0, isLiked: false }
    return {
      ...card,
      tags: extractTags(card.card_tags),
      likeCount: likeInfo.likeCount,
      isLiked: likeInfo.isLiked,
    }
  })

  const total = count ?? 0
  const { totalPages } = calculatePagination(total, page, limit)

  return {
    success: true,
    data: { cards: cardsWithTags, total, page, totalPages },
  }
}

// いいね順でソートされたカード一覧を取得
async function getLoreCardsSortedByLikes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  options: {
    projectId: string
    page: number
    limit: number
    search?: string
    filteredCardIds: string[] | null
    authorIds?: string[]
    dateFrom?: string
    dateTo?: string
    sortOrder: "asc" | "desc"
  },
  userId: string
): Promise<LoreCardActionResult<PaginatedLoreCards>> {
  const {
    projectId,
    page,
    limit,
    search,
    filteredCardIds,
    authorIds,
    dateFrom,
    dateTo,
    sortOrder,
  } = options

  // まず全カードを取得（フィルタのみ適用、ページネーションなし）
  let query = supabase
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

  const { data: allCards, error } = await query

  if (error) {
    console.error("Failed to fetch lore cards:", error)
    return { success: false, error: "カードの取得に失敗しました" }
  }

  if (!allCards || allCards.length === 0) {
    return {
      success: true,
      data: { cards: [], total: 0, page, totalPages: 0 },
    }
  }

  // いいね情報を取得
  const cardIds = allCards.map((card) => card.id)
  const likesInfo = await getCardLikesInfo(supabase, cardIds, userId)

  // カードをいいね数でソート
  const cardsWithLikes = allCards.map((card) => {
    const likeInfo = likesInfo.get(card.id) ?? { likeCount: 0, isLiked: false }
    return {
      ...card,
      tags: extractTags(card.card_tags),
      likeCount: likeInfo.likeCount,
      isLiked: likeInfo.isLiked,
    }
  })

  // いいね数でソート（同数の場合は更新日でソート）
  cardsWithLikes.sort((a, b) => {
    const likeDiff = sortOrder === "desc"
      ? b.likeCount - a.likeCount
      : a.likeCount - b.likeCount
    if (likeDiff !== 0) return likeDiff
    // いいね数が同じ場合は更新日降順
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  })

  // ページネーションを適用
  const total = cardsWithLikes.length
  const { offset, totalPages } = calculatePagination(total, page, limit)
  const paginatedCards = cardsWithLikes.slice(offset, offset + limit)

  return {
    success: true,
    data: { cards: paginatedCards, total, page, totalPages },
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

// カード更新
export async function updateLoreCard(
  projectId: string,
  cardId: string,
  formData: EditLoreCardFormData
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
    return { success: false, error: "カードを編集する権限がありません" }
  }

  // カード存在確認（プロジェクトIDでスコープ）
  const { data: existingCard, error: fetchError } = await supabase
    .from("lore_cards")
    .select("id")
    .eq("id", cardId)
    .eq("project_id", projectId)
    .single()

  if (fetchError || !existingCard) {
    return { success: false, error: "カードが見つかりません" }
  }

  // カード更新
  const { error: updateError } = await supabase
    .from("lore_cards")
    .update({
      title: formData.title,
      content: formData.content,
    })
    .eq("id", cardId)
    .eq("project_id", projectId)

  if (updateError) {
    console.error("Failed to update lore card:", updateError)
    return { success: false, error: "カードの更新に失敗しました" }
  }

  revalidatePath(`/projects/${projectId}/cards/${cardId}`)
  revalidatePath(`/projects/${projectId}/cards`)
  revalidatePath(`/projects/${projectId}`)

  return { success: true, data: { id: cardId } }
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
  // ワイルドカード文字をエスケープしてSQLインジェクション対策
  const escapedQuery = query.replace(/[%_\\]/g, "\\$&")
  const { data: cards, error } = await supabase
    .from("lore_cards")
    .select("id, title")
    .eq("project_id", projectId)
    .ilike("title", `%${escapedQuery}%`)
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
