"use client"

import { CardReferenceItem } from "@/components/features/CardReferenceItem"
import { referenceTypeLabels, referenceTypeDescriptions } from "@/types/loreCard"
import type { CardReferenceWithTitle, ReferenceType } from "@/types/loreCard"

type CardReferenceGroupProps = {
  referenceType: ReferenceType
  references: CardReferenceWithTitle[]
  projectId: string
  isEditor: boolean
  onDeleted: () => void
}

export function CardReferenceGroup({
  referenceType,
  references,
  projectId,
  isEditor,
  onDeleted,
}: CardReferenceGroupProps) {
  if (references.length === 0) return null

  return (
    <div className="space-y-2">
      <div>
        <h4 className="text-sm font-medium">
          {referenceTypeLabels[referenceType]}
        </h4>
        <p className="text-xs text-muted-foreground">
          {referenceTypeDescriptions[referenceType]}
        </p>
      </div>
      <div className="space-y-1">
        {references.map((ref) => (
          <CardReferenceItem
            key={ref.id}
            reference={ref}
            projectId={projectId}
            isEditor={isEditor}
            onDeleted={onDeleted}
          />
        ))}
      </div>
    </div>
  )
}
