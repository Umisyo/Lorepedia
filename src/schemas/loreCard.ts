import { z } from "zod"

// カード作成スキーマ
export const createLoreCardSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルを入力してください")
    .max(200, "タイトルは200文字以内で入力してください"),
  content: z
    .string()
    .min(1, "詳細を入力してください")
    .max(50000, "詳細は50,000文字以内で入力してください"),
})

export type CreateLoreCardFormData = z.infer<typeof createLoreCardSchema>

// カード更新スキーマ（部分更新用）
export const updateLoreCardSchema = z.object({
  title: z
    .string()
    .min(1, "タイトルを入力してください")
    .max(200, "タイトルは200文字以内で入力してください")
    .optional(),
  content: z
    .string()
    .min(1, "詳細を入力してください")
    .max(50000, "詳細は50,000文字以内で入力してください")
    .optional(),
})

export type UpdateLoreCardFormData = z.infer<typeof updateLoreCardSchema>

// 編集フォーム用スキーマ（作成と同じバリデーション）
export const editLoreCardSchema = createLoreCardSchema

export type EditLoreCardFormData = z.infer<typeof editLoreCardSchema>
