"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"

type Props = {
  totalCount: number
  limit: number
}

export function ExplorePagination({ totalCount, limit }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get("page") ?? "1")
  const totalPages = Math.ceil(totalCount / limit)

  if (totalPages <= 1) {
    return null
  }

  function goToPage(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete("page")
    } else {
      params.set("page", String(page))
    }
    router.push(`/explore?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
        前へ
      </Button>
      <span className="text-sm text-muted-foreground">
        {currentPage} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        次へ
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
