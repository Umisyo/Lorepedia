"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
  FormDescription,
} from "@/components/ui/form"
import { RichTextEditor } from "@/components/features/editor"
import {
  createLoreCardSchema,
  type CreateLoreCardFormData,
} from "@/schemas/loreCard"
import { createLoreCard } from "@/app/actions/loreCard"

type Props = {
  projectId: string
}

export function LoreCardForm({ projectId }: Props) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<CreateLoreCardFormData>({
    resolver: zodResolver(createLoreCardSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  })

  async function onSubmit(data: CreateLoreCardFormData) {
    setIsSubmitting(true)
    setFormError(null)

    const result = await createLoreCard(projectId, data)

    if (result.success && result.data) {
      router.push(`/projects/${projectId}/cards/${result.data.id}`)
    } else {
      setFormError(result.error || "カードの作成に失敗しました")
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* フォームエラー */}
        {formError && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {formError}
          </div>
        )}

        {/* タイトル */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>タイトル</FormLabel>
              <FormControl>
                <Input
                  placeholder="カードのタイトルを入力"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>200文字以内</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 詳細 */}
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>詳細</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                  placeholder="世界設定の詳細を入力..."
                  disabled={isSubmitting}
                  projectId={projectId}
                />
              </FormControl>
              <FormDescription>
                ツールバーまたはMarkdown記法で書式を設定できます。@でカードへのリンクを挿入できます。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 送信ボタン */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "作成中..." : "カードを作成"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
        </div>
      </form>
    </Form>
  )
}
