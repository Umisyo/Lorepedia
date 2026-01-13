import { z } from "zod"

// サインアップフォームのバリデーションスキーマ
export const signupSchema = z
  .object({
    email: z
      .string()
      .min(1, "メールアドレスを入力してください")
      .email("有効なメールアドレスを入力してください"),
    password: z
      .string()
      .min(1, "パスワードを入力してください")
      .min(8, "パスワードは8文字以上で入力してください"),
    confirmPassword: z.string().min(1, "パスワード（確認）を入力してください"),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "利用規約とプライバシーポリシーに同意してください",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  })

export type SignupFormData = z.infer<typeof signupSchema>

// パスワード強度の判定
export type PasswordStrength = "weak" | "medium" | "strong"

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) {
    return "weak"
  }

  // 英字・数字・記号が混合されているかチェック
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

  if (hasLetter && hasNumber && hasSymbol) {
    return "strong"
  }

  return "medium"
}
