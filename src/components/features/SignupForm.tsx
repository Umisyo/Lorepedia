"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { PasswordStrengthIndicator } from "@/components/features/PasswordStrengthIndicator"
import { OAuthButton } from "@/components/features/OAuthButton"
import { signupSchema, type SignupFormData } from "@/schemas/auth"
import { signUpWithEmail, signInWithGoogle } from "@/app/actions/auth"

export function SignupForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  })

  const password = form.watch("password")

  async function onSubmit(data: SignupFormData) {
    setIsSubmitting(true)
    setFormError(null)

    const result = await signUpWithEmail(data.email, data.password)

    if (result.success) {
      router.push("/dashboard")
    } else {
      setFormError(result.error || "登録に失敗しました")
      setIsSubmitting(false)
    }
  }

  async function handleGoogleSignup() {
    setIsSubmitting(true)
    setFormError(null)

    const redirectUrl = await signInWithGoogle()

    if (redirectUrl) {
      window.location.href = redirectUrl
    } else {
      setFormError("Google登録に失敗しました")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* フォームエラー */}
          {formError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {formError}
            </div>
          )}

          {/* メールアドレス */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>メールアドレス</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="メールアドレス"
                    autoComplete="email"
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* パスワード */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>パスワード</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="パスワード"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <PasswordStrengthIndicator password={password} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* パスワード確認 */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>パスワード（確認）</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="パスワード（確認）"
                      autoComplete="new-password"
                      disabled={isSubmitting}
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 利用規約同意 */}
          <FormField
            control={form.control}
            name="agreeToTerms"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-2">
                  <FormControl>
                    <input
                      type="checkbox"
                      className="mt-1 size-4 rounded border-input"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal leading-relaxed">
                    <Link
                      href="/terms"
                      className="text-primary underline underline-offset-2"
                      target="_blank"
                    >
                      利用規約
                    </Link>
                    と
                    <Link
                      href="/privacy"
                      className="text-primary underline underline-offset-2"
                      target="_blank"
                    >
                      プライバシーポリシー
                    </Link>
                    に同意する
                  </FormLabel>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* サインアップボタン */}
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "登録中..." : "アカウントを作成"}
          </Button>
        </form>
      </Form>

      {/* 区切り線 */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            または
          </span>
        </div>
      </div>

      {/* Google OAuth */}
      <OAuthButton
        provider="google"
        mode="signup"
        onClick={handleGoogleSignup}
        disabled={isSubmitting}
      />

      {/* ログイン導線 */}
      <p className="text-center text-sm text-muted-foreground">
        すでにアカウントをお持ちの方{" "}
        <Link href="/login" className="text-primary underline underline-offset-2">
          ログイン
        </Link>
      </p>
    </div>
  )
}
