import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { createClient } from "@/utils/supabase/server"
import { getLoreCard, getProject } from "@/app/actions/loreCard"
import { LoreCardDetail } from "@/components/features/LoreCardDetail"

type Props = {
  params: Promise<{ projectId: string; cardId: string }>
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

  // プロジェクト情報取得
  const project = await getProject(projectId)
  if (!project) {
    redirect("/dashboard")
  }

  // カード詳細取得（プロジェクトIDでスコープ）
  const result = await getLoreCard(projectId, cardId)
  if (!result.success || !result.data) {
    notFound()
  }

  const card = result.data

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <Link
          href={`/projects/${projectId}`}
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {project.name} に戻る
        </Link>
      </div>

      {/* カード詳細 */}
      <LoreCardDetail card={card} />
    </div>
  )
}
