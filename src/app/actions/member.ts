"use server"

import { createClient } from "@/utils/supabase/server"
import type {
  ProjectMemberWithProfile,
  UserSearchResult,
  MemberRole,
  Profile,
} from "@/types/project"

// メンバー一覧取得結果
export type GetProjectMembersResult = {
  success: boolean
  members?: ProjectMemberWithProfile[]
  error?: string
}

// プロファイル型ガード
function isProfile(value: unknown): value is Profile {
  if (typeof value !== "object" || value === null) return false

  // in演算子で必要なプロパティの存在を確認
  if (
    !("id" in value) ||
    !("display_name" in value) ||
    !("avatar_url" in value) ||
    !("created_at" in value) ||
    !("updated_at" in value)
  ) {
    return false
  }

  // この時点でvalueは必要なプロパティを持つオブジェクト
  return (
    typeof value.id === "string" &&
    (typeof value.display_name === "string" || value.display_name === null) &&
    (typeof value.avatar_url === "string" || value.avatar_url === null) &&
    typeof value.created_at === "string" &&
    typeof value.updated_at === "string"
  )
}

// プロファイル抽出ヘルパー（型ガード検証済みの値から安全に抽出）
function extractProfile(value: unknown): Profile | null {
  const profile = Array.isArray(value) ? value[0] : value
  if (isProfile(profile)) {
    return profile
  }
  return null
}

// メンバーロール型ガード
function isMemberRole(value: unknown): value is MemberRole {
  return value === "owner" || value === "editor" || value === "viewer"
}

// メンバー一覧取得
export async function getProjectMembers(
  projectId: string
): Promise<GetProjectMembersResult> {
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  try {
    // メンバー + プロファイル取得
    const { data: members, error } = await supabase
      .from("project_members")
      .select(
        `
        project_id,
        user_id,
        role,
        joined_at,
        profile:profiles!project_members_user_id_fkey (
          id,
          display_name,
          avatar_url,
          created_at,
          updated_at
        )
      `
      )
      .eq("project_id", projectId)
      .order("joined_at", { ascending: true })

    if (error) {
      console.error("メンバー取得エラー:", error)
      return { success: false, error: "メンバー一覧の取得に失敗しました" }
    }

    // 型変換（型ガードを使用してアサーションを回避）
    const membersWithProfile: ProjectMemberWithProfile[] = []
    for (const m of members ?? []) {
      const profile = extractProfile(m.profile)
      if (profile && isMemberRole(m.role)) {
        membersWithProfile.push({
          project_id: m.project_id,
          user_id: m.user_id,
          role: m.role,
          joined_at: m.joined_at,
          profile,
        })
      }
    }

    return { success: true, members: membersWithProfile }
  } catch (error) {
    console.error("予期しないエラー:", error)
    return { success: false, error: "メンバー一覧の取得に失敗しました" }
  }
}

// メンバー招待結果
export type InviteMemberResult = {
  success: boolean
  error?: string
}

// メンバー招待（ownerのみ）
export async function inviteMember(
  projectId: string,
  userId: string
): Promise<InviteMemberResult> {
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  try {
    // 権限チェック（ownerのみ招待可能）とプロジェクト設定を並列取得
    const [roleResult, projectResult] = await Promise.all([
      supabase.rpc("get_user_role", {
        p_project_id: projectId,
        p_user_id: user.id,
      }),
      supabase
        .from("projects")
        .select("is_public_editable")
        .eq("id", projectId)
        .single(),
    ])

    if (roleResult.data !== "owner") {
      return { success: false, error: "オーナーのみがメンバーを招待できます" }
    }

    // is_public_editableがtrueの場合は招待不可
    if (projectResult.data?.is_public_editable) {
      return {
        success: false,
        error:
          "「誰でも編集可能」が有効なプロジェクトではメンバー招待できません",
      }
    }

    // 既存メンバーチェック
    const { data: existingMember } = await supabase
      .from("project_members")
      .select("user_id")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .single()

    if (existingMember) {
      return { success: false, error: "このユーザーは既にメンバーです" }
    }

    // メンバー追加（editor権限）
    const editorRole: MemberRole = "editor"
    const { error: insertError } = await supabase
      .from("project_members")
      .insert({
        project_id: projectId,
        user_id: userId,
        role: editorRole,
      })

    if (insertError) {
      console.error("メンバー追加エラー:", insertError)
      return { success: false, error: "メンバーの招待に失敗しました" }
    }

    return { success: true }
  } catch (error) {
    console.error("予期しないエラー:", error)
    return { success: false, error: "メンバーの招待に失敗しました" }
  }
}

// メンバー削除結果
export type RemoveMemberResult = {
  success: boolean
  error?: string
}

// メンバー削除（ownerのみ）
export async function removeMember(
  projectId: string,
  userId: string
): Promise<RemoveMemberResult> {
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  try {
    // 自分自身を削除しようとしていないかチェック
    if (user.id === userId) {
      return { success: false, error: "自分自身を削除することはできません" }
    }

    // 権限チェック（ownerのみ削除可能）
    const { data: role } = await supabase.rpc("get_user_role", {
      p_project_id: projectId,
      p_user_id: user.id,
    })

    if (role !== "owner") {
      return { success: false, error: "オーナーのみがメンバーを削除できます" }
    }

    // 対象ユーザーのロールを確認（ownerは削除不可）
    const { data: targetRole } = await supabase.rpc("get_user_role", {
      p_project_id: projectId,
      p_user_id: userId,
    })

    if (targetRole === "owner") {
      return { success: false, error: "オーナーを削除することはできません" }
    }

    // メンバー削除
    const { error: deleteError } = await supabase
      .from("project_members")
      .delete()
      .eq("project_id", projectId)
      .eq("user_id", userId)

    if (deleteError) {
      console.error("メンバー削除エラー:", deleteError)
      return { success: false, error: "メンバーの削除に失敗しました" }
    }

    return { success: true }
  } catch (error) {
    console.error("予期しないエラー:", error)
    return { success: false, error: "メンバーの削除に失敗しました" }
  }
}

// ユーザー検索結果
export type SearchUsersResult = {
  success: boolean
  users?: UserSearchResult[]
  error?: string
}

// ユーザー検索（既存メンバーを除外）
export async function searchUsers(
  query: string,
  excludeProjectId: string
): Promise<SearchUsersResult> {
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  // 空クエリの場合は空配列を返す
  if (!query.trim()) {
    return { success: true, users: [] }
  }

  try {
    // display_nameで前方一致検索
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .ilike("display_name", `${query}%`)
      .limit(10)

    if (error) {
      console.error("ユーザー検索エラー:", error)
      return { success: false, error: "ユーザーの検索に失敗しました" }
    }

    // 既存メンバーを除外
    const { data: existingMembers } = await supabase
      .from("project_members")
      .select("user_id")
      .eq("project_id", excludeProjectId)

    const existingUserIds = new Set(existingMembers?.map((m) => m.user_id) ?? [])

    const filteredUsers: UserSearchResult[] = (profiles ?? [])
      .filter((p) => !existingUserIds.has(p.id))
      .map((p) => ({
        id: p.id,
        displayName: p.display_name,
        avatarUrl: p.avatar_url,
      }))

    return { success: true, users: filteredUsers }
  } catch (error) {
    console.error("予期しないエラー:", error)
    return { success: false, error: "ユーザーの検索に失敗しました" }
  }
}
