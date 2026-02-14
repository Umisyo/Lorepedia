"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2, Search, FileText } from "lucide-react"

import { Input } from "@/components/ui/input"
import { useCardSearch } from "@/hooks/useCardSearch"
import type { CardMentionSuggestion } from "@/app/actions/loreCard"

type CardSearchInputProps = {
  projectId: string
  onSelect: (card: CardMentionSuggestion) => void
  excludeCardIds?: string[]
  disabled?: boolean
}

export function CardSearchInput({
  projectId,
  onSelect,
  excludeCardIds = [],
  disabled = false,
}: CardSearchInputProps) {
  const [query, setQuery] = useState("")
  const [showResults, setShowResults] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { suggestions, isLoading, search, clear } = useCardSearch({
    projectId,
  })

  // 除外対象をフィルタリング
  const filteredSuggestions = suggestions.filter(
    (s) => !excludeCardIds.includes(s.id)
  )

  // 外部クリックで閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target
      if (
        containerRef.current &&
        target instanceof Node &&
        !containerRef.current.contains(target)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleChange(value: string) {
    setQuery(value)
    if (value.trim()) {
      search(value)
      setShowResults(true)
    } else {
      clear()
      setShowResults(false)
    }
  }

  function handleSelect(card: CardMentionSuggestion) {
    setQuery("")
    clear()
    setShowResults(false)
    onSelect(card)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => filteredSuggestions.length > 0 && setShowResults(true)}
          placeholder="カード名で検索..."
          disabled={disabled}
          className="pl-9"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {showResults && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
          <ul className="max-h-60 overflow-auto py-1">
            {filteredSuggestions.map((card) => (
              <li key={card.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-2 hover:bg-accent"
                  onClick={() => handleSelect(card)}
                >
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm">{card.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showResults && query.trim() && filteredSuggestions.length === 0 && !isLoading && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover p-4 text-center text-sm text-muted-foreground shadow-md">
          該当するカードが見つかりません
        </div>
      )}
    </div>
  )
}
