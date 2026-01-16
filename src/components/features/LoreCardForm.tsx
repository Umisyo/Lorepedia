"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import {
  createLoreCardSchema,
  type CreateLoreCardFormData,
  type CreateLoreCardFormInput,
} from "@/schemas/loreCard"
import { createLoreCard, updateLoreCard } from "@/app/actions/loreCard"
import { updateCardTags } from "@/app/actions/tag"
import { TagFilter } from "@/components/features/TagFilter"
import type { Tag } from "@/types/loreCard"

type Props = {
  projectId: string
  mode?: "create" | "edit"
  cardId?: string
  defaultValues?: {
    title: string
    content: string
    tagIds?: string[]
  }
  availableTags?: Tag[]
}

export function LoreCardForm({
  projectId,
  mode = "create",
  cardId,
  defaultValues,
  availableTags = [],
}: Props) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const isEditMode = mode === "edit"

  // editLoreCardSchemaはcreateLoreCardSchemaと同じなので、一つに統一
  // FormInputはZodのinput型（デフォルト値を持つフィールドはオプショナル）
  const form = useForm<CreateLoreCardFormInput, unknown, CreateLoreCardFormData>({
    resolver: zodResolver(createLoreCardSchema),
    defaultValues: defaultValues ?? {
      title: "",
      content: "",
      tagIds: [],
    },
  })

  async function onSubmit(data: CreateLoreCardFormData) {
    setIsSubmitting(true)
    setFormError(null)

    const tagIds = data.tagIds ?? []

    if (isEditMode && cardId) {
      const result = await updateLoreCard(projectId, cardId, data)
      if (result.success && result.data) {
        // タグを更新
        const tagResult = await updateCardTags(projectId, cardId, tagIds)
        if (!tagResult.success) {
          console.error("Failed to update tags:", tagResult.error)
        }
        router.push(`/projects/${projectId}/cards/${result.data.id}`)
      } else {
        setFormError(result.error || "カードの更新に失敗しました")
        setIsSubmitting(false)
      }
    } else {
      const result = await createLoreCard(projectId, data)
      if (result.success && result.data) {
        // 新規作成時もタグを設定
        if (tagIds.length > 0) {
          const tagResult = await updateCardTags(projectId, result.data.id, tagIds)
          if (!tagResult.success) {
            console.error("Failed to set tags:", tagResult.error)
          }
        }
        router.push(`/projects/${projectId}/cards/${result.data.id}`)
      } else {
        setFormError(result.error || "カードの作成に失敗しました")
        setIsSubmitting(false)
      }
    }
  }

  const submitButtonText = isEditMode
    ? isSubmitting
      ? "更新中..."
      : "カードを更新"
    : isSubmitting
      ? "作成中..."
      : "カードを作成"

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
                <Textarea
                  placeholder="世界設定の詳細を入力..."
                  className="min-h-[300px] resize-y"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormDescription>Markdown記法が使用できます</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* タグ */}
        <FormField
          control={form.control}
          name="tagIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>タグ</FormLabel>
              <FormControl>
                <TagFilter
                  tags={availableTags}
                  selectedIds={field.value ?? []}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>カードに関連するタグを選択</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 送信ボタン */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {submitButtonText}
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
