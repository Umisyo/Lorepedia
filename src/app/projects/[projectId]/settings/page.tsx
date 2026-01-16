import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Settings, Users } from "lucide-react"

import { createClient } from "@/utils/supabase/server"
import { getProjectWithTags } from "@/app/actions/project"
import { getProjectMembers } from "@/app/actions/member"
import { ProjectSettingsForm } from "@/components/features/ProjectSettingsForm"
import { DeleteProjectDialog } from "@/components/features/DeleteProjectDialog"
import { MemberList } from "@/components/features/MemberList"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { MemberRole } from "@/types/project"

type Props = {
  params: Promise<{ projectId: string }>
}

export default async function ProjectSettingsPage({ params }: Props) {
  const { projectId } = await params
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // プロジェクト情報とメンバー一覧を並列取得
  const [projectResult, membersResult, roleResult] = await Promise.all([
    getProjectWithTags(projectId),
    getProjectMembers(projectId),
    supabase.rpc("get_user_role", {
      p_project_id: projectId,
      p_user_id: user.id,
    }),
  ])

  if (!projectResult.success || !projectResult.project) {
    redirect("/dashboard")
  }

  const project = projectResult.project
  const members = membersResult.success ? membersResult.members ?? [] : []
  const role = roleResult.data

  // editor以上でなければリダイレクト
  if (role !== "owner" && role !== "editor") {
    redirect(`/projects/${projectId}`)
  }

  const isOwner = role === "owner"

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <Link
          href={`/projects/${projectId}`}
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          プロジェクトに戻る
        </Link>
        <h1 className="text-2xl font-bold">プロジェクト設定</h1>
        <p className="mt-1 text-muted-foreground">{project.name}</p>
      </div>

      {/* タブ */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" />
            基本情報
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="mr-2 h-4 w-4" />
            メンバー管理
          </TabsTrigger>
        </TabsList>

        {/* 基本情報タブ */}
        <TabsContent value="general" className="space-y-8">
          <div className="rounded-lg border p-6">
            <h2 className="mb-6 text-lg font-semibold">プロジェクト情報</h2>
            <ProjectSettingsForm project={project} />
          </div>

          {/* プロジェクト削除セクション（ownerのみ） */}
          {isOwner && (
            <div className="rounded-lg border border-destructive/50 p-6">
              <h2 className="mb-2 text-lg font-semibold text-destructive">
                危険な操作
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                プロジェクトを削除すると、すべてのLoreCard、タグ、メンバー情報が完全に削除されます。
                この操作は取り消せません。
              </p>
              <DeleteProjectDialog
                projectId={projectId}
                projectName={project.name}
              />
            </div>
          )}
        </TabsContent>

        {/* メンバー管理タブ */}
        <TabsContent value="members">
          <div className="rounded-lg border p-6">
            <h2 className="mb-6 text-lg font-semibold">メンバー一覧</h2>
            <MemberList
              projectId={projectId}
              currentUserId={user.id}
              isPublicEditable={project.is_public_editable}
              myRole={role as MemberRole}
              initialMembers={members}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
