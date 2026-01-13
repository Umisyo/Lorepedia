"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export type AuthActionResult = {
  success: boolean
  error?: string
}

// メールアドレス・パスワードでサインアップ
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // 確認メールは任意なので、メール確認後の遷移先は設定しない
      emailRedirectTo: undefined,
    },
  })

  if (error) {
    // エラーメッセージのローカライズ
    if (error.message.includes("already registered")) {
      return {
        success: false,
        error: "このメールアドレスはすでに登録されています",
      }
    }
    return {
      success: false,
      error: "登録に失敗しました。再度お試しください",
    }
  }

  return { success: true }
}

// メールアドレス・パスワードでログイン
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // エラーメッセージのローカライズ
    if (error.message.includes("Invalid login credentials")) {
      return {
        success: false,
        error: "メールアドレスまたはパスワードが正しくありません",
      }
    }
    if (error.message.includes("Email not confirmed")) {
      return {
        success: false,
        error: "メールアドレスが確認されていません。確認メールをご確認ください",
      }
    }
    // レート制限エラー
    if (error.message.includes("rate limit") || error.status === 429) {
      return {
        success: false,
        error: "しばらく時間をおいてから再度お試しください",
      }
    }
    return {
      success: false,
      error: "通信エラーが発生しました。再度お試しください",
    }
  }

  return { success: true }
}

// Google OAuthでサインアップ/ログイン
export async function signInWithGoogle(): Promise<string | null> {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get("origin") || ""

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error || !data.url) {
    return null
  }

  return data.url
}

// サインアップ成功後のダッシュボードへのリダイレクト
export async function redirectToDashboard(): Promise<never> {
  redirect("/dashboard")
}
