import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"

import { Badge } from "@/components/ui/badge"
import type { LoreCardWithTags } from "@/types/loreCard"

type Props = {
  card: LoreCardWithTags
  projectId: string
}

export function LoreCardListItem({ card, projectId }: Props) {
  const updatedAt = formatDistanceToNow(new Date(card.updated_at), {
    addSuffix: true,
    locale: ja,
  })

  return (
    <Link
      href={`/projects/${projectId}/cards/${card.id}`}
      className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent/50"
    >
      {/* タイトルとタグ */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{card.title}</h3>
        {card.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {card.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                style={tag.color ? { backgroundColor: tag.color } : undefined}
                className="text-xs"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* 更新日 */}
      <div className="flex-shrink-0 text-sm text-muted-foreground">
        {updatedAt}
      </div>
    </Link>
  )
}
