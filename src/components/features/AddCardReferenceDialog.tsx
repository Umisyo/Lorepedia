"use client"

import { useState } from "react"
import { Loader2, Plus, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CardSearchInput } from "@/components/features/CardSearchInput"
import { createCardReference } from "@/app/actions/cardReference"
import { referenceTypeLabels } from "@/types/loreCard"
import { manualReferenceTypes } from "@/schemas/cardReference"
import type { ManualReferenceType } from "@/schemas/cardReference"
import type { CardMentionSuggestion } from "@/app/actions/loreCard"

type AddCardReferenceDialogProps = {
  projectId: string
  cardId: string
  existingReferenceCardIds: string[]
  onAdded: () => void
}

export function AddCardReferenceDialog({
  projectId,
  cardId,
  existingReferenceCardIds,
  onAdded,
}: AddCardReferenceDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [selectedCard, setSelectedCard] = useState<CardMentionSuggestion | null>(null)
  const [referenceType, setReferenceType] = useState<ManualReferenceType>("related")
  const [error, setError] = useState<string | null>(null)

  // 自分自身 + 既存の参照先を除外
  const excludeCardIds = [cardId, ...existingReferenceCardIds]

  async function handleAdd() {
    if (!selectedCard) return

    setIsAdding(true)
    setError(null)

    const result = await createCardReference({
      sourceCardId: cardId,
      targetCardId: selectedCard.id,
      referenceType,
    })

    if (result.success) {
      setIsOpen(false)
      resetState()
      onAdded()
    } else {
      setError(result.error ?? "参照の追加に失敗しました")
      setIsAdding(false)
    }
  }

  function resetState() {
    setSelectedCard(null)
    setReferenceType("related")
    setError(null)
    setIsAdding(false)
  }

  function handleOpenChange(open: boolean) {
    if (!isAdding) {
      setIsOpen(open)
      if (!open) {
        resetState()
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          参照を追加
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={!isAdding}>
        <DialogHeader>
          <DialogTitle>カード参照を追加</DialogTitle>
          <DialogDescription>
            このカードと他のカードの関係性を設定します。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* 参照タイプ選択 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">参照タイプ</label>
            <Select
              value={referenceType}
              onValueChange={(v) => setReferenceType(v as ManualReferenceType)}
              disabled={isAdding}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {manualReferenceTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {referenceTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* カード検索 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">対象カード</label>
            {selectedCard ? (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="truncate text-sm font-medium">
                    {selectedCard.title}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCard(null)}
                  disabled={isAdding}
                >
                  変更
                </Button>
              </div>
            ) : (
              <CardSearchInput
                projectId={projectId}
                onSelect={setSelectedCard}
                excludeCardIds={excludeCardIds}
                disabled={isAdding}
              />
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isAdding}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            onClick={handleAdd}
            disabled={!selectedCard || isAdding}
          >
            {isAdding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                追加中...
              </>
            ) : (
              "追加する"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
