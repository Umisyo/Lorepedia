"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Trash2, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { deleteProject } from "@/app/actions/project"

type DeleteProjectDialogProps = {
  projectId: string
  projectName: string
}

export function DeleteProjectDialog({
  projectId,
  projectName,
}: DeleteProjectDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [error, setError] = useState<string | null>(null)

  const isConfirmValid = confirmText === projectName

  async function handleDelete() {
    if (!isConfirmValid) return

    setIsDeleting(true)
    setError(null)

    const result = await deleteProject(projectId)

    if (result.success) {
      setIsOpen(false)
      router.push("/dashboard")
    } else {
      setError(result.error ?? "プロジェクトの削除に失敗しました")
      setIsDeleting(false)
    }
  }

  function handleOpenChange(open: boolean) {
    if (!isDeleting) {
      setIsOpen(open)
      if (!open) {
        setConfirmText("")
        setError(null)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          プロジェクトを削除
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={!isDeleting}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            プロジェクトの削除
          </DialogTitle>
          <DialogDescription className="text-left">
            この操作は取り消せません。プロジェクト「{projectName}
            」およびすべての関連データ（LoreCard、タグ、メンバー情報など）が完全に削除されます。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              確認のため、プロジェクト名「
              <span className="font-semibold text-foreground">
                {projectName}
              </span>
              」を入力してください。
            </p>
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={projectName}
              disabled={isDeleting}
              autoComplete="off"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isDeleting}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={!isConfirmValid || isDeleting}
          >
            {isDeleting ? (
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
  )
}
