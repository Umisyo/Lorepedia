import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, ArrowLeft } from "lucide-react"

import { createClient } from "@/utils/supabase/server"
import { getLoreCards, getProject } from "@/app/actions/loreCard"
import { LoreCardList } from "@/components/features/LoreCardList"
import { Button } from "@/components/ui/button"

type Props = {
  params: Promise<{ projectId: string }>
}

export default async function CardsPage({ params }: Props) {
  const { projectId } = await params
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // プロジェクト情報取得
  const project = await getProject(projectId)
  if (!project) {
    redirect("/dashboard")
  }

  // カード一覧取得
  const result = await getLoreCards(projectId)
  const cards = result.success ? (result.data ?? []) : []

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          ダッシュボードに戻る
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="mt-1 text-muted-foreground">{project.description}</p>
            )}
          </div>
          <Button asChild>
            <Link href={`/projects/${projectId}/cards/new`}>
              <Plus className="mr-2 h-4 w-4" />
              カードを作成
            </Link>
          </Button>
        </div>
      </div>

      {/* カード一覧 */}
      <LoreCardList cards={cards} projectId={projectId} isLoggedIn={!!user} />
    </div>
  )
}
