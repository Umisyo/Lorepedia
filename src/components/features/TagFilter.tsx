"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, X, Plus, Loader2, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { createTag } from "@/app/actions/tag"
import type { Tag } from "@/types/loreCard"

type Props = {
  tags: Tag[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
  // タグ作成機能用
  projectId?: string
  onTagCreated?: (tag: Tag) => void
  allowCreate?: boolean
}

export function TagFilter({
  tags,
  selectedIds,
  onChange,
  disabled,
  projectId,
  onTagCreated,
  allowCreate = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedTags = tags.filter((tag) => selectedIds.includes(tag.id))

  // フィルタリングされたタグ
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // 新規作成可能かどうか
  const canCreate =
    allowCreate &&
    projectId &&
    searchQuery.trim().length > 0 &&
    !tags.some(
      (tag) => tag.name.toLowerCase() === searchQuery.trim().toLowerCase()
    )

  const handleToggle = (tagId: string) => {
    if (selectedIds.includes(tagId)) {
      onChange(selectedIds.filter((id) => id !== tagId))
    } else {
      onChange([...selectedIds, tagId])
    }
  }

  const handleClear = () => {
    onChange([])
  }

  const handleCreate = async () => {
    if (!projectId || !searchQuery.trim()) return
    setIsCreating(true)
    setError(null)

    const result = await createTag(projectId, { name: searchQuery.trim() })

    if (result.success && result.data) {
      onTagCreated?.(result.data)
      // 作成したタグを自動選択
      onChange([...selectedIds, result.data.id])
      setSearchQuery("")
    } else {
      setError(result.error ?? "タグの作成に失敗しました")
    }

    setIsCreating(false)
  }

  // Popoverを閉じる時に検索クエリをリセット
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setSearchQuery("")
      setError(null)
    }
  }

  // タグが0個でも、allowCreateがtrueならボタンを有効にする
  const isButtonDisabled = disabled || (tags.length === 0 && !allowCreate)

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={isButtonDisabled}
            className="min-w-[140px] justify-between"
          >
            <span className="truncate">
              {selectedIds.length > 0
                ? `タグ (${selectedIds.length})`
                : "タグで絞り込み"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-2" align="start">
          {/* 検索/入力フィールド */}
          {(tags.length > 0 || allowCreate) && (
            <div className="mb-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={
                    allowCreate ? "検索または新規作成..." : "タグを検索..."
                  }
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setError(null)
                  }}
                  className="pl-8"
                />
              </div>
              {error && (
                <p className="mt-1 text-xs text-destructive">{error}</p>
              )}
            </div>
          )}

          {/* タグ一覧 */}
          {filteredTags.length === 0 && !canCreate ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {searchQuery ? "該当するタグがありません" : "タグがありません"}
            </p>
          ) : (
            <div className="max-h-[250px] overflow-y-auto">
              {filteredTags.map((tag) => {
                const isSelected = selectedIds.includes(tag.id)
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleToggle(tag.id)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent",
                      isSelected && "bg-accent"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded border",
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: tag.color ?? "#6B7280" }}
                    />
                    <span className="truncate">{tag.name}</span>
                  </button>
                )
              })}
            </div>
          )}

          {/* 新規作成ボタン */}
          {canCreate && (
            <>
              {filteredTags.length > 0 && (
                <div className="my-2 border-t border-border" />
              )}
              <button
                type="button"
                onClick={handleCreate}
                disabled={isCreating}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-primary hover:bg-accent disabled:opacity-50"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                <span>
                  「<span className="font-medium">{searchQuery.trim()}</span>
                  」を作成
                </span>
              </button>
            </>
          )}
        </PopoverContent>
      </Popover>

      {/* 選択されたタグをバッジで表示 */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {selectedTags.slice(0, 3).map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="gap-1 pr-1"
              style={{
                backgroundColor: tag.color ? `${tag.color}20` : undefined,
                borderColor: tag.color ?? undefined,
              }}
            >
              <span className="max-w-[80px] truncate">{tag.name}</span>
              <button
                type="button"
                onClick={() => handleToggle(tag.id)}
                className="rounded-full p-0.5 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedTags.length > 3 && (
            <Badge variant="secondary">+{selectedTags.length - 3}</Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 px-2 text-xs"
          >
            クリア
          </Button>
        </div>
      )}
    </div>
  )
}
