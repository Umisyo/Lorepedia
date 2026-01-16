import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { createClient } from "@/utils/supabase/server"
import { getProject } from "@/app/actions/loreCard"
import { getProjectTags } from "@/app/actions/tag"
import { LoreCardForm } from "@/components/features/LoreCardForm"

type Props = {
  params: Promise<{ projectId: string }>
}

export default async function NewCardPage({ params }: Props) {
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

  // タグ一覧取得
  const tagsResult = await getProjectTags(projectId)
  const availableTags = tagsResult.success ? tagsResult.data ?? [] : []

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <Link
          href={`/projects/${projectId}/cards`}
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          カード一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold">新しいカードを作成</h1>
        <p className="mt-1 text-muted-foreground">
          {project.name} に新しい設定カードを追加します
        </p>
      </div>

      {/* フォーム */}
      <LoreCardForm projectId={projectId} availableTags={availableTags} />
    </div>
  )
}
