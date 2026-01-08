'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { OAuthButton } from '@/components/features/OAuthButton'
import { signInWithEmail, type AuthState } from '@/app/actions/auth'

const initialState: AuthState = {}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    signInWithEmail,
    initialState
  )
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">ログイン</CardTitle>
          <CardDescription>
            アカウントにログインしてください
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* メール/パスワードフォーム */}
          <form action={formAction} className="space-y-4">
            {state.error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {state.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="メールアドレス"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="パスワード"
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="text-right">
              <Link
                href="/reset-password"
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                パスワードを忘れた方
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>

          {/* 区切り線 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">または</span>
            </div>
          </div>

          {/* OAuth */}
          <OAuthButton />
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            アカウントをお持ちでない方{' '}
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              新規登録
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
