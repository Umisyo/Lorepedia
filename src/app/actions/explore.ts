"use server"

import { createClient } from "@/utils/supabase/server"
import type { ExploreProject } from "@/types/project"

type GetExploreProjectsParams = {
  page?: number
  limit?: number
  search?: string
}

export type GetExploreProjectsResult =
  | { success: true; projects: ExploreProject[]; totalCount: number }
  | { success: false; error: string }

export async function getExploreProjects({
  page = 1,
  limit = 12,
  search,
}: GetExploreProjectsParams = {}): Promise<GetExploreProjectsResult> {
  const supabase = await createClient()

  // 現在のユーザーを取得（未ログインでもOK）
  const {
    data: { user },
  } = await supabase.auth.getUser()

  try {
    // 公開プロジェクトのカウント
    let countQuery = supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("is_public_editable", true)

    if (search) {
      countQuery = countQuery.ilike("name", `%${search}%`)
    }

    const { count: totalCount, error: countError } = await countQuery

    if (countError) {
      console.error("プロジェクト数取得エラー:", countError)
      return { success: false, error: "プロジェクト一覧の取得に失敗しました" }
    }

    // 公開プロジェクト一覧を取得
    const offset = (page - 1) * limit
    let query = supabase
      .from("projects")
      .select("*")
      .eq("is_public_editable", true)
      .order("updated_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.ilike("name", `%${search}%`)
    }

    const { data: projects, error: projectsError } = await query

    if (projectsError) {
      console.error("プロジェクト取得エラー:", projectsError)
      return { success: false, error: "プロジェクト一覧の取得に失敗しました" }
    }

    if (!projects || projects.length === 0) {
      return { success: true, projects: [], totalCount: totalCount ?? 0 }
    }

    // 各プロジェクトの付加情報を並列取得
    const projectIds = projects.map((p) => p.id)

    const [tagsResult, membersCountResult, ownerProfilesResult, userMembershipsResult] =
      await Promise.all([
        // タグ一覧
        supabase
          .from("project_tags")
          .select("project_id, name")
          .in("project_id", projectIds),
        // メンバー数
        Promise.all(
          projectIds.map(async (projectId) => {
            const { count } = await supabase
              .from("project_members")
              .select("*", { count: "exact", head: true })
              .eq("project_id", projectId)
            return { projectId, count: count ?? 0 }
          })
        ),
        // オーナープロファイル
        supabase
          .from("profiles")
          .select("id, display_name")
          .in(
            "id",
            projects.map((p) => p.owner_id)
          ),
        // 現在のユーザーのメンバーシップ
        user
          ? supabase
              .from("project_members")
              .select("project_id")
              .eq("user_id", user.id)
              .in("project_id", projectIds)
          : Promise.resolve({ data: null, error: null }),
      ])

    // タグをプロジェクトIDでグルーピング
    const tagsByProject = new Map<string, string[]>()
    if (tagsResult.data) {
      for (const tag of tagsResult.data) {
        const existing = tagsByProject.get(tag.project_id) ?? []
        existing.push(tag.name)
        tagsByProject.set(tag.project_id, existing)
      }
    }

    // メンバー数をプロジェクトIDでマッピング
    const memberCountByProject = new Map<string, number>()
    for (const mc of membersCountResult) {
      memberCountByProject.set(mc.projectId, mc.count)
    }

    // オーナー名をIDでマッピング
    const ownerNameById = new Map<string, string | null>()
    if (ownerProfilesResult.data) {
      for (const profile of ownerProfilesResult.data) {
        ownerNameById.set(profile.id, profile.display_name)
      }
    }

    // ユーザーのメンバーシップをSetで管理
    const userMemberProjectIds = new Set<string>()
    if (userMembershipsResult.data) {
      for (const m of userMembershipsResult.data) {
        userMemberProjectIds.add(m.project_id)
      }
    }

    // ExploreProject型に変換
    const exploreProjects: ExploreProject[] = projects.map((project) => ({
      ...project,
      tags: tagsByProject.get(project.id) ?? [],
      memberCount: memberCountByProject.get(project.id) ?? 0,
      ownerName: ownerNameById.get(project.owner_id) ?? null,
      isMember: userMemberProjectIds.has(project.id),
    }))

    return {
      success: true,
      projects: exploreProjects,
      totalCount: totalCount ?? 0,
    }
  } catch (error) {
    console.error("予期しないエラー:", error)
    return {
      success: false,
      error: "予期しないエラーが発生しました。再度お試しください。",
    }
  }
}
