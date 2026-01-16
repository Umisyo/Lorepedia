"use client"

import { Heart } from "lucide-react"
import { useOptimistic, useTransition } from "react"

import { Button } from "@/components/ui/button"
import { toggleCardLike } from "@/app/actions/cardLike"

type Props = {
  cardId: string
  projectId: string
  likeCount: number
  isLiked: boolean
  isLoggedIn: boolean
}

export function LikeButton({
  cardId,
  projectId,
  likeCount,
  isLiked,
  isLoggedIn,
}: Props) {
  const [isPending, startTransition] = useTransition()

  // オプティミスティック更新
  const [optimisticState, addOptimistic] = useOptimistic(
    { likeCount, isLiked },
    (state, newIsLiked: boolean) => ({
      isLiked: newIsLiked,
      likeCount: newIsLiked ? state.likeCount + 1 : state.likeCount - 1,
    })
  )

  const handleClick = (e: React.MouseEvent) => {
    // カードへのリンクを発火させない
    e.preventDefault()
    e.stopPropagation()

    if (!isLoggedIn) return

    startTransition(async () => {
      // オプティミスティック更新を適用
      addOptimistic(!optimisticState.isLiked)

      // サーバーアクションを実行
      const result = await toggleCardLike(cardId, projectId)
      if (!result.success) {
        console.error("Failed to toggle like:", result.error)
        // エラー時はrevalidatePathにより自動的に正しい状態に戻る
      }
    })
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={!isLoggedIn || isPending}
      className="h-auto gap-1 px-2 py-1"
      title={isLoggedIn ? (optimisticState.isLiked ? "いいねを解除" : "いいね") : "ログインが必要です"}
      aria-label={`いいね ${optimisticState.likeCount}件${optimisticState.isLiked ? "（いいね済み）" : ""}`}
      aria-pressed={optimisticState.isLiked}
    >
      <Heart
        className={`h-4 w-4 transition-colors ${
          optimisticState.isLiked
            ? "fill-red-500 text-red-500"
            : "text-muted-foreground"
        }`}
      />
      <span className="text-xs text-muted-foreground">
        {optimisticState.likeCount}
      </span>
    </Button>
  )
}
