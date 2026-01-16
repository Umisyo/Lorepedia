"use server"

import { createClient } from "@/utils/supabase/server"
import {
  createProjectSchema,
  updateProjectSchema,
  type CreateProjectFormData,
  type UpdateProjectFormData,
} from "@/schemas/project"
import type { ProjectWithTags } from "@/types/project"

export type CreateProjectResult = {
  success: boolean
  projectId?: string
  error?: string
  warnings?: string[]
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
      error: firstError?.message ?? "入力内容に誤りがあります",
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
    const warnings: string[] = []
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
        // ユーザーは後からタグを追加できるが、警告を返す
        warnings.push(
          "タグの作成に一部失敗しました。後から追加することができます。"
        )
      }
    }

    return {
      success: true,
      projectId: project.id,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  } catch (error) {
    console.error("予期しないエラー:", error)
    return {
      success: false,
      error: "予期しないエラーが発生しました。再度お試しください。",
    }
  }
}

// プロジェクト+タグ取得結果
export type GetProjectWithTagsResult = {
  success: boolean
  project?: ProjectWithTags
  error?: string
}

// プロジェクト+タグを取得
export async function getProjectWithTags(
  projectId: string
): Promise<GetProjectWithTagsResult> {
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  try {
    // プロジェクト取得
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single()

    if (projectError || !project) {
      return { success: false, error: "プロジェクトが見つかりません" }
    }

    // タグ取得
    const { data: tags } = await supabase
      .from("project_tags")
      .select("name")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })

    return {
      success: true,
      project: {
        ...project,
        tags: tags?.map((t) => t.name) ?? [],
      },
    }
  } catch (error) {
    console.error("プロジェクト取得エラー:", error)
    return { success: false, error: "プロジェクトの取得に失敗しました" }
  }
}

// プロジェクト更新結果
export type UpdateProjectResult = {
  success: boolean
  error?: string
  warnings?: string[]
}

// プロジェクト更新（editor以上）
export async function updateProject(
  projectId: string,
  data: UpdateProjectFormData
): Promise<UpdateProjectResult> {
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  // バリデーション
  const parsed = updateProjectSchema.safeParse(data)

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? "入力内容に誤りがあります",
    }
  }

  const { name, description, isPublicEditable, tags } = parsed.data

  try {
    // 権限チェック（RLSでもチェックされるが明示的に）
    const { data: role } = await supabase.rpc("get_user_role", {
      p_project_id: projectId,
      p_user_id: user.id,
    })

    if (role !== "owner" && role !== "editor") {
      return { success: false, error: "編集権限がありません" }
    }

    // プロジェクト更新
    const { error: updateError } = await supabase
      .from("projects")
      .update({
        name,
        description: description || null,
        is_public_editable: isPublicEditable,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)

    if (updateError) {
      console.error("プロジェクト更新エラー:", updateError)
      return { success: false, error: "プロジェクトの更新に失敗しました" }
    }

    // タグ更新（アトミック: 失敗時は元のタグを復元）
    const warnings: string[] = []

    // 既存タグを取得（復元用）
    const { data: existingTags } = await supabase
      .from("project_tags")
      .select("name")
      .eq("project_id", projectId)

    const originalTags = existingTags?.map((t) => t.name) ?? []

    // 既存タグ削除
    const { error: deleteTagError } = await supabase
      .from("project_tags")
      .delete()
      .eq("project_id", projectId)

    if (deleteTagError) {
      console.error("タグ削除エラー:", deleteTagError)
      warnings.push("タグの更新に一部失敗しました")
    } else {
      // 新規タグ作成
      if (tags.length > 0) {
        const tagRecords = tags.map((tag) => ({
          project_id: projectId,
          name: tag,
        }))

        const { error: insertTagError } = await supabase
          .from("project_tags")
          .insert(tagRecords)

        if (insertTagError) {
          console.error("タグ作成エラー:", insertTagError)

          // 挿入失敗時は元のタグを復元
          if (originalTags.length > 0) {
            const restoreRecords = originalTags.map((tag) => ({
              project_id: projectId,
              name: tag,
            }))
            await supabase.from("project_tags").insert(restoreRecords)
          }

          warnings.push("タグの更新に失敗したため、元のタグを復元しました")
        }
      }
    }

    return {
      success: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  } catch (error) {
    console.error("予期しないエラー:", error)
    return {
      success: false,
      error: "予期しないエラーが発生しました。再度お試しください。",
    }
  }
}

// プロジェクト削除結果
export type DeleteProjectResult = {
  success: boolean
  error?: string
}

// プロジェクト削除（ownerのみ）
export async function deleteProject(
  projectId: string
): Promise<DeleteProjectResult> {
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  try {
    // 権限チェック（ownerのみ）
    const { data: role } = await supabase.rpc("get_user_role", {
      p_project_id: projectId,
      p_user_id: user.id,
    })

    if (role !== "owner") {
      return { success: false, error: "オーナーのみがプロジェクトを削除できます" }
    }

    // プロジェクト削除（CASCADE設定により関連データも削除される）
    const { error: deleteError } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId)

    if (deleteError) {
      console.error("プロジェクト削除エラー:", deleteError)
      return { success: false, error: "プロジェクトの削除に失敗しました" }
    }

    return { success: true }
  } catch (error) {
    console.error("予期しないエラー:", error)
    return {
      success: false,
      error: "予期しないエラーが発生しました。再度お試しください。",
    }
  }
}
