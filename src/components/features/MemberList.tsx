"use client"

import { useState, useCallback } from "react"

import { MemberItem } from "@/components/features/MemberItem"
import { InviteMemberDialog } from "@/components/features/InviteMemberDialog"
import { getProjectMembers } from "@/app/actions/member"
import type { ProjectMemberWithProfile, MemberRole } from "@/types/project"

type MemberListProps = {
  projectId: string
  currentUserId: string
  isPublicEditable: boolean
  myRole: MemberRole
  initialMembers: ProjectMemberWithProfile[]
}

export function MemberList({
  projectId,
  currentUserId,
  isPublicEditable,
  myRole,
  initialMembers,
}: MemberListProps) {
  const [members, setMembers] = useState<ProjectMemberWithProfile[]>(initialMembers)

  const isOwner = myRole === "owner"
  // 招待ボタン表示条件: ownerかつis_public_editable=false
  const showInviteButton = isOwner && !isPublicEditable

  const refreshMembers = useCallback(async () => {
    const result = await getProjectMembers(projectId)
    if (result.success && result.members) {
      setMembers(result.members)
    }
  }, [projectId])

  return (
    <div className="space-y-4">
      {showInviteButton && (
        <div className="flex justify-end">
          <InviteMemberDialog
            projectId={projectId}
            onInvited={refreshMembers}
          />
        </div>
      )}

      {isPublicEditable && (
        <div className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
          このプロジェクトは「誰でも編集可能」が有効になっているため、ログインしているすべてのユーザーが編集できます。
          メンバー招待機能は無効化されています。
        </div>
      )}

      <div className="space-y-2">
        {members.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            メンバーがいません
          </div>
        ) : (
          members.map((member) => (
            <MemberItem
              key={member.user_id}
              member={member}
              isOwner={isOwner}
              currentUserId={currentUserId}
              projectId={projectId}
              onRemoved={refreshMembers}
            />
          ))
        )}
      </div>
    </div>
  )
}
