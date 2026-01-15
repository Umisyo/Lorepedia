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
