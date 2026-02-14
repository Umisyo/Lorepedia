"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, ArrowLeft, Trash2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { deleteCardReference } from "@/app/actions/cardReference"
import type { CardReferenceWithTitle } from "@/types/loreCard"

type CardReferenceItemProps = {
  reference: CardReferenceWithTitle
  projectId: string
  isEditor: boolean
  onDeleted: () => void
}

export function CardReferenceItem({
  reference,
  projectId,
  isEditor,
  onDeleted,
}: CardReferenceItemProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const isMention = reference.referenceType === "mentions"

  async function handleDelete() {
    setIsDeleting(true)
    const result = await deleteCardReference(reference.id)
    if (result.success) {
      onDeleted()
    } else {
      console.error("参照の削除に失敗:", result.error)
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border px-3 py-2">
      <div className="flex items-center gap-2 min-w-0">
        {reference.direction === "outgoing" ? (
          <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ArrowLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
        <Link
          href={`/projects/${projectId}/cards/${reference.relatedCard.id}`}
          className="truncate text-sm text-foreground hover:underline"
        >
          {reference.relatedCard.title}
        </Link>
      </div>

      {isEditor && !isMention && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 shrink-0 p-0"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label={`${reference.relatedCard.title} への参照を削除`}
        >
          {isDeleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          )}
        </Button>
      )}
    </div>
  )
}
