"use client"

import Link from "next/link"
import { AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"

type ErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ reset }: ErrorProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <AlertTriangle className="mb-4 h-12 w-12 text-destructive" />
      <h2 className="mb-2 text-lg font-semibold">
        エラーが発生しました
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        予期しないエラーが発生しました。もう一度お試しください。
      </p>
      <div className="flex gap-4">
        <Button onClick={reset}>もう一度試す</Button>
        <Button variant="outline" asChild>
          <Link href="/">ホームへ戻る</Link>
        </Button>
      </div>
    </div>
  )
}
