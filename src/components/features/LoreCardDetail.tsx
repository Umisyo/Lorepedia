import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MarkdownRenderer } from "@/components/features/MarkdownRenderer"
import type { LoreCardWithRelations } from "@/types/loreCard"

type Props = {
  card: LoreCardWithRelations
  projectId: string
}

export function LoreCardDetail({ card, projectId }: Props) {
  const createdAt = formatDistanceToNow(new Date(card.created_at), {
    addSuffix: true,
    locale: ja,
  })
  const updatedAt = formatDistanceToNow(new Date(card.updated_at), {
    addSuffix: true,
    locale: ja,
  })

  // 作成者の表示名
  const authorName = card.author?.display_name || "不明なユーザー"
  const authorInitial = authorName.charAt(0).toUpperCase()

  return (
    <div className="space-y-6">
      {/* タイトル */}
      <h1 className="text-3xl font-bold">{card.title}</h1>

      {/* メタ情報 */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {/* 作成者 */}
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={card.author?.avatar_url || undefined} />
            <AvatarFallback className="text-xs">{authorInitial}</AvatarFallback>
          </Avatar>
          <span>{authorName}</span>
        </div>

        {/* 日時 */}
        <span>作成: {createdAt}</span>
        <span>更新: {updatedAt}</span>
      </div>

      {/* タグ */}
      {card.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {card.tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              style={tag.color ? { backgroundColor: tag.color } : undefined}
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* 区切り線 */}
      <hr className="border-border" />

      {/* 詳細内容（Markdown対応） */}
      {card.content && (
        <MarkdownRenderer content={card.content} projectId={projectId} />
      )}
    </div>
  )
}
