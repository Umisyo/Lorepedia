"use client"

import { useRouter } from "next/navigation"
import { useCallback } from "react"

import { Header } from "@/components/features/Header"
import type { HeaderUser } from "@/types/header"
import { createClient } from "@/utils/supabase/client"

type Props = {
  user: HeaderUser | null
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
