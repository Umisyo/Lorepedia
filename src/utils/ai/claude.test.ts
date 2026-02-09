import { describe, it, expect, vi, beforeEach } from "vitest"

const mockCreate = vi.fn()

// モジュールモック（トップレベル）
vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class MockAnthropic {
      messages = { create: mockCreate }
    },
  }
})

describe("claude", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
    mockCreate.mockReset()
  })

  describe("isAIAvailable", () => {
    it("ANTHROPIC_API_KEYが設定されている場合trueを返す", async () => {
      vi.stubEnv("ANTHROPIC_API_KEY", "test-key")
      const { isAIAvailable } = await import("./claude")
      expect(isAIAvailable()).toBe(true)
    })

    it("ANTHROPIC_API_KEYが未設定の場合falseを返す", async () => {
      vi.stubEnv("ANTHROPIC_API_KEY", "")
      const { isAIAvailable } = await import("./claude")
      expect(isAIAvailable()).toBe(false)
    })
  })

  describe("generateText", () => {
    it("APIキーが未設定の場合AINotConfiguredErrorをthrowする", async () => {
      vi.stubEnv("ANTHROPIC_API_KEY", "")
      const { generateText } = await import("./claude")
      const { AINotConfiguredError } = await import("./errors")

      await expect(generateText("test")).rejects.toThrow(AINotConfiguredError)
    })

    it("APIキーが設定されている場合テキストを返す", async () => {
      vi.stubEnv("ANTHROPIC_API_KEY", "test-key")

      mockCreate.mockResolvedValueOnce({
        content: [{ type: "text", text: "生成されたテキスト" }],
      })

      const { generateText } = await import("./claude")
      const result = await generateText("テストプロンプト")
      expect(result).toBe("生成されたテキスト")
    })
  })
})
