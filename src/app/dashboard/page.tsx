import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 未ログインの場合はサインアップページにリダイレクト
  if (!user) {
    redirect("/signup")
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <div className="rounded-lg border bg-card p-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">ようこそ！</h1>
        <p className="mb-6 text-muted-foreground">
          アカウントの作成が完了しました。
          <br />
          ダッシュボードは現在開発中です。
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            ログイン中: <span className="font-medium">{user.email}</span>
          </p>
        </div>
        <div className="mt-8">
          <Link
            href="/"
            className="text-primary underline-offset-4 hover:underline"
          >
            トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
