import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, GitBranch } from "lucide-react"

import { createClient } from "@/utils/supabase/server"
import { getProject } from "@/app/actions/loreCard"
import { getCardReferences } from "@/app/actions/cardReference"
import { CardReferenceGraphLoader } from "@/components/features/graph/CardReferenceGraphLoader"

type Props = {
  params: Promise<{ projectId: string }>
}

export default async function GraphPage({ params }: Props) {
  const { projectId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  const project = await getProject(projectId)
  if (!project) {
    redirect("/dashboard")
  }

  const result = await getCardReferences(projectId)

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-6">
        <Link
          href={`/projects/${projectId}`}
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          カード一覧に戻る
        </Link>
        <div className="flex items-center gap-3">
          <GitBranch className="h-6 w-6 text-muted-foreground" />
          <h1 className="text-2xl font-bold">
            {project.name} - 関係性グラフ
          </h1>
        </div>
      </div>

      {/* グラフ */}
      {result.success && result.data ? (
        result.data.cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
            <GitBranch className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-lg font-semibold">
              カードがありません
            </h2>
            <p className="text-sm text-muted-foreground">
              カードを作成すると、関係性グラフが表示されます
            </p>
          </div>
        ) : (
          <CardReferenceGraphLoader
            data={result.data}
            projectId={projectId}
          />
        )
      ) : (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">
            {result.error ?? "グラフデータの取得に失敗しました"}
          </p>
        </div>
      )}
    </div>
  )
}
