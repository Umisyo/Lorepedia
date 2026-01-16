"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

// アクション結果の型
export type CardLikeActionResult<T = void> = {
  success: boolean
  error?: string
  data?: T
}

// いいねのトグル
export async function toggleCardLike(
  cardId: string,
  projectId: string
): Promise<CardLikeActionResult<{ isLiked: boolean; likeCount: number }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  // 現在のいいね状態を確認
  const { data: existingLike, error: fetchError } = await supabase
    .from("card_likes")
    .select("card_id")
    .eq("card_id", cardId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (fetchError) {
    console.error("Failed to fetch card like status:", fetchError)
    return { success: false, error: "いいねの状態取得に失敗しました" }
  }

  let isLiked: boolean

  if (existingLike) {
    // いいねを解除
    const { error: deleteError } = await supabase
      .from("card_likes")
      .delete()
      .eq("card_id", cardId)
      .eq("user_id", user.id)

    if (deleteError) {
      console.error("Failed to remove card like:", deleteError)
      return { success: false, error: "いいねの解除に失敗しました" }
    }
    isLiked = false
  } else {
    // いいねを追加
    const { error: insertError } = await supabase.from("card_likes").insert({
      card_id: cardId,
      user_id: user.id,
    })

    if (insertError) {
      console.error("Failed to add card like:", insertError)
      return { success: false, error: "いいねの追加に失敗しました" }
    }
    isLiked = true
  }

  // 最新のいいね数を取得
  const { count, error: countError } = await supabase
    .from("card_likes")
    .select("*", { count: "exact", head: true })
    .eq("card_id", cardId)

  if (countError) {
    console.error("Failed to get like count:", countError)
    // いいね数の取得に失敗しても、トグル自体は成功しているので警告のみ
  }

  revalidatePath(`/projects/${projectId}`)
  revalidatePath(`/projects/${projectId}/cards`)
  revalidatePath(`/projects/${projectId}/cards/${cardId}`)

  return {
    success: true,
    data: {
      isLiked,
      likeCount: count ?? 0,
    },
  }
}

// いいね状態の取得（単一カード用）
export async function getCardLikeStatus(
  cardId: string
): Promise<CardLikeActionResult<{ isLiked: boolean; likeCount: number }>> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // いいね数を取得
  const { count, error: countError } = await supabase
    .from("card_likes")
    .select("*", { count: "exact", head: true })
    .eq("card_id", cardId)

  if (countError) {
    console.error("Failed to get like count:", countError)
    return { success: false, error: "いいね数の取得に失敗しました" }
  }

  // ログインしている場合はユーザーのいいね状態も確認
  let isLiked = false
  if (user) {
    const { data: existingLike, error: fetchError } = await supabase
      .from("card_likes")
      .select("card_id")
      .eq("card_id", cardId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (fetchError) {
      console.error("Failed to fetch card like status:", fetchError)
      return { success: false, error: "いいねの状態取得に失敗しました" }
    }

    isLiked = !!existingLike
  }

  return {
    success: true,
    data: {
      isLiked,
      likeCount: count ?? 0,
    },
  }
}
