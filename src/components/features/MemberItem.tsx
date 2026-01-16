"use client"

import { useState } from "react"
import { Loader2, Trash2, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import type { ProjectMemberWithProfile } from "@/types/project"
import { roleLabels } from "@/types/project"
import { removeMember } from "@/app/actions/member"

type MemberItemProps = {
  member: ProjectMemberWithProfile
  isOwner: boolean
  currentUserId: string
  projectId: string
  onRemoved: () => void
}

export function MemberItem({
  member,
  isOwner,
  currentUserId,
  projectId,
  onRemoved,
}: MemberItemProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCurrentUser = member.user_id === currentUserId
  const isMemberOwner = member.role === "owner"
  const canRemove = isOwner && !isCurrentUser && !isMemberOwner

  async function handleRemove() {
    setIsRemoving(true)
    setError(null)

    const result = await removeMember(projectId, member.user_id)

    if (result.success) {
      setIsOpen(false)
      onRemoved()
    } else {
      setError(result.error ?? "メンバーの削除に失敗しました")
      setIsRemoving(false)
    }
  }

  function handleOpenChange(open: boolean) {
    if (!isRemoving) {
      setIsOpen(open)
      if (!open) {
        setError(null)
      }
    }
  }

  const displayName = member.profile?.display_name ?? "名前未設定"
  const avatarUrl = member.profile?.avatar_url

  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <Avatar>
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={displayName} />
          ) : null}
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">
            {displayName}
            {isCurrentUser && (
              <span className="ml-2 text-xs text-muted-foreground">
                (自分)
              </span>
            )}
          </span>
          <span className="text-sm text-muted-foreground">
            {roleLabels[member.role]}
          </span>
        </div>
      </div>

      {canRemove && (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent showCloseButton={!isRemoving}>
            <DialogHeader>
              <DialogTitle>メンバーを削除</DialogTitle>
              <DialogDescription>
                「{displayName}」をプロジェクトから削除しますか？
                この操作は取り消せません。
              </DialogDescription>
            </DialogHeader>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isRemoving}
              >
                キャンセル
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemove}
                disabled={isRemoving}
              >
                {isRemoving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    削除中...
                  </>
                ) : (
                  "削除する"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
