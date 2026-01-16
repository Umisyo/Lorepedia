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
  const abortControllerRef = useRef<AbortController | null>(null)

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
        // 前回のリクエストをキャンセル
        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }
        abortControllerRef.current = new AbortController()

        setIsLoading(true)
        setError(null)

        const result = await searchCardsForMention(projectId, query.trim())

        // コンポーネントがアンマウントされていたら結果を無視
        if (abortControllerRef.current?.signal.aborted) {
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
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return { suggestions, isLoading, error, search, clear }
}
