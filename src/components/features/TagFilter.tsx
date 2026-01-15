"use client"

import { useState } from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import type { Tag } from "@/types/loreCard"

type Props = {
  tags: Tag[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
  disabled?: boolean
}

export function TagFilter({ tags, selectedIds, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false)

  const selectedTags = tags.filter((tag) => selectedIds.includes(tag.id))

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

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || tags.length === 0}
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
        <PopoverContent className="w-[240px] p-2" align="start">
          {tags.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              タグがありません
            </p>
          ) : (
            <div className="max-h-[300px] overflow-y-auto">
              {tags.map((tag) => {
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
