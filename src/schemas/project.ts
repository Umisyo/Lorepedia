import { z } from "zod"

// プロジェクト作成フォーム用スキーマ
export const createProjectSchema = z.object({
  name: z
    .string()
    .min(1, "プロジェクト名を入力してください")
    .max(100, "プロジェクト名は100文字以内で入力してください")
    .transform((v) => v.trim()),
  description: z
    .string()
    .max(500, "概要は500文字以内で入力してください")
    .transform((v) => v.trim()),
  isPublicEditable: z.boolean(),
  tags: z
    .array(
      z
        .string()
        .min(1, "タグ名を入力してください")
        .max(20, "タグ名は20文字以内で入力してください")
        .transform((v) => v.trim())
    )
    .max(5, "タグは最大5個まで設定できます"),
})

export type CreateProjectFormData = z.infer<typeof createProjectSchema>
