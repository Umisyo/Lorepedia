"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import {
  updateProfileSchema,
  type UpdateProfileFormData,
} from "@/schemas/profile"
import { updateProfile } from "@/app/actions/profile"

type ProfileFormProps = {
  email: string
  defaultValues: UpdateProfileFormData
}

export function ProfileForm({ email, defaultValues }: ProfileFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const form = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues,
  })

  async function onSubmit(data: UpdateProfileFormData) {
    setIsSubmitting(true)
    setFormError(null)
    setSuccessMessage(null)

    const result = await updateProfile(data)

    if (result.success) {
      setSuccessMessage("プロフィールを保存しました")
      router.refresh()
    } else {
      setFormError(result.error ?? "プロフィールの更新に失敗しました")
    }

    setIsSubmitting(false)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 成功メッセージ */}
        {successMessage && (
          <div className="rounded-md bg-green-500/10 p-4 text-sm text-green-600 dark:text-green-400">
            {successMessage}
          </div>
        )}

        {/* エラー表示 */}
        {formError && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {formError}
          </div>
        )}

        {/* メールアドレス（読み取り専用） */}
        <FormItem>
          <FormLabel>メールアドレス</FormLabel>
          <FormControl>
            <Input value={email} disabled />
          </FormControl>
          <FormDescription>メールアドレスは変更できません</FormDescription>
        </FormItem>

        {/* 表示名 */}
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                表示名 <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="表示名を入力してください"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                他のユーザーに表示される名前です（最大50文字）
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 自己紹介 */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>自己紹介</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="自己紹介を入力してください（任意）"
                  className="min-h-[100px] resize-y"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>最大200文字</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Xアカウント */}
        <FormField
          control={form.control}
          name="xAccount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Xアカウント</FormLabel>
              <FormControl>
                <Input
                  placeholder="username"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>@なしで入力してください</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 生年月日 */}
        <FormField
          control={form.control}
          name="birthday"
          render={({ field }) => (
            <FormItem>
              <FormLabel>生年月日</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  disabled={isSubmitting}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 送信ボタン */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                保存中...
              </>
            ) : (
              "プロフィールを保存"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
