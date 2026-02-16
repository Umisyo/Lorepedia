import { z } from "zod"

// プロフィール更新フォーム用スキーマ
export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .transform((v) => v.trim())
    .pipe(
      z
        .string()
        .min(1, "表示名を入力してください")
        .max(50, "表示名は50文字以内で入力してください")
    ),
  bio: z
    .string()
    .transform((v) => v.trim())
    .pipe(z.string().max(200, "自己紹介は200文字以内で入力してください")),
  xAccount: z
    .string()
    .transform((v) => v.trim().replace(/^@/, ""))
    .pipe(
      z
        .string()
        .max(15, "Xアカウント名は15文字以内で入力してください")
        .regex(/^[a-zA-Z0-9_]*$/, {
          message: "Xアカウント名は英数字とアンダースコアのみ使用できます",
        })
    ),
  birthday: z
    .string()
    .transform((v) => v.trim()),
})

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>

// オンボーディング用スキーマ
export const onboardingSchema = z.object({
  displayName: z
    .string()
    .transform((v) => v.trim())
    .pipe(
      z
        .string()
        .min(1, "表示名を入力してください")
        .max(50, "表示名は50文字以内で入力してください")
    ),
})

export type OnboardingFormData = z.infer<typeof onboardingSchema>
