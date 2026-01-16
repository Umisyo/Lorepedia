import { LoreCardItem } from "./LoreCardItem"
import { LoreCardListItem } from "./LoreCardListItem"
import { LoreCardEmptyState } from "./LoreCardEmptyState"
import type { LoreCardWithTags } from "@/types/loreCard"
import type { ViewMode } from "@/types/filter"

type Props = {
  cards: LoreCardWithTags[]
  projectId: string
  viewMode?: ViewMode
  isLoggedIn: boolean
}

export function LoreCardList({ cards, projectId, viewMode = "grid", isLoggedIn }: Props) {
  if (cards.length === 0) {
    return <LoreCardEmptyState projectId={projectId} />
  }

  // リストビュー
  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-2">
        {cards.map((card) => (
          <LoreCardListItem key={card.id} card={card} projectId={projectId} isLoggedIn={isLoggedIn} />
        ))}
      </div>
    )
  }

  // グリッドビュー（デフォルト）
  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <LoreCardItem key={card.id} card={card} projectId={projectId} isLoggedIn={isLoggedIn} />
      ))}
    </div>
  )
}
