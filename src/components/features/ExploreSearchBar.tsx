"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"

export function ExploreSearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get("search") ?? "")

  // デバウンスでURL更新
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set("search", value)
      } else {
        params.delete("search")
      }
      // 検索時はページを1に戻す
      params.delete("page")
      router.push(`/explore?${params.toString()}`)
    }, 300)

    return () => clearTimeout(timer)
  }, [value, searchParams, router])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value)
    },
    []
  )

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder="プロジェクト名で検索..."
        value={value}
        onChange={handleChange}
        className="pl-10"
      />
    </div>
  )
}
