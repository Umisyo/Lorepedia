import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LoreCardWithTags } from "@/types/loreCard"

type Props = {
  card: LoreCardWithTags
  projectId: string
}

export function LoreCardItem({ card, projectId }: Props) {
  const updatedAt = formatDistanceToNow(new Date(card.updated_at), {
    addSuffix: true,
    locale: ja,
  })

  // contentの最初の100文字を抜粋
  const excerpt = card.content
    ? card.content.length > 100
      ? card.content.slice(0, 100) + "..."
      : card.content
    : "内容がありません"

  return (
    <Link href={`/projects/${projectId}/cards/${card.id}`} className="block">
      <Card className="h-full transition-colors hover:border-primary/50">
        <CardHeader>
          <CardTitle className="line-clamp-1">{card.title}</CardTitle>
          <CardDescription className="line-clamp-2">{excerpt}</CardDescription>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-3">
          {card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  style={tag.color ? { backgroundColor: tag.color } : undefined}
                  className="text-xs"
                >
                  {tag.name}
                </Badge>
              ))}
              {card.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{card.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
          <span className="text-xs text-muted-foreground">{updatedAt}</span>
        </CardFooter>
      </Card>
    </Link>
  )
}
