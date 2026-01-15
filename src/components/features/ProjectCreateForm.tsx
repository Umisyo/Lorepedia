"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { TagInput } from "@/components/features/TagInput"
import {
  createProjectSchema,
  type CreateProjectFormData,
} from "@/schemas/project"
import { createProject } from "@/app/actions/project"

export function ProjectCreateForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublicEditable: false,
      tags: [],
    },
  })

  async function onSubmit(data: CreateProjectFormData) {
    setIsSubmitting(true)
    setFormError(null)

    const result = await createProject(data)

    if (result.success && result.projectId) {
      router.push(`/projects/${result.projectId}`)
    } else {
      setFormError(result.error || "プロジェクトの作成に失敗しました")
      setIsSubmitting(false)
    }
  }

  function handleCancel() {
    router.push("/dashboard")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* グローバルエラー表示 */}
        {formError && (
          <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            {formError}
          </div>
        )}

        {/* プロジェクト名 */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                プロジェクト名 <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="例: ファンタジー世界「エルドラシア」"
                  disabled={isSubmitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 概要 */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>概要</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="プロジェクトの説明を入力してください（任意）"
                  className="min-h-[100px] resize-y"
                  disabled={isSubmitting}
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                ダッシュボードやプロジェクト一覧に表示されます
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 誰でも編集可能 */}
        <FormField
          control={form.control}
          name="isPublicEditable"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">
                  誰でも編集可能にする
                </FormLabel>
                <FormDescription>
                  有効にすると、ログインしているすべてのユーザーがこのプロジェクトの設定カードを編集できます。無効の場合は招待されたメンバーのみが編集できます。
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* プロジェクトタグ */}
        <Controller
          control={form.control}
          name="tags"
          render={({ field, fieldState }) => (
            <FormItem>
              <FormLabel>プロジェクトタグ</FormLabel>
              <FormControl>
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  maxTags={5}
                  maxTagLength={20}
                  disabled={isSubmitting}
                  placeholder="タグを入力してEnterで追加"
                />
              </FormControl>
              <FormDescription>
                プロジェクトの分類に使用します。最大5個まで設定できます。
              </FormDescription>
              {fieldState.error && (
                <p className="text-sm text-destructive">
                  {fieldState.error.message}
                </p>
              )}
            </FormItem>
          )}
        />

        {/* アクションボタン */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            キャンセル
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                作成中...
              </>
            ) : (
              "プロジェクトを作成"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
