import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// OAuthコールバックを処理するルートハンドラ
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  // codeがない場合はエラー
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    // エラー時はログインページにリダイレクト
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  // 認証成功後はダッシュボードへリダイレクト
  return NextResponse.redirect(`${origin}/dashboard`)
}
