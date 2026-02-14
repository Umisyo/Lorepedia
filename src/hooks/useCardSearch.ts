"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  searchCardsForMention,
  type CardMentionSuggestion,
} from "@/app/actions/loreCard"

type UseCardSearchOptions = {
  projectId: string
}

type UseCardSearchReturn = {
  filterCards: (query: string) => CardMentionSuggestion[]
  isLoaded: boolean
}

/**
 * カード検索用カスタムフック（プリフェッチ+ローカルフィルタ方式）
 *
 * マウント時に全カードをフェッチしてキャッシュし、
 * filterCardsで同期的にローカルフィルタリングする。
 */
export function useCardSearch({
  projectId,
}: UseCardSearchOptions): UseCardSearchReturn {
  const allCardsRef = useRef<CardMentionSuggestion[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!projectId) return

    let cancelled = false

    searchCardsForMention(projectId).then((result) => {
      if (cancelled) return
      if (result.success && result.data) {
        allCardsRef.current = result.data
      }
      setIsLoaded(true)
    })

    return () => {
      cancelled = true
    }
  }, [projectId])

  const filterCards = useCallback(
    (query: string): CardMentionSuggestion[] => {
      if (!query.trim()) return allCardsRef.current
      const lower = query.toLowerCase()
      return allCardsRef.current.filter((c) =>
        c.title.toLowerCase().includes(lower)
      )
    },
    []
  )

  return { filterCards, isLoaded }
}
