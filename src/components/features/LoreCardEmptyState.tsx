import Link from "next/link"
import { FileText, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"

type Props = {
  projectId: string
}

export function LoreCardEmptyState({ projectId }: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">カードがありません</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        世界設定を記録する最初のカードを作成しましょう
      </p>
      <Button asChild className="mt-6">
        <Link href={`/projects/${projectId}/cards/new`}>
          <Plus className="mr-2 h-4 w-4" />
          カードを作成
        </Link>
      </Button>
    </div>
  )
}
