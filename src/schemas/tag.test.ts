import { describe, it, expect } from "vitest"
import { createTagSchema } from "./tag"

describe("createTagSchema", () => {
  describe("正常系", () => {
    it("有効なデータがパースされる", () => {
      const validData = {
        name: "キャラクター",
      }

      const result = createTagSchema.safeParse(validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe("キャラクター")
      }
    })

    it("色付きのタグがパースされる", () => {
      const validData = {
        name: "地名",
        color: "#FF5733",
      }

      const result = createTagSchema.safeParse(validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe("地名")
        expect(result.data.color).toBe("#FF5733")
      }
    })

    it("タグ名の前後の空白がトリムされる", () => {
      const data = {
        name: "  アイテム  ",
      }

      const result = createTagSchema.safeParse(data)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.name).toBe("アイテム")
      }
    })

    it("タグ名が20文字ちょうどでパースされる", () => {
      const data = {
        name: "あ".repeat(20),
      }

      const result = createTagSchema.safeParse(data)

      expect(result.success).toBe(true)
    })

    it("色が小文字でもパースされる", () => {
      const data = {
        name: "タグ",
        color: "#ff5733",
      }

      const result = createTagSchema.safeParse(data)

      expect(result.success).toBe(true)
    })
  })

  describe("異常系", () => {
    it("タグ名が空の場合エラー", () => {
      const data = {
        name: "",
      }

      const result = createTagSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("タグ名を入力してください")
      }
    })

    it("タグ名が空白のみの場合エラー（トリム後にバリデーション）", () => {
      const data = {
        name: "   ",
      }

      const result = createTagSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("タグ名を入力してください")
      }
    })

    it("タグ名が20文字を超える場合エラー", () => {
      const data = {
        name: "あ".repeat(21),
      }

      const result = createTagSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "タグ名は20文字以内で入力してください"
        )
      }
    })

    it("色が無効な形式の場合エラー", () => {
      const data = {
        name: "タグ",
        color: "red",
      }

      const result = createTagSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("無効な色形式です")
      }
    })

    it("色が3桁の16進数の場合エラー", () => {
      const data = {
        name: "タグ",
        color: "#F00",
      }

      const result = createTagSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("無効な色形式です")
      }
    })

    it("色に#がない場合エラー", () => {
      const data = {
        name: "タグ",
        color: "FF5733",
      }

      const result = createTagSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("無効な色形式です")
      }
    })
  })
})
