"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"

import { Header } from "@/components/features/Header"
import { createClient } from "@/utils/supabase/client"

type User = {
  email: string
  avatarUrl?: string | null
}

type Props = {
  user: User | null
}

// Server Componentから受け取ったユーザー情報を元にHeaderをレンダリング
// ログアウト処理はClient側で実行
export function HeaderWrapper({ user }: Props) {
  const router = useRouter()

  const handleLogout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }, [router])

  return <Header user={user} onLogout={handleLogout} />
}
