import { describe, it, expect } from "vitest"
import { getPasswordStrength, signupSchema, loginSchema } from "./auth"

describe("getPasswordStrength", () => {
  describe("弱いパスワード", () => {
    it("8文字未満のパスワードは「弱い」と判定される", () => {
      expect(getPasswordStrength("")).toBe("weak")
      expect(getPasswordStrength("1234567")).toBe("weak")
      expect(getPasswordStrength("abcdefg")).toBe("weak")
    })
  })

  describe("普通のパスワード", () => {
    it("8文字以上の英字のみは「普通」と判定される", () => {
      expect(getPasswordStrength("abcdefgh")).toBe("medium")
      expect(getPasswordStrength("ABCDEFGH")).toBe("medium")
    })

    it("8文字以上の数字のみは「普通」と判定される", () => {
      expect(getPasswordStrength("12345678")).toBe("medium")
    })

    it("8文字以上の英数字混合は「普通」と判定される", () => {
      expect(getPasswordStrength("abc12345")).toBe("medium")
      expect(getPasswordStrength("Pass1234")).toBe("medium")
    })
  })

  describe("強いパスワード", () => {
    it("8文字以上で英字・数字・記号混合は「強い」と判定される", () => {
      expect(getPasswordStrength("Pass123!")).toBe("strong")
      expect(getPasswordStrength("abc@1234")).toBe("strong")
      expect(getPasswordStrength("Test#567")).toBe("strong")
    })

    it("さまざまな記号を含むパスワード", () => {
      expect(getPasswordStrength("a1234567!")).toBe("strong")
      expect(getPasswordStrength("a1234567@")).toBe("strong")
      expect(getPasswordStrength("a1234567#")).toBe("strong")
      expect(getPasswordStrength("a1234567$")).toBe("strong")
      expect(getPasswordStrength("a1234567%")).toBe("strong")
    })
  })

  describe("境界値テスト", () => {
    it("ちょうど8文字のパスワード", () => {
      // 英字のみ8文字 → 普通
      expect(getPasswordStrength("abcdefgh")).toBe("medium")
      // 英数記号8文字 → 強い
      expect(getPasswordStrength("aB3!efgh")).toBe("strong")
    })

    it("7文字と8文字の境界", () => {
      expect(getPasswordStrength("aB3!efg")).toBe("weak") // 7文字
      expect(getPasswordStrength("aB3!efgh")).toBe("strong") // 8文字
    })
  })
})

describe("signupSchema", () => {
  describe("有効なデータ", () => {
    it("すべての条件を満たすデータは検証を通過する", () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
        agreeToTerms: true,
      }

      const result = signupSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe("メールアドレスのバリデーション", () => {
    it("空のメールアドレスはエラー", () => {
      const data = {
        email: "",
        password: "password123",
        confirmPassword: "password123",
        agreeToTerms: true,
      }

      const result = signupSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it("無効なメール形式はエラー", () => {
      const data = {
        email: "invalid-email",
        password: "password123",
        confirmPassword: "password123",
        agreeToTerms: true,
      }

      const result = signupSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe("パスワードのバリデーション", () => {
    it("空のパスワードはエラー", () => {
      const data = {
        email: "test@example.com",
        password: "",
        confirmPassword: "",
        agreeToTerms: true,
      }

      const result = signupSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it("8文字未満のパスワードはエラー", () => {
      const data = {
        email: "test@example.com",
        password: "short",
        confirmPassword: "short",
        agreeToTerms: true,
      }

      const result = signupSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it("パスワード不一致はエラー", () => {
      const data = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "different123",
        agreeToTerms: true,
      }

      const result = signupSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })

  describe("利用規約同意のバリデーション", () => {
    it("同意していない場合はエラー", () => {
      const data = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
        agreeToTerms: false,
      }

      const result = signupSchema.safeParse(data)
      expect(result.success).toBe(false)
    })
  })
})

describe("loginSchema", () => {
  describe("有効なデータ", () => {
    it("すべての条件を満たすデータは検証を通過する", () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
      }

      const result = loginSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })

  describe("メールアドレスのバリデーション", () => {
    it("空のメールアドレスはエラー", () => {
      const data = {
        email: "",
        password: "password123",
      }

      const result = loginSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("メールアドレスを入力してください")
      }
    })

    it("無効なメール形式はエラー", () => {
      const data = {
        email: "invalid-email",
        password: "password123",
      }

      const result = loginSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("有効なメールアドレスを入力してください")
      }
    })
  })

  describe("パスワードのバリデーション", () => {
    it("空のパスワードはエラー", () => {
      const data = {
        email: "test@example.com",
        password: "",
      }

      const result = loginSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("パスワードを入力してください")
      }
    })

    it("8文字未満のパスワードはエラー", () => {
      const data = {
        email: "test@example.com",
        password: "short",
      }

      const result = loginSchema.safeParse(data)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("パスワードは8文字以上で入力してください")
      }
    })

    it("境界値: 7文字はエラー、8文字は通過", () => {
      const data7 = {
        email: "test@example.com",
        password: "1234567",
      }
      const data8 = {
        email: "test@example.com",
        password: "12345678",
      }

      expect(loginSchema.safeParse(data7).success).toBe(false)
      expect(loginSchema.safeParse(data8).success).toBe(true)
    })
  })
})
