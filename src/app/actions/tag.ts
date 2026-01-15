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
