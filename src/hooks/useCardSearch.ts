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
  const [loadedProjectId, setLoadedProjectId] = useState<string | null>(null)

  // projectIdが一致していれば読み込み完了（派生状態）
  const isLoaded = loadedProjectId === projectId

  useEffect(() => {
    // projectId変更時にstaleなデータをクリア
    allCardsRef.current = []

    if (!projectId) return

    let cancelled = false

    searchCardsForMention(projectId).then((result) => {
      if (cancelled) return
      if (result.success && result.data) {
        allCardsRef.current = result.data
      }
      setLoadedProjectId(projectId)
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
