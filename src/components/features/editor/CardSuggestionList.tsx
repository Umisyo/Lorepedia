"use client"

import { forwardRef, useImperativeHandle, useState, useCallback } from "react"
import type { CardMentionSuggestion } from "@/app/actions/loreCard"
import { cn } from "@/lib/utils"
import { FileText, Loader2 } from "lucide-react"

export type CardSuggestionListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

type Props = {
  items: CardMentionSuggestion[]
  isLoading: boolean
  command: (item: CardMentionSuggestion) => void
}

export const CardSuggestionList = forwardRef<CardSuggestionListRef, Props>(
  ({ items, isLoading, command }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0)

    // selectedIndexが範囲内に収まるように調整（items配列が変わった場合の対応）
    const safeSelectedIndex =
      items.length > 0 ? Math.min(selectedIndex, items.length - 1) : 0

    const selectItem = useCallback(
      (index: number) => {
        const item = items[index]
        if (item) {
          command(item)
        }
      },
      [items, command]
    )

    const upHandler = useCallback(() => {
      setSelectedIndex((prev) =>
        items.length > 0 ? (prev + items.length - 1) % items.length : 0
      )
    }, [items.length])

    const downHandler = useCallback(() => {
      setSelectedIndex((prev) =>
        items.length > 0 ? (prev + 1) % items.length : 0
      )
    }, [items.length])

    const enterHandler = useCallback(() => {
      selectItem(safeSelectedIndex)
    }, [selectItem, safeSelectedIndex])

    // キーボードナビゲーション
    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          upHandler()
          return true
        }

        if (event.key === "ArrowDown") {
          downHandler()
          return true
        }

        if (event.key === "Enter") {
          enterHandler()
          return true
        }

        return false
      },
    }))

    // ローディング中
    if (isLoading) {
      return (
        <div className="rounded-md border bg-popover p-2 shadow-md">
          <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>検索中...</span>
          </div>
        </div>
      )
    }

    // 候補がない場合
    if (items.length === 0) {
      return (
        <div className="rounded-md border bg-popover p-2 shadow-md">
          <div className="px-2 py-1.5 text-sm text-muted-foreground">
            該当するカードがありません
          </div>
        </div>
      )
    }

    return (
      <div className="rounded-md border bg-popover shadow-md">
        <div className="max-h-[200px] overflow-y-auto p-1">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm",
                "hover:bg-accent hover:text-accent-foreground",
                index === safeSelectedIndex && "bg-accent text-accent-foreground"
              )}
              onClick={() => selectItem(index)}
            >
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{item.title}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }
)

CardSuggestionList.displayName = "CardSuggestionList"
