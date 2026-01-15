import type { Metadata } from "next"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { createClient } from "@/utils/supabase/server"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ProjectCreateForm } from "@/components/features/ProjectCreateForm"

export const metadata: Metadata = {
  title: "新規プロジェクト作成 | Lorepedia",
  description: "新しいプロジェクトを作成して創作を始めましょう",
}

export default async function NewProjectPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 未ログイン時はログインページへリダイレクト
  if (!user) {
    redirect("/login?redirect=/projects/new")
  }

  return (
    <div className="container max-w-2xl py-8">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        ダッシュボードに戻る
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>新規プロジェクト作成</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectCreateForm />
        </CardContent>
      </Card>
    </div>
  )
}
