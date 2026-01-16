import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { createClient } from "@/utils/supabase/server"
import { getLoreCard, getProject } from "@/app/actions/loreCard"
import { LoreCardForm } from "@/components/features/LoreCardForm"

type Props = {
  params: Promise<{ projectId: string; cardId: string }>
}

export default async function EditCardPage({ params }: Props) {
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

  // 権限チェック（editor以上）
  const { data: isEditor } = await supabase.rpc("is_project_editor", {
    p_project_id: projectId,
  })
  if (!isEditor) {
    redirect(`/projects/${projectId}/cards/${cardId}`)
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
          href={`/projects/${projectId}/cards/${cardId}`}
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          カード詳細に戻る
        </Link>
        <h1 className="text-2xl font-bold">カードを編集</h1>
      </div>

      {/* 編集フォーム */}
      <LoreCardForm
        projectId={projectId}
        mode="edit"
        cardId={cardId}
        defaultValues={{
          title: card.title,
          content: card.content ?? "",
        }}
      />
    </div>
  )
}
