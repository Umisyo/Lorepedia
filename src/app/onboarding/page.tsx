import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { OnboardingForm } from "@/components/features/OnboardingForm"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // オンボーディング済みならダッシュボードへ
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_onboarded")
    .eq("id", user.id)
    .single()

  if (profile?.is_onboarded) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ようこそ Lorepedia へ!</CardTitle>
          <CardDescription>
            まず、他のユーザーに表示される名前を設定しましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm />
        </CardContent>
      </Card>
    </div>
  )
}
