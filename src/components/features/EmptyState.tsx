import Link from "next/link"
import { FolderPlus } from "lucide-react"

import { Button } from "@/components/ui/button"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
      <FolderPlus className="mb-4 h-12 w-12 text-muted-foreground" />
      <h2 className="mb-2 text-lg font-semibold">
        まだプロジェクトがありません
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        新しいプロジェクトを作成して、創作を始めましょう
      </p>
      <Button asChild>
        <Link href="/projects/new">新規プロジェクト</Link>
      </Button>
    </div>
  )
}
