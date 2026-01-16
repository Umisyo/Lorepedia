import { z } from "zod"

// プロジェクト作成フォーム用スキーマ
// .transform()でトリム後、.pipe()で再度バリデーションを行い、空白のみの入力を拒否する
export const createProjectSchema = z.object({
  name: z
    .string()
    .transform((v) => v.trim())
    .pipe(
      z
        .string()
        .min(1, "プロジェクト名を入力してください")
        .max(100, "プロジェクト名は100文字以内で入力してください")
    ),
  description: z
    .string()
    .transform((v) => v.trim())
    .pipe(z.string().max(500, "概要は500文字以内で入力してください")),
  isPublicEditable: z.boolean(),
  tags: z
    .array(
      z
        .string()
        .transform((v) => v.trim())
        .pipe(
          z
            .string()
            .min(1, "タグ名を入力してください")
            .max(20, "タグ名は20文字以内で入力してください")
        )
    )
    .max(5, "タグは最大5個まで設定できます"),
})

export type CreateProjectFormData = z.infer<typeof createProjectSchema>

// プロジェクト更新フォーム用スキーマ
export const updateProjectSchema = z.object({
  name: z
    .string()
    .transform((v) => v.trim())
    .pipe(
      z
        .string()
        .min(1, "プロジェクト名を入力してください")
        .max(100, "プロジェクト名は100文字以内で入力してください")
    ),
  description: z
    .string()
    .transform((v) => v.trim())
    .pipe(z.string().max(500, "概要は500文字以内で入力してください")),
  isPublicEditable: z.boolean(),
  tags: z
    .array(
      z
        .string()
        .transform((v) => v.trim())
        .pipe(
          z
            .string()
            .min(1, "タグ名を入力してください")
            .max(20, "タグ名は20文字以内で入力してください")
        )
    )
    .max(5, "タグは最大5個まで設定できます"),
})

export type UpdateProjectFormData = z.infer<typeof updateProjectSchema>
