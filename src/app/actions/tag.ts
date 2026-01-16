"use server"

import { createClient } from "@/utils/supabase/server"
import type { Tag } from "@/types/loreCard"

// アクション結果の型
export type TagActionResult<T = void> = {
  success: boolean
  error?: string
  data?: T
}

// プロジェクトのタグ一覧を取得
export async function getProjectTags(
  projectId: string
): Promise<TagActionResult<Tag[]>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  const { data: tags, error } = await supabase
    .from("tags")
    .select("*")
    .eq("project_id", projectId)
    .order("name", { ascending: true })

  if (error) {
    console.error("Failed to fetch tags:", error)
    return { success: false, error: "タグの取得に失敗しました" }
  }

  return { success: true, data: tags ?? [] }
}

// カードのタグを更新
export async function updateCardTags(
  projectId: string,
  cardId: string,
  tagIds: string[]
): Promise<TagActionResult> {
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  // 権限チェック（editor以上）
  const { data: isEditor } = await supabase.rpc("is_project_editor", {
    p_project_id: projectId,
  })
  if (!isEditor) {
    return { success: false, error: "権限がありません" }
  }

  // カードの存在確認
  const { data: card, error: cardError } = await supabase
    .from("lore_cards")
    .select("id")
    .eq("id", cardId)
    .eq("project_id", projectId)
    .single()

  if (cardError || !card) {
    return { success: false, error: "カードが見つかりません" }
  }

  // 現在のタグを取得
  const { data: currentTags, error: currentTagsError } = await supabase
    .from("card_tags")
    .select("tag_id")
    .eq("card_id", cardId)

  if (currentTagsError) {
    console.error("Failed to fetch current tags:", currentTagsError)
    return { success: false, error: "現在のタグの取得に失敗しました" }
  }

  const currentTagIds = currentTags?.map((ct) => ct.tag_id) ?? []

  // 差分計算（Setを使用してO(n)で処理）
  const currentSet = new Set(currentTagIds)
  const newSet = new Set(tagIds)
  const toDelete = currentTagIds.filter((id) => !newSet.has(id))
  const toAdd = tagIds.filter((id) => !currentSet.has(id))

  // 削除対象のタグを削除
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from("card_tags")
      .delete()
      .eq("card_id", cardId)
      .in("tag_id", toDelete)

    if (deleteError) {
      console.error("Failed to delete tags:", deleteError)
      return { success: false, error: "タグの削除に失敗しました" }
    }
  }

  // 追加対象のタグを追加
  if (toAdd.length > 0) {
    const insertData = toAdd.map((tagId) => ({
      card_id: cardId,
      tag_id: tagId,
    }))

    const { error: insertError } = await supabase
      .from("card_tags")
      .insert(insertData)

    if (insertError) {
      console.error("Failed to insert tags:", insertError)
      return { success: false, error: "タグの追加に失敗しました" }
    }
  }

  // キャッシュ再検証
  const { revalidatePath } = await import("next/cache")
  revalidatePath(`/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}/cards`)
  revalidatePath(`/projects/${projectId}/cards/${cardId}`)

  return { success: true }
}
