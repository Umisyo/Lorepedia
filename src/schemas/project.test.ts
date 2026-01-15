import { describe, it, expect } from "vitest"
import { createProjectSchema } from "./project"

describe("createProjectSchema", () => {
  describe("正常系", () => {
    it("有効なデータがパースされる", () => {
      const validData = {
        name: "テストプロジェクト",
        description: "これはテスト用のプロジェクトです",
        isPublicEditable: true,
        tags: ["ファンタジー", "冒険"],
      }

      const result = createProjectSchema.safeParse(validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe("テストプロジェクト")
        expect(result.data.description).toBe("これはテスト用のプロジェクトです")
        expect(result.data.isPublicEditable).toBe(true)
        expect(result.data.tags).toEqual(["ファンタジー", "冒険"])
      }
    })

    it("空の説明でもパースされる", () => {
      const data = {
        name: "プロジェクト名",
        description: "",
        isPublicEditable: false,
        tags: [],
      }

      const result = createProjectSchema.safeParse(data)

      expect(result.success).toBe(true)
    })

    it("空のタグ配列でもパースされる", () => {
      const data = {
        name: "プロジェクト名",
        description: "説明",
        isPublicEditable: false,
        tags: [],
      }

      const result = createProjectSchema.safeParse(data)

      expect(result.success).toBe(true)
    })

    it("タグが5個まで許容される", () => {
      const data = {
        name: "プロジェクト名",
        description: "",
        isPublicEditable: false,
        tags: ["タグ1", "タグ2", "タグ3", "タグ4", "タグ5"],
      }

      const result = createProjectSchema.safeParse(data)

      expect(result.success).toBe(true)
    })

    it("名前と説明の前後の空白がトリムされる", () => {
      const data = {
        name: "  プロジェクト名  ",
        description: "  説明テキスト  ",
        isPublicEditable: false,
        tags: ["  タグ  "],
      }

      const result = createProjectSchema.safeParse(data)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe("プロジェクト名")
        expect(result.data.description).toBe("説明テキスト")
        expect(result.data.tags).toEqual(["タグ"])
      }
    })
  })

  describe("異常系", () => {
    it("名前が空の場合エラー", () => {
      const data = {
        name: "",
        description: "",
        isPublicEditable: false,
        tags: [],
      }

      const result = createProjectSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "プロジェクト名を入力してください"
        )
      }
    })

    it("名前が空白のみの場合エラー（トリム後にバリデーション）", () => {
      const data = {
        name: "   ",
        description: "",
        isPublicEditable: false,
        tags: [],
      }

      const result = createProjectSchema.safeParse(data)

      // preprocessでトリムしてからmin(1)をチェックするため、エラーになる
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "プロジェクト名を入力してください"
        )
      }
    })

    it("名前が100文字を超える場合エラー", () => {
      const data = {
        name: "あ".repeat(101),
        description: "",
        isPublicEditable: false,
        tags: [],
      }

      const result = createProjectSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "プロジェクト名は100文字以内で入力してください"
        )
      }
    })

    it("説明が500文字を超える場合エラー", () => {
      const data = {
        name: "プロジェクト名",
        description: "あ".repeat(501),
        isPublicEditable: false,
        tags: [],
      }

      const result = createProjectSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "概要は500文字以内で入力してください"
        )
      }
    })

    it("タグが6個以上の場合エラー", () => {
      const data = {
        name: "プロジェクト名",
        description: "",
        isPublicEditable: false,
        tags: ["1", "2", "3", "4", "5", "6"],
      }

      const result = createProjectSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "タグは最大5個まで設定できます"
        )
      }
    })

    it("タグ名が20文字を超える場合エラー", () => {
      const data = {
        name: "プロジェクト名",
        description: "",
        isPublicEditable: false,
        tags: ["あ".repeat(21)],
      }

      const result = createProjectSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "タグ名は20文字以内で入力してください"
        )
      }
    })

    it("空のタグ名の場合エラー", () => {
      const data = {
        name: "プロジェクト名",
        description: "",
        isPublicEditable: false,
        tags: [""],
      }

      const result = createProjectSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("タグ名を入力してください")
      }
    })

    it("isPublicEditableが未定義の場合エラー", () => {
      const data = {
        name: "プロジェクト名",
        description: "",
        tags: [],
      }

      const result = createProjectSchema.safeParse(data)

      expect(result.success).toBe(false)
    })
  })
})
