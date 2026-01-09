'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { loginSchema, type LoginFormData } from '@/schemas/auth'
import { headers } from 'next/headers'

export type AuthState = {
  error?: string
  success?: boolean
}

// メール/パスワードでのログイン
export async function signInWithEmail(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get('email')
  const password = formData.get('password')

  // 入力データの型チェック
  if (typeof email !== 'string' || typeof password !== 'string') {
    return { error: '入力データが不正です' }
  }

  const rawFormData: LoginFormData = { email, password }

  // バリデーション
  const validatedFields = loginSchema.safeParse(rawFormData)
  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors
    const errorMessage = Object.values(errors).flat()[0]
    return { error: errorMessage || 'バリデーションエラーが発生しました' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
  })

  if (error) {
    // エラーメッセージのマッピング
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'メールアドレスまたはパスワードが正しくありません' }
    }
    if (error.message.includes('rate limit')) {
      return { error: 'しばらく時間をおいてから再度お試しください' }
    }
    return { error: '通信エラーが発生しました。再度お試しください' }
  }

  redirect('/dashboard')
}

// Google OAuthでのログイン
export async function signInWithGoogle(): Promise<AuthState> {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get('origin') || ''

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: 'Googleログインに失敗しました' }
  }

  if (data.url) {
    redirect(data.url)
  }

  return { error: 'Googleログインに失敗しました' }
}
