"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  onboardingSchema,
  type OnboardingFormData,
} from "@/schemas/profile"
import { completeOnboarding } from "@/app/actions/profile"

export function OnboardingForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: "",
    },
  })

  async function onSubmit(data: OnboardingFormData) {
    setIsSubmitting(true)
    setFormError(null)

    const result = await completeOnboarding(data)

    if (result.success) {
      router.push("/dashboard")
    } else {
      setFormError(result.error ?? "設定の保存に失敗しました")
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* エラー表示 */}
        {formError && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {formError}
          </div>
        )}

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

        {/* 送信ボタン */}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              設定中...
            </>
          ) : (
            "はじめる"
          )}
        </Button>
      </form>
    </Form>
  )
}
