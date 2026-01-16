import { z } from "zod"

// タグ作成用スキーマ
// .transform()でトリム後、.pipe()で再度バリデーションを行い、空白のみの入力を拒否する
export const createTagSchema = z.object({
  name: z
    .string()
    .transform((v) => v.trim())
    .pipe(
      z
        .string()
        .min(1, "タグ名を入力してください")
        .max(20, "タグ名は20文字以内で入力してください")
    ),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "無効な色形式です")
    .optional(),
})

export type CreateTagFormData = z.infer<typeof createTagSchema>
