import { describe, it, expect } from "vitest"
import { updateProfileSchema, onboardingSchema } from "./profile"

describe("updateProfileSchema", () => {
  describe("正常系", () => {
    it("有効なデータがパースされる", () => {
      const validData = {
        displayName: "テストユーザー",
        bio: "自己紹介テキスト",
        xAccount: "test_user",
        birthday: "2000-01-01",
      }

      const result = updateProfileSchema.safeParse(validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.displayName).toBe("テストユーザー")
        expect(result.data.bio).toBe("自己紹介テキスト")
        expect(result.data.xAccount).toBe("test_user")
        expect(result.data.birthday).toBe("2000-01-01")
      }
    })

    it("空のbioとxAccountでもパースされる", () => {
      const data = {
        displayName: "ユーザー名",
        bio: "",
        xAccount: "",
        birthday: "",
      }

      const result = updateProfileSchema.safeParse(data)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.bio).toBe("")
        expect(result.data.xAccount).toBe("")
        expect(result.data.birthday).toBe("")
      }
    })

    it("xAccountの@が自動除去される", () => {
      const data = {
        displayName: "ユーザー名",
        bio: "",
        xAccount: "@test_user",
        birthday: "",
      }

      const result = updateProfileSchema.safeParse(data)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.xAccount).toBe("test_user")
      }
    })

    it("前後の空白がトリムされる", () => {
      const data = {
        displayName: "  ユーザー名  ",
        bio: "  自己紹介  ",
        xAccount: "  test_user  ",
        birthday: "",
      }

      const result = updateProfileSchema.safeParse(data)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.displayName).toBe("ユーザー名")
        expect(result.data.bio).toBe("自己紹介")
        expect(result.data.xAccount).toBe("test_user")
      }
    })

    it("birthdayが空文字列でもパースされる", () => {
      const data = {
        displayName: "ユーザー名",
        bio: "",
        xAccount: "",
        birthday: "",
      }

      const result = updateProfileSchema.safeParse(data)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.birthday).toBe("")
      }
    })
  })

  describe("異常系", () => {
    it("表示名が空の場合エラー", () => {
      const data = {
        displayName: "",
        bio: "",
        xAccount: "",
        birthday: "",
      }

      const result = updateProfileSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "表示名を入力してください"
        )
      }
    })

    it("表示名が空白のみの場合エラー", () => {
      const data = {
        displayName: "   ",
        bio: "",
        xAccount: "",
        birthday: "",
      }

      const result = updateProfileSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "表示名を入力してください"
        )
      }
    })

    it("表示名が50文字を超える場合エラー", () => {
      const data = {
        displayName: "あ".repeat(51),
        bio: "",
        xAccount: "",
        birthday: "",
      }

      const result = updateProfileSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "表示名は50文字以内で入力してください"
        )
      }
    })

    it("自己紹介が200文字を超える場合エラー", () => {
      const data = {
        displayName: "ユーザー名",
        bio: "あ".repeat(201),
        xAccount: "",
        birthday: "",
      }

      const result = updateProfileSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "自己紹介は200文字以内で入力してください"
        )
      }
    })

    it("Xアカウント名が15文字を超える場合エラー", () => {
      const data = {
        displayName: "ユーザー名",
        bio: "",
        xAccount: "a".repeat(16),
        birthday: "",
      }

      const result = updateProfileSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Xアカウント名は15文字以内で入力してください"
        )
      }
    })

    it("Xアカウント名に不正な文字が含まれる場合エラー", () => {
      const data = {
        displayName: "ユーザー名",
        bio: "",
        xAccount: "test-user!",
        birthday: "",
      }

      const result = updateProfileSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "Xアカウント名は英数字とアンダースコアのみ使用できます"
        )
      }
    })
  })
})

describe("onboardingSchema", () => {
  describe("正常系", () => {
    it("有効な表示名がパースされる", () => {
      const data = { displayName: "テストユーザー" }

      const result = onboardingSchema.safeParse(data)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.displayName).toBe("テストユーザー")
      }
    })

    it("前後の空白がトリムされる", () => {
      const data = { displayName: "  ユーザー名  " }

      const result = onboardingSchema.safeParse(data)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.displayName).toBe("ユーザー名")
      }
    })
  })

  describe("異常系", () => {
    it("表示名が空の場合エラー", () => {
      const data = { displayName: "" }

      const result = onboardingSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "表示名を入力してください"
        )
      }
    })

    it("表示名が50文字を超える場合エラー", () => {
      const data = { displayName: "あ".repeat(51) }

      const result = onboardingSchema.safeParse(data)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "表示名は50文字以内で入力してください"
        )
      }
    })
  })
})
