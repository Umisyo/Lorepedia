"use client"

import { Search, Grid, List, ArrowUpDown } from "lucide-react"
import { useCallback, useState, useEffect } from "react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TagFilter } from "./TagFilter"
import { useCardFilter } from "@/hooks/useCardFilter"
import type { Tag } from "@/types/loreCard"
import type { SortBy, ViewMode } from "@/types/filter"

type Props = {
  tags: Tag[]
}

export function CardFilterBar({ tags }: Props) {
  const { filters, setFilters, isPending } = useCardFilter()

  // 検索入力のローカル状態（即時反映用）
  const [localSearch, setLocalSearch] = useState(filters.search)

  // デバウンス処理（300ms後にURL更新）
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        setFilters({ search: localSearch })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [localSearch, filters.search, setFilters])

  // URL変更時にローカル状態を同期（外部からURLが変更された場合のみ）
  useEffect(() => {
    if (filters.search !== localSearch) {
      setLocalSearch(filters.search)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- localSearchを依存配列に含めると無限ループになる
  }, [filters.search])

  // 検索入力ハンドラ（ローカル状態のみ更新）
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalSearch(e.target.value)
    },
    []
  )

  // タグフィルタ変更
  const handleTagsChange = useCallback(
    (tagIds: string[]) => {
      setFilters({ tags: tagIds })
    },
    [setFilters]
  )

  // ソート変更
  const handleSortChange = useCallback(
    (value: string) => {
      setFilters({ sortBy: value as SortBy })
    },
    [setFilters]
  )

  // ソート順トグル
  const handleToggleSortOrder = useCallback(() => {
    setFilters({
      sortOrder: filters.sortOrder === "desc" ? "asc" : "desc",
    })
  }, [filters.sortOrder, setFilters])

  // 表示モード変更
  const handleViewModeChange = useCallback(
    (value: string) => {
      setFilters({ viewMode: value as ViewMode })
    },
    [setFilters]
  )

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {/* 左側: 検索 + タグフィルタ */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* 検索入力 */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="カードを検索..."
            value={localSearch}
            onChange={handleSearchChange}
            disabled={isPending}
            className="pl-10"
          />
        </div>

        {/* タグフィルタ */}
        <TagFilter
          tags={tags}
          selectedIds={filters.tags}
          onChange={handleTagsChange}
          disabled={isPending}
        />
      </div>

      {/* 右側: ソート + 表示切替 */}
      <div className="flex items-center gap-2">
        {/* ソート */}
        <div className="flex items-center gap-1">
          <Select
            value={filters.sortBy}
            onValueChange={handleSortChange}
            disabled={isPending}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="並び替え" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="updated_at">更新日</SelectItem>
              <SelectItem value="created_at">作成日</SelectItem>
              <SelectItem value="title">タイトル</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleSortOrder}
            disabled={isPending}
            title={filters.sortOrder === "desc" ? "降順" : "昇順"}
          >
            <ArrowUpDown
              className={`h-4 w-4 transition-transform ${
                filters.sortOrder === "asc" ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>

        {/* 表示切替 */}
        <Tabs
          value={filters.viewMode}
          onValueChange={handleViewModeChange}
        >
          <TabsList>
            <TabsTrigger value="grid" disabled={isPending}>
              <Grid className="h-4 w-4" />
              <span className="sr-only">グリッド表示</span>
            </TabsTrigger>
            <TabsTrigger value="list" disabled={isPending}>
              <List className="h-4 w-4" />
              <span className="sr-only">リスト表示</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  )
}
