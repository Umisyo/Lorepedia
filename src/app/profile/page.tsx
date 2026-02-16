import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { ProfileForm } from "@/components/features/ProfileForm"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // プロフィール情報を取得
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio, x_account, birthday")
    .eq("id", user.id)
    .single()

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">プロフィール設定</h1>
      <Card>
        <CardHeader>
          <CardTitle>プロフィール情報</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm
            email={user.email ?? ""}
            defaultValues={{
              displayName: profile?.display_name ?? "",
              bio: profile?.bio ?? "",
              xAccount: profile?.x_account ?? "",
              birthday: profile?.birthday ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
