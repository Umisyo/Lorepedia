import { FileQuestion } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <FileQuestion className="mb-4 h-12 w-12 text-muted-foreground" />
      <h2 className="mb-2 text-lg font-semibold">
        ページが見つかりません
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <Button asChild>
        <Link href="/dashboard">ダッシュボードへ</Link>
      </Button>
    </div>
  )
}
