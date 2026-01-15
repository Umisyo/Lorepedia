"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useCardFilter } from "@/hooks/useCardFilter"

type Props = {
  currentPage: number
  totalPages: number
  total: number
  pageSize: number
}

export function Pagination({ currentPage, totalPages, total, pageSize }: Props) {
  const { setFilters, isPending } = useCardFilter()

  // ページ番号の配列を生成
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []
    const showPages = 5 // 表示するページ番号の数

    if (totalPages <= showPages + 2) {
      // ページ数が少ない場合は全て表示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // 最初のページは常に表示
      pages.push(1)

      // 現在のページ周辺を計算
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // 開始位置を調整
      if (currentPage <= 3) {
        startPage = 2
        endPage = 4
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3
        endPage = totalPages - 1
      }

      // 最初のページの後に省略記号
      if (startPage > 2) {
        pages.push("ellipsis")
      }

      // 中間のページ番号
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i)
      }

      // 最後のページの前に省略記号
      if (endPage < totalPages - 1) {
        pages.push("ellipsis")
      }

      // 最後のページは常に表示
      pages.push(totalPages)
    }

    return pages
  }

  const handlePageChange = (page: number) => {
    setFilters({ page })
  }

  const pageNumbers = getPageNumbers()

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      {/* 件数表示 */}
      <p className="text-sm text-muted-foreground">
        全 {total} 件中 {(currentPage - 1) * pageSize + 1} -{" "}
        {Math.min(currentPage * pageSize, total)} 件を表示
      </p>

      {/* ページネーション */}
      <div className="flex items-center gap-1">
        {/* 前へボタン */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isPending}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">前のページ</span>
        </Button>

        {/* ページ番号 */}
        {pageNumbers.map((page, index) =>
          page === "ellipsis" ? (
            <Button
              key={`ellipsis-${index}`}
              variant="ghost"
              size="icon"
              disabled
              className="cursor-default"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="icon"
              onClick={() => handlePageChange(page)}
              disabled={isPending}
            >
              {page}
            </Button>
          )
        )}

        {/* 次へボタン */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || isPending}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">次のページ</span>
        </Button>
      </div>
    </div>
  )
}
