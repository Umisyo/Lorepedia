"use client"

import { useState } from "react"
import { Loader2, UserPlus, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { UserSearchInput } from "@/components/features/UserSearchInput"
import { inviteMember } from "@/app/actions/member"
import type { UserSearchResult } from "@/types/project"

type InviteMemberDialogProps = {
  projectId: string
  onInvited: () => void
}

export function InviteMemberDialog({
  projectId,
  onInvited,
}: InviteMemberDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null
  )
  const [error, setError] = useState<string | null>(null)

  async function handleInvite() {
    if (!selectedUser) return

    setIsInviting(true)
    setError(null)

    const result = await inviteMember(projectId, selectedUser.id)

    if (result.success) {
      setIsOpen(false)
      setSelectedUser(null)
      onInvited()
    } else {
      setError(result.error ?? "招待に失敗しました")
      setIsInviting(false)
    }
  }

  function handleOpenChange(open: boolean) {
    if (!isInviting) {
      setIsOpen(open)
      if (!open) {
        setSelectedUser(null)
        setError(null)
      }
    }
  }

  function handleSelectUser(user: UserSearchResult) {
    setSelectedUser(user)
    setError(null)
  }

  function handleClearSelection() {
    setSelectedUser(null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          メンバーを招待
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={!isInviting}>
        <DialogHeader>
          <DialogTitle>メンバーを招待</DialogTitle>
          <DialogDescription>
            プロジェクトに新しいメンバーを招待します。招待されたメンバーには編集権限が付与されます。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {selectedUser ? (
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  {selectedUser.avatarUrl ? (
                    <AvatarImage
                      src={selectedUser.avatarUrl}
                      alt={selectedUser.displayName ?? ""}
                    />
                  ) : null}
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">
                  {selectedUser.displayName ?? "名前未設定"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                disabled={isInviting}
              >
                変更
              </Button>
            </div>
          ) : (
            <UserSearchInput
              projectId={projectId}
              onSelect={handleSelectUser}
              disabled={isInviting}
            />
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isInviting}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            onClick={handleInvite}
            disabled={!selectedUser || isInviting}
          >
            {isInviting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                招待中...
              </>
            ) : (
              "招待する"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
