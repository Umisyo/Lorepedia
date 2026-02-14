"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Check, LogIn, Plus } from "lucide-react"

import { joinProject } from "@/app/actions/membership"
import { Button } from "@/components/ui/button"

type Props = {
  projectId: string
  isMember: boolean
  isLoggedIn: boolean
}

export function JoinProjectButton({ projectId, isMember, isLoggedIn }: Props) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  if (!isLoggedIn) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/login")}
      >
        <LogIn className="mr-1.5 h-3.5 w-3.5" />
        ログインして追加
      </Button>
    )
  }

  if (isMember) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Check className="mr-1.5 h-3.5 w-3.5" />
        追加済み
      </Button>
    )
  }

  function handleJoin() {
    startTransition(async () => {
      const result = await joinProject(projectId)
      if (!result.success) {
        console.error("参加エラー:", result.error)
      }
    })
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleJoin}
      disabled={isPending}
    >
      <Plus className="mr-1.5 h-3.5 w-3.5" />
      {isPending ? "追加中..." : "ダッシュボードに追加"}
    </Button>
  )
}
