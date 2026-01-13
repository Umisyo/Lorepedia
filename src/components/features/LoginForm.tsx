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
import { OAuthButton } from "@/components/features/OAuthButton"
import { loginSchema, type LoginFormData } from "@/schemas/auth"
import { signInWithEmail, signInWithGoogle } from "@/app/actions/auth"

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginFormData) {
    setIsSubmitting(true)
    setFormError(null)

    const result = await signInWithEmail(data.email, data.password)

    if (result.success) {
      router.push("/dashboard")
    } else {
      setFormError(result.error || "ログインに失敗しました")
      setIsSubmitting(false)
    }
  }

  async function handleGoogleLogin() {
    setIsSubmitting(true)
    setFormError(null)

    const redirectUrl = await signInWithGoogle()

    if (redirectUrl) {
      window.location.href = redirectUrl
    } else {
      setFormError("Googleログインに失敗しました")
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
                      autoComplete="current-password"
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
                <FormMessage />
              </FormItem>
            )}
          />

          {/* パスワードリセットリンク */}
          <div className="text-right">
            <Link
              href="/reset-password"
              className="text-sm text-primary underline underline-offset-2"
            >
              パスワードを忘れた方
            </Link>
          </div>

          {/* ログインボタン */}
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "ログイン中..." : "ログイン"}
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
        mode="login"
        onClick={handleGoogleLogin}
        disabled={isSubmitting}
      />

      {/* サインアップ導線 */}
      <p className="text-center text-sm text-muted-foreground">
        アカウントをお持ちでない方{" "}
        <Link href="/signup" className="text-primary underline underline-offset-2">
          新規登録
        </Link>
      </p>
    </div>
  )
}
