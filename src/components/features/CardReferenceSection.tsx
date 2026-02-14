"use client"

import { useState, useCallback } from "react"
import { Link2 } from "lucide-react"

import { CardReferenceGroup } from "@/components/features/CardReferenceGroup"
import { AddCardReferenceDialog } from "@/components/features/AddCardReferenceDialog"
import { getCardReferencesForCard } from "@/app/actions/cardReference"
import type { CardReferenceWithTitle, ReferenceType } from "@/types/loreCard"

// 表示順序
const referenceTypeOrder: ReferenceType[] = [
  "depends_on",
  "derives_from",
  "contradicts",
  "related",
  "mentions",
]

type CardReferenceSectionProps = {
  projectId: string
  cardId: string
  initialReferences: CardReferenceWithTitle[]
  isEditor: boolean
}

export function CardReferenceSection({
  projectId,
  cardId,
  initialReferences,
  isEditor,
}: CardReferenceSectionProps) {
  const [references, setReferences] = useState(initialReferences)

  // サーバーから最新データを再取得
  const refreshReferences = useCallback(async () => {
    const result = await getCardReferencesForCard(cardId)
    if (result.success && result.data) {
      setReferences(result.data)
    }
  }, [cardId])

  // 参照タイプごとにグループ化
  const groupedReferences = referenceTypeOrder
    .map((type) => ({
      type,
      refs: references.filter((r) => r.referenceType === type),
    }))
    .filter((group) => group.refs.length > 0)

  // 既存参照のカードID一覧（追加ダイアログの除外用）
  const existingReferenceCardIds = references.map((r) => r.relatedCard.id)

  if (references.length === 0 && !isEditor) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold">関連カード</h3>
        </div>
        {isEditor && (
          <AddCardReferenceDialog
            projectId={projectId}
            cardId={cardId}
            existingReferenceCardIds={existingReferenceCardIds}
            onAdded={refreshReferences}
          />
        )}
      </div>

      {groupedReferences.length > 0 ? (
        <div className="space-y-4">
          {groupedReferences.map((group) => (
            <CardReferenceGroup
              key={group.type}
              referenceType={group.type}
              references={group.refs}
              projectId={projectId}
              isEditor={isEditor}
              onDeleted={refreshReferences}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          関連カードはまだ設定されていません。
        </p>
      )}
    </div>
  )
}
