"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2, User, Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { searchUsers } from "@/app/actions/member"
import type { UserSearchResult } from "@/types/project"

type UserSearchInputProps = {
  projectId: string
  onSelect: (user: UserSearchResult) => void
  disabled?: boolean
}

export function UserSearchInput({
  projectId,
  onSelect,
  disabled = false,
}: UserSearchInputProps) {
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<UserSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // デバウンス検索
  useEffect(() => {
    const trimmedQuery = query.trim()

    const timer = setTimeout(async () => {
      if (!trimmedQuery) {
        setUsers([])
        setShowResults(false)
        return
      }

      setIsSearching(true)
      const result = await searchUsers(trimmedQuery, projectId)
      if (result.success && result.users) {
        setUsers(result.users)
        setShowResults(true)
      }
      setIsSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, projectId])

  // 外部クリックで閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelect(user: UserSearchResult) {
    setQuery("")
    setUsers([])
    setShowResults(false)
    onSelect(user)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => users.length > 0 && setShowResults(true)}
          placeholder="ユーザー名で検索..."
          disabled={disabled}
          className="pl-9"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {showResults && users.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
          <ul className="max-h-60 overflow-auto py-1">
            {users.map((user) => (
              <li key={user.id}>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 px-4 py-2 hover:bg-accent"
                  onClick={() => handleSelect(user)}
                >
                  <Avatar className="h-8 w-8">
                    {user.avatarUrl ? (
                      <AvatarImage
                        src={user.avatarUrl}
                        alt={user.displayName ?? ""}
                      />
                    ) : null}
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {user.displayName ?? "名前未設定"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showResults && query.trim() && users.length === 0 && !isSearching && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover p-4 text-center text-sm text-muted-foreground shadow-md">
          該当するユーザーが見つかりません
        </div>
      )}
    </div>
  )
}
