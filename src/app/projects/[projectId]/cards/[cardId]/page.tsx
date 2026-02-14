import { Suspense } from "react"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Pencil, Link2 } from "lucide-react"

import { createClient } from "@/utils/supabase/server"
import { getLoreCard, getProject } from "@/app/actions/loreCard"
import { LoreCardDetail } from "@/components/features/LoreCardDetail"
import { CardReferenceSectionLoader } from "@/components/features/CardReferenceSectionLoader"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

type Props = {
  params: Promise<{ projectId: string; cardId: string }>
}

// 参照セクションのスケルトン
function ReferenceSectionSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link2 className="h-5 w-5 text-muted-foreground" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

export default async function CardDetailPage({ params }: Props) {
  const { projectId, cardId } = await params
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // データフェッチを並列化
  const [project, editorResult, result] = await Promise.all([
    getProject(projectId),
    supabase.rpc("is_project_editor", { p_project_id: projectId }),
    getLoreCard(projectId, cardId),
  ])

  if (!project) {
    redirect("/dashboard")
  }
  if (!result.success || !result.data) {
    notFound()
  }

  const card = result.data
  const isEditor = editorResult.data ?? false

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {project.name} に戻る
        </Link>
        {isEditor && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/projects/${projectId}/cards/${cardId}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              編集
            </Link>
          </Button>
        )}
      </div>

      {/* カード詳細 */}
      <LoreCardDetail card={card} projectId={projectId} />

      {/* 参照セクション（ストリーミング） */}
      <div className="mt-6">
        <hr className="border-border mb-6" />
        <Suspense fallback={<ReferenceSectionSkeleton />}>
          <CardReferenceSectionLoader
            projectId={projectId}
            cardId={cardId}
            isEditor={isEditor}
          />
        </Suspense>
      </div>
    </div>
  )
}
