import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoginForm } from "@/components/features/LoginForm"

export const metadata: Metadata = {
  title: "ログイン | Lorepedia",
  description: "Lorepediaにログインして、シェアード・ワールド創作を続けましょう。",
}

export default async function LoginPage() {
  // ログイン済みの場合はダッシュボードへリダイレクト
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ログイン</CardTitle>
          <CardDescription>
            アカウントにログインしてください
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  )
}
