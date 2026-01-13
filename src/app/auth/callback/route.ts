import { createClient } from "@/utils/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

// OAuth コールバック用のルートハンドラー
// Google OAuthのリダイレクト先としてセッションを確立する
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/dashboard"

  if (code) {
    const supabase = await createClient()

    // 認可コードをセッションに交換
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // 成功時はダッシュボードにリダイレクト
      const forwardedHost = request.headers.get("x-forwarded-host")
      const isLocalEnv = process.env.NODE_ENV === "development"

      if (isLocalEnv) {
        // ローカル環境ではリクエストURLのoriginを使用
        return NextResponse.redirect(`${requestUrl.origin}${next}`)
      } else if (forwardedHost) {
        // 本番環境ではx-forwarded-hostを使用
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${requestUrl.origin}${next}`)
      }
    }
  }

  // エラー時はエラーページにリダイレクト
  return NextResponse.redirect(`${requestUrl.origin}/signup?error=oauth_error`)
}
