import { z } from "zod"

// 手動設定可能な参照タイプ（mentionsはエディタの@mentionで自動作成されるため除外）
export const manualReferenceTypes = [
  "depends_on",
  "derives_from",
  "contradicts",
  "related",
] as const

export type ManualReferenceType = (typeof manualReferenceTypes)[number]

// カード参照作成スキーマ
export const createCardReferenceSchema = z
  .object({
    sourceCardId: z.string().uuid("無効なカードIDです"),
    targetCardId: z.string().uuid("無効なカードIDです"),
    referenceType: z.enum(manualReferenceTypes, {
      error: "参照タイプを選択してください",
    }),
  })
  .refine((data) => data.sourceCardId !== data.targetCardId, {
    message: "自分自身への参照は作成できません",
    path: ["targetCardId"],
  })

export type CreateCardReferenceInput = z.infer<typeof createCardReferenceSchema>
