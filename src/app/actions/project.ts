"use server"

import { createClient } from "@/utils/supabase/server"
import {
  createProjectSchema,
  type CreateProjectFormData,
} from "@/schemas/project"

export type CreateProjectResult = {
  success: boolean
  projectId?: string
  error?: string
}

export async function createProject(
  data: CreateProjectFormData
): Promise<CreateProjectResult> {
  const supabase = await createClient()

  // 1. 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  // 2. バリデーション
  const parsed = createProjectSchema.safeParse(data)

  if (!parsed.success) {
    // 最初のエラーメッセージを返す
    const firstError = parsed.error.issues[0]
    return {
      success: false,
      error: firstError?.message || "入力内容に誤りがあります",
    }
  }

  const { name, description, isPublicEditable, tags } = parsed.data

  try {
    // 3. プロジェクト作成
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        name,
        description: description || null,
        is_public_editable: isPublicEditable,
        owner_id: user.id,
      })
      .select("id")
      .single()

    if (projectError) {
      console.error("プロジェクト作成エラー:", projectError)
      return { success: false, error: "プロジェクトの作成に失敗しました" }
    }

    if (!project) {
      return { success: false, error: "プロジェクトの作成に失敗しました" }
    }

    // 4. タグ作成（ある場合）
    if (tags.length > 0) {
      const tagRecords = tags.map((tag) => ({
        project_id: project.id,
        name: tag,
      }))

      const { error: tagError } = await supabase
        .from("project_tags")
        .insert(tagRecords)

      if (tagError) {
        console.error("タグ作成エラー:", tagError)
        // タグ作成に失敗してもプロジェクト作成は成功とする
        // ユーザーは後からタグを追加できる
      }
    }

    return { success: true, projectId: project.id }
  } catch (error) {
    console.error("予期しないエラー:", error)
    return {
      success: false,
      error: "予期しないエラーが発生しました。再度お試しください。",
    }
  }
}
