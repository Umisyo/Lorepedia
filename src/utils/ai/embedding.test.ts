import { describe, it, expect, vi, beforeEach } from "vitest"

const mockCreate = vi.fn()

vi.mock("openai", () => {
  return {
    default: class MockOpenAI {
      embeddings = { create: mockCreate }
    },
  }
})

describe("embedding", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
    mockCreate.mockReset()
  })

  describe("isEmbeddingAvailable", () => {
    it("OPENAI_API_KEYが設定されている場合trueを返す", async () => {
      vi.stubEnv("OPENAI_API_KEY", "test-key")
      const { isEmbeddingAvailable } = await import("./embedding")
      expect(isEmbeddingAvailable()).toBe(true)
    })

    it("OPENAI_API_KEYが未設定の場合falseを返す", async () => {
      vi.stubEnv("OPENAI_API_KEY", "")
      const { isEmbeddingAvailable } = await import("./embedding")
      expect(isEmbeddingAvailable()).toBe(false)
    })
  })

  describe("generateEmbedding", () => {
    it("APIキーが未設定の場合AINotConfiguredErrorをthrowする", async () => {
      vi.stubEnv("OPENAI_API_KEY", "")
      const { generateEmbedding } = await import("./embedding")
      const { AINotConfiguredError } = await import("./errors")

      await expect(generateEmbedding("test")).rejects.toThrow(
        AINotConfiguredError
      )
    })

    it("APIキーが設定されている場合Embeddingベクトルを返す", async () => {
      vi.stubEnv("OPENAI_API_KEY", "test-key")

      const mockEmbedding = new Array(1536).fill(0.1)
      mockCreate.mockResolvedValueOnce({
        data: [{ embedding: mockEmbedding }],
      })

      const { generateEmbedding } = await import("./embedding")
      const result = await generateEmbedding("テストテキスト")
      expect(result).toHaveLength(1536)
    })
  })
})
