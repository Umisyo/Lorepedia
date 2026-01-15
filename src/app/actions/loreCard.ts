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
    const { data: cardTagData, error: cardTagError } = await supabase
      .from("card_tags")
      .select("card_id")
      .in("tag_id", tagIds)

    if (cardTagError) {
      console.error("Failed to fetch card tags:", cardTagError)
      return { success: false, error: "カードの取得に失敗しました" }
    }

    // 重複を除去
    filteredCardIds = [...new Set(cardTagData.map((ct) => ct.card_id))]

    // タグに該当するカードがない場合は空の結果を返す
    if (filteredCardIds.length === 0) {
      return {
        success: true,
        data: {
          cards: [],
          total: 0,
          page,
          totalPages: 0,
        },
      }
    }
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

  // タグフィルタ適用
  if (filteredCardIds) {
    query = query.in("id", filteredCardIds)
  }

  // キーワード検索
  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`
    query = query.or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
  }

  // 作成者フィルタ
  if (authorIds && authorIds.length > 0) {
    query = query.in("author_id", authorIds)
  }

  // 期間フィルタ
  if (dateFrom) {
    query = query.gte("created_at", dateFrom)
  }
  if (dateTo) {
    // dateTo の日付の終わりまでを含めるため、翌日を指定
    const endDate = new Date(dateTo)
    endDate.setDate(endDate.getDate() + 1)
    query = query.lt("created_at", endDate.toISOString().split("T")[0])
  }

  // ソート
  query = query.order(sortBy, { ascending: sortOrder === "asc" })

  // ページネーション
  const offset = (page - 1) * limit
  query = query.range(offset, offset + limit - 1)

  const { data: cards, error, count } = await query

  if (error) {
    console.error("Failed to fetch lore cards:", error)
    return { success: false, error: "カードの取得に失敗しました" }
  }

  // タグをフラット化
  const cardsWithTags: LoreCardWithTags[] = (cards ?? []).map((card) => ({
    ...card,
    tags: extractTags(card.card_tags),
  }))

  const total = count ?? 0
  const totalPages = Math.ceil(total / limit)

  return {
    success: true,
    data: {
      cards: cardsWithTags,
      total,
      page,
      totalPages,
    },
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
