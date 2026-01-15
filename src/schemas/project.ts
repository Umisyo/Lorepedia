import { z } from "zod"

// 文字列をトリムしてからバリデーションを行うヘルパー
const trimmedString = (schema: z.ZodString) =>
  z.preprocess((val) => (typeof val === "string" ? val.trim() : val), schema)

// プロジェクト作成フォーム用スキーマ
export const createProjectSchema = z.object({
  name: trimmedString(
    z
      .string()
      .min(1, "プロジェクト名を入力してください")
      .max(100, "プロジェクト名は100文字以内で入力してください")
  ),
  description: trimmedString(
    z.string().max(500, "概要は500文字以内で入力してください")
  ),
  isPublicEditable: z.boolean(),
  tags: z
    .array(
      trimmedString(
        z
          .string()
          .min(1, "タグ名を入力してください")
          .max(20, "タグ名は20文字以内で入力してください")
      )
    )
    .max(5, "タグは最大5個まで設定できます"),
})

export type CreateProjectFormData = z.infer<typeof createProjectSchema>
