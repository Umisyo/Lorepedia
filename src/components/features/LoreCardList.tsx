import { LoreCardItem } from "./LoreCardItem"
import { LoreCardEmptyState } from "./LoreCardEmptyState"
import type { LoreCardWithTags } from "@/types/loreCard"

type Props = {
  cards: LoreCardWithTags[]
  projectId: string
}

export function LoreCardList({ cards, projectId }: Props) {
  if (cards.length === 0) {
    return <LoreCardEmptyState projectId={projectId} />
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <LoreCardItem key={card.id} card={card} projectId={projectId} />
      ))}
    </div>
  )
}
