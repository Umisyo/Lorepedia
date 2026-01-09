import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SignupForm } from "@/components/features/SignupForm"

export const metadata: Metadata = {
  title: "サインアップ | Lorepedia",
  description: "Lorepediaで新しいアカウントを作成して、シェアード・ワールド創作を始めましょう。",
}

export default async function SignupPage() {
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
          <CardTitle className="text-2xl">アカウントを作成</CardTitle>
          <CardDescription>
            Lorepediaで創作を始めましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm />
        </CardContent>
      </Card>
    </div>
  )
}
