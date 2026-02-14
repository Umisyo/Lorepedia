import { getCardReferencesForCard } from "@/app/actions/cardReference"
import { CardReferenceSection } from "@/components/features/CardReferenceSection"

type Props = {
  projectId: string
  cardId: string
  isEditor: boolean
}

// Server Componentとして参照データを取得し、CardReferenceSectionに渡す
export async function CardReferenceSectionLoader({ projectId, cardId, isEditor }: Props) {
  const referencesResult = await getCardReferencesForCard(cardId)
  const references = referencesResult.success ? (referencesResult.data ?? []) : []

  return (
    <CardReferenceSection
      projectId={projectId}
      cardId={cardId}
      initialReferences={references}
      isEditor={isEditor}
    />
  )
}
