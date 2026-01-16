import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, ArrowLeft, Settings } from "lucide-react"

import { createClient } from "@/utils/supabase/server"
import { getLoreCardsPaginated, getProject } from "@/app/actions/loreCard"
import { getProjectTags } from "@/app/actions/tag"
import { LoreCardList } from "@/components/features/LoreCardList"
import { CardFilterBar } from "@/components/features/CardFilterBar"
import { Pagination } from "@/components/features/Pagination"
import { Button } from "@/components/ui/button"
import { parseFilterParams } from "@/schemas/cardFilter"
import type { ViewMode } from "@/types/filter"

type Props = {
  params: Promise<{ projectId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: Props) {
  const { projectId } = await params
  const rawSearchParams = await searchParams
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

  // URLパラメータをパース
  const urlSearchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(rawSearchParams)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        urlSearchParams.append(key, v)
      }
    } else if (value !== undefined) {
      urlSearchParams.set(key, value)
    }
  }
  const filters = parseFilterParams(urlSearchParams)

  // 表示件数（グリッド12件、リスト20件）
  const limit = filters.viewMode === "grid" ? 12 : 20

  // タグ一覧取得（並列実行）
  const [tagsResult, cardsResult] = await Promise.all([
    getProjectTags(projectId),
    getLoreCardsPaginated({
      projectId,
      page: filters.page,
      limit,
      search: filters.search || undefined,
      tagIds: filters.tags.length > 0 ? filters.tags : undefined,
      authorIds: filters.authors.length > 0 ? filters.authors : undefined,
      dateFrom: filters.dateFrom || undefined,
      dateTo: filters.dateTo || undefined,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }),
  ])

  const tags = tagsResult.success ? tagsResult.data ?? [] : []
  const cardsData = cardsResult.success
    ? cardsResult.data
    : { cards: [], total: 0, page: 1, totalPages: 0 }

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
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={`/projects/${projectId}/settings`}>
                <Settings className="mr-2 h-4 w-4" />
                設定
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/projects/${projectId}/cards/new`}>
                <Plus className="mr-2 h-4 w-4" />
                新規カード
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* フィルタバー */}
      <div className="mb-6">
        <CardFilterBar tags={tags} />
      </div>

      {/* カード一覧 */}
      <LoreCardList
        cards={cardsData?.cards ?? []}
        projectId={projectId}
        viewMode={filters.viewMode as ViewMode}
        isLoggedIn={!!user}
      />

      {/* ページネーション */}
      {cardsData && cardsData.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={cardsData.page}
            totalPages={cardsData.totalPages}
            total={cardsData.total}
            pageSize={limit}
          />
        </div>
      )}
    </div>
  )
}
