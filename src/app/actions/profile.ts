"use server"

import { createClient } from "@/utils/supabase/server"
import {
  updateProfileSchema,
  onboardingSchema,
  type UpdateProfileFormData,
  type OnboardingFormData,
} from "@/schemas/profile"

export type UpdateProfileResult = {
  success: boolean
  error?: string
}

// プロフィール更新
export async function updateProfile(
  data: UpdateProfileFormData
): Promise<UpdateProfileResult> {
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  // バリデーション
  const parsed = updateProfileSchema.safeParse(data)

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? "入力内容に誤りがあります",
    }
  }

  const { displayName, bio, xAccount, birthday } = parsed.data

  try {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        bio,
        x_account: xAccount,
        birthday: birthday || null,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("プロフィール更新エラー:", updateError)
      return { success: false, error: "プロフィールの更新に失敗しました" }
    }

    return { success: true }
  } catch (error) {
    console.error("予期しないエラー:", error)
    return {
      success: false,
      error: "予期しないエラーが発生しました。再度お試しください。",
    }
  }
}

export type CompleteOnboardingResult = {
  success: boolean
  error?: string
}

// オンボーディング完了
export async function completeOnboarding(
  data: OnboardingFormData
): Promise<CompleteOnboardingResult> {
  const supabase = await createClient()

  // 認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "ログインが必要です" }
  }

  // バリデーション
  const parsed = onboardingSchema.safeParse(data)

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return {
      success: false,
      error: firstError?.message ?? "入力内容に誤りがあります",
    }
  }

  const { displayName } = parsed.data

  try {
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        display_name: displayName,
        is_onboarded: true,
      })
      .eq("id", user.id)

    if (updateError) {
      console.error("オンボーディング完了エラー:", updateError)
      return { success: false, error: "設定の保存に失敗しました" }
    }

    return { success: true }
  } catch (error) {
    console.error("予期しないエラー:", error)
    return {
      success: false,
      error: "予期しないエラーが発生しました。再度お試しください。",
    }
  }
}
