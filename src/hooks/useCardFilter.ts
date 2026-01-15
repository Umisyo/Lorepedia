"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useCallback, useMemo, useTransition } from "react"
import type { CardFilterState } from "@/types/filter"
import {
  sortBySchema,
  sortOrderSchema,
  viewModeSchema,
  DEFAULT_CARD_FILTERS,
} from "@/schemas/cardFilter"

export function useCardFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  // URLパラメータからフィルタ状態を復元
  const filters = useMemo<CardFilterState>(() => {
    const sortByParam = searchParams.get("sort")
    const sortOrderParam = searchParams.get("order")
    const viewModeParam = searchParams.get("view")
    const pageParam = searchParams.get("page")

    // Zodスキーマで安全にパース（無効値はデフォルト値を使用）
    const sortByResult = sortBySchema.safeParse(sortByParam)
    const sortOrderResult = sortOrderSchema.safeParse(sortOrderParam)
    const viewModeResult = viewModeSchema.safeParse(viewModeParam)

    return {
      search: searchParams.get("q") ?? DEFAULT_CARD_FILTERS.search,
      tags: searchParams.getAll("tag"),
      authors: searchParams.getAll("author"),
      dateFrom: searchParams.get("from") ?? DEFAULT_CARD_FILTERS.dateFrom,
      dateTo: searchParams.get("to") ?? DEFAULT_CARD_FILTERS.dateTo,
      sortBy: sortByResult.success ? sortByResult.data : DEFAULT_CARD_FILTERS.sortBy,
      sortOrder: sortOrderResult.success
        ? sortOrderResult.data
        : DEFAULT_CARD_FILTERS.sortOrder,
      viewMode: viewModeResult.success
        ? viewModeResult.data
        : DEFAULT_CARD_FILTERS.viewMode,
      page: pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : DEFAULT_CARD_FILTERS.page,
    }
  }, [searchParams])

  // フィルタ更新関数
  const setFilters = useCallback(
    (updates: Partial<CardFilterState>) => {
      const params = new URLSearchParams(searchParams.toString())

      // 検索キーワード
      if (updates.search !== undefined) {
        if (updates.search) {
          params.set("q", updates.search)
        } else {
          params.delete("q")
        }
      }

      // タグ
      if (updates.tags !== undefined) {
        params.delete("tag")
        for (const tag of updates.tags) {
          params.append("tag", tag)
        }
      }

      // 作成者
      if (updates.authors !== undefined) {
        params.delete("author")
        for (const author of updates.authors) {
          params.append("author", author)
        }
      }

      // 期間（開始）
      if (updates.dateFrom !== undefined) {
        if (updates.dateFrom) {
          params.set("from", updates.dateFrom)
        } else {
          params.delete("from")
        }
      }

      // 期間（終了）
      if (updates.dateTo !== undefined) {
        if (updates.dateTo) {
          params.set("to", updates.dateTo)
        } else {
          params.delete("to")
        }
      }

      // ソート項目
      if (updates.sortBy !== undefined) {
        if (updates.sortBy !== DEFAULT_CARD_FILTERS.sortBy) {
          params.set("sort", updates.sortBy)
        } else {
          params.delete("sort")
        }
      }

      // ソート順
      if (updates.sortOrder !== undefined) {
        if (updates.sortOrder !== DEFAULT_CARD_FILTERS.sortOrder) {
          params.set("order", updates.sortOrder)
        } else {
          params.delete("order")
        }
      }

      // 表示モード
      if (updates.viewMode !== undefined) {
        if (updates.viewMode !== DEFAULT_CARD_FILTERS.viewMode) {
          params.set("view", updates.viewMode)
        } else {
          params.delete("view")
        }
      }

      // ページ番号
      if (updates.page !== undefined) {
        if (updates.page > 1) {
          params.set("page", updates.page.toString())
        } else {
          params.delete("page")
        }
      }

      // フィルタ変更時はページをリセット（ページ変更以外）
      const isPageChange = updates.page !== undefined && Object.keys(updates).length === 1
      if (!isPageChange) {
        params.delete("page")
      }

      const queryString = params.toString()
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname

      startTransition(() => {
        router.push(newUrl)
      })
    },
    [searchParams, pathname, router]
  )

  // フィルタをリセット
  const resetFilters = useCallback(() => {
    startTransition(() => {
      router.push(pathname)
    })
  }, [pathname, router])

  return {
    filters,
    setFilters,
    resetFilters,
    isPending,
  }
}
