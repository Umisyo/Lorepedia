import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { createClient } from "@/utils/supabase/server"
import { getLoreCard, getProject } from "@/app/actions/loreCard"
import { getCardReferencesForCard } from "@/app/actions/cardReference"
import { getProjectTags } from "@/app/actions/tag"
import { LoreCardForm } from "@/components/features/LoreCardForm"
import { CardReferenceSection } from "@/components/features/CardReferenceSection"

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

  // カード詳細と参照データを並行取得
  const [result, referencesResult] = await Promise.all([
    getLoreCard(projectId, cardId),
    getCardReferencesForCard(cardId),
  ])
  if (!result.success || !result.data) {
    notFound()
  }

  const card = result.data
  const references = referencesResult.success ? (referencesResult.data ?? []) : []

  // タグ一覧取得
  const tagsResult = await getProjectTags(projectId)
  const availableTags = tagsResult.success ? tagsResult.data ?? [] : []

  // カードの現在のタグIDを取得
  const currentTagIds = card.tags?.map((tag) => tag.id) ?? []

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
          tagIds: currentTagIds,
        }}
        availableTags={availableTags}
      />

      {/* 参照関係 */}
      <hr className="my-8 border-border" />
      <CardReferenceSection
        projectId={projectId}
        cardId={cardId}
        initialReferences={references}
        isEditor={true}
      />
    </div>
  )
}
