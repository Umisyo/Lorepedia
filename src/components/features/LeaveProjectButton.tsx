"use client"

import { useTransition } from "react"
import { X } from "lucide-react"

import { leaveProject } from "@/app/actions/membership"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Props = {
  projectId: string
  projectName: string
}

export function LeaveProjectButton({ projectId, projectName }: Props) {
  const [isPending, startTransition] = useTransition()

  function handleLeave() {
    startTransition(async () => {
      const result = await leaveProject(projectId)
      if (!result.success) {
        console.error("離脱エラー:", result.error)
      }
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          disabled={isPending}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">ダッシュボードから削除</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ダッシュボードから削除</AlertDialogTitle>
          <AlertDialogDescription>
            「{projectName}」をダッシュボードから削除しますか？
            プロジェクトの閲覧は引き続き可能です。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={handleLeave} disabled={isPending}>
            {isPending ? "削除中..." : "削除する"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
