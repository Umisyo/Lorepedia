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
  const obj = value as Record<string, unknown>
  return (
    typeof obj.id === "string" &&
    (typeof obj.display_name === "string" || obj.display_name === null) &&
    (typeof obj.avatar_url === "string" || obj.avatar_url === null) &&
    typeof obj.created_at === "string" &&
    typeof obj.updated_at === "string"
  )
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

    // 型変換（型ガードを使用）
    const membersWithProfile: ProjectMemberWithProfile[] = (members ?? [])
      .filter((m) => {
        // profileが配列の場合は最初の要素を取得、単一オブジェクトの場合はそのまま
        const profile = Array.isArray(m.profile) ? m.profile[0] : m.profile
        return isProfile(profile) && isMemberRole(m.role)
      })
      .map((m) => {
        const profile = Array.isArray(m.profile) ? m.profile[0] : m.profile
        return {
          project_id: m.project_id,
          user_id: m.user_id,
          role: m.role as MemberRole,
          joined_at: m.joined_at,
          profile: profile as Profile,
        }
      })

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
    // 権限チェック（ownerのみ招待可能）
    const { data: role } = await supabase.rpc("get_user_role", {
      p_project_id: projectId,
      p_user_id: user.id,
    })

    if (role !== "owner") {
      return { success: false, error: "オーナーのみがメンバーを招待できます" }
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
    const { error: insertError } = await supabase
      .from("project_members")
      .insert({
        project_id: projectId,
        user_id: userId,
        role: "editor" as MemberRole,
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
