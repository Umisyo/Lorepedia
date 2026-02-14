"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/utils/supabase/server"

export type MembershipActionResult = {
  success: boolean
  error?: string
}

// 公開プロジェクトにviewerとして自己参加
export async function joinProject(
  projectId: string
): Promise<MembershipActionResult> {
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  try {
    // プロジェクトの公開設定を確認
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("is_public_editable")
      .eq("id", projectId)
      .single()

    if (projectError || !project) {
      return { success: false, error: "プロジェクトが見つかりません" }
    }

    if (!project.is_public_editable) {
      return { success: false, error: "このプロジェクトは公開されていません" }
    }

    // 既存メンバーチェック
    const { data: existingMember } = await supabase
      .from("project_members")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (existingMember) {
      return { success: false, error: "すでにこのプロジェクトに参加しています" }
    }

    // viewerとして参加
    const { error: insertError } = await supabase
      .from("project_members")
      .insert({
        project_id: projectId,
        user_id: user.id,
        role: "viewer",
      })

    if (insertError) {
      console.error("プロジェクト参加エラー:", insertError)
      return { success: false, error: "プロジェクトへの参加に失敗しました" }
    }

    revalidatePath("/dashboard")
    revalidatePath("/explore")

    return { success: true }
  } catch (error) {
    console.error("予期しないエラー:", error)
    return {
      success: false,
      error: "予期しないエラーが発生しました。再度お試しください。",
    }
  }
}

// viewerの自己離脱
export async function leaveProject(
  projectId: string
): Promise<MembershipActionResult> {
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  try {
    // 現在のロールを確認（viewerのみ離脱可能）
    const { data: membership, error: memberError } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single()

    if (memberError || !membership) {
      return { success: false, error: "このプロジェクトに参加していません" }
    }

    if (membership.role !== "viewer") {
      return {
        success: false,
        error: "オーナーまたは編集者はこの操作を実行できません",
      }
    }

    // メンバーシップ削除
    const { error: deleteError } = await supabase
      .from("project_members")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", user.id)

    if (deleteError) {
      console.error("プロジェクト離脱エラー:", deleteError)
      return { success: false, error: "プロジェクトからの離脱に失敗しました" }
    }

    revalidatePath("/dashboard")
    revalidatePath("/explore")

    return { success: true }
  } catch (error) {
    console.error("予期しないエラー:", error)
    return {
      success: false,
      error: "予期しないエラーが発生しました。再度お試しください。",
    }
  }
}
