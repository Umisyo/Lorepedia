import Link from "next/link"
import { redirect } from "next/navigation"
import { Plus } from "lucide-react"

import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { ProjectCard } from "@/components/features/ProjectCard"
import { EmptyState } from "@/components/features/EmptyState"
import type { ProjectWithMeta, MemberRole, Project } from "@/types/project"

// Supabaseクエリ結果の型
type MembershipWithProject = {
  role: MemberRole
  project: Project | null
}

// 参加中プロジェクト一覧を取得
async function getProjects(userId: string): Promise<ProjectWithMeta[]> {
  const supabase = await createClient()

  // ユーザーが参加しているプロジェクトを取得
  const { data: memberships, error } = await supabase
    .from("project_members")
    .select(
      `
      role,
      project:projects (
        id,
        name,
        description,
        owner_id,
        created_at,
        updated_at
      )
    `
    )
    .eq("user_id", userId)
    .order("joined_at", { ascending: false })

  if (error || !memberships) {
    console.error("Failed to fetch projects:", error)
    return []
  }

  // 型安全にデータを変換
  const typedMemberships = memberships as unknown as MembershipWithProject[]

  // 各プロジェクトのメンバー数を取得
  const projectsWithMeta: ProjectWithMeta[] = await Promise.all(
    typedMemberships
      .filter((m): m is MembershipWithProject & { project: Project } => m.project !== null)
      .map(async (membership) => {
        const project = membership.project

        const { count } = await supabase
          .from("project_members")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id)

        return {
          ...project,
          memberCount: count ?? 1,
          myRole: membership.role,
        }
      })
  )

  return projectsWithMeta
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 未ログインの場合はログインページにリダイレクト
  if (!user) {
    redirect("/login")
  }

  const projects = await getProjects(user.id)

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* ページヘッダー */}
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            新規プロジェクト
          </Link>
        </Button>
      </div>

      {/* プロジェクト一覧 */}
      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
