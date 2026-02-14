import { Suspense } from "react"
import { Search } from "lucide-react"

import { getExploreProjects } from "@/app/actions/explore"
import { createClient } from "@/utils/supabase/server"
import { ExploreProjectCard } from "@/components/features/ExploreProjectCard"
import { ExploreSearchBar } from "@/components/features/ExploreSearchBar"
import { ExplorePagination } from "@/components/features/ExplorePagination"

const ITEMS_PER_PAGE = 12

type Props = {
  searchParams: Promise<{ page?: string; search?: string }>
}

export default async function ExplorePage({ searchParams }: Props) {
  const params = await searchParams
  const page = Number(params.page ?? "1")
  const search = params.search

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const result = await getExploreProjects({
    page,
    limit: ITEMS_PER_PAGE,
    search,
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      {/* ページヘッダー */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">プロジェクトを探す</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          誰でも編集可能な公開プロジェクトを探して、ダッシュボードに追加できます
        </p>
      </div>

      {/* 検索バー */}
      <div className="mb-6">
        <Suspense fallback={null}>
          <ExploreSearchBar />
        </Suspense>
      </div>

      {/* コンテンツ */}
      {!result.success ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">{result.error}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            しばらく時間をおいてから再度お試しください
          </p>
        </div>
      ) : result.projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Search className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 text-lg font-semibold">
            {search
              ? "検索条件に一致するプロジェクトが見つかりません"
              : "公開プロジェクトはまだありません"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {search
              ? "別のキーワードで検索してみてください"
              : "公開プロジェクトが作成されると、ここに表示されます"}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {result.projects.map((project) => (
              <ExploreProjectCard
                key={project.id}
                project={project}
                isLoggedIn={user !== null}
              />
            ))}
          </div>

          {/* ページネーション */}
          <div className="mt-8">
            <Suspense fallback={null}>
              <ExplorePagination
                totalCount={result.totalCount}
                limit={ITEMS_PER_PAGE}
              />
            </Suspense>
          </div>
        </>
      )}
    </div>
  )
}
