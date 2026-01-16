"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  searchCardsForMention,
  type CardMentionSuggestion,
} from "@/app/actions/loreCard"

type UseCardSearchOptions = {
  projectId: string
  debounceMs?: number
}

type UseCardSearchReturn = {
  suggestions: CardMentionSuggestion[]
  isLoading: boolean
  error: string | null
  search: (query: string) => void
  clear: () => void
}

/**
 * カード検索用カスタムフック（デバウンス付き）
 */
export function useCardSearch({
  projectId,
  debounceMs = 300,
}: UseCardSearchOptions): UseCardSearchReturn {
  const [suggestions, setSuggestions] = useState<CardMentionSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // リクエストIDで古いリクエストの結果を無視する
  const requestIdRef = useRef(0)
  const isMountedRef = useRef(true)

  const search = useCallback(
    (query: string) => {
      // 前回のタイマーをクリア
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // 空のクエリの場合は結果をクリア
      if (!query.trim()) {
        setSuggestions([])
        setIsLoading(false)
        setError(null)
        return
      }

      // デバウンス
      timeoutRef.current = setTimeout(async () => {
        // リクエストIDをインクリメント（古いリクエストの結果を無視するため）
        const currentRequestId = ++requestIdRef.current

        setIsLoading(true)
        setError(null)

        const result = await searchCardsForMention(projectId, query.trim())

        // アンマウント済み、または古いリクエストの場合は結果を無視
        if (!isMountedRef.current || currentRequestId !== requestIdRef.current) {
          return
        }

        if (result.success && result.data) {
          setSuggestions(result.data)
        } else {
          setError(result.error ?? "検索に失敗しました")
          setSuggestions([])
        }
        setIsLoading(false)
      }, debounceMs)
    },
    [projectId, debounceMs]
  )

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setSuggestions([])
    setIsLoading(false)
    setError(null)
  }, [])

  // クリーンアップ
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return { suggestions, isLoading, error, search, clear }
}
