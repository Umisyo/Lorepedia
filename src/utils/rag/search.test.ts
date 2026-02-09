import { describe, it, expect, vi, beforeEach } from "vitest"

// embedding モジュールのモック
const mockGenerateEmbedding = vi.fn()
const mockIsEmbeddingAvailable = vi.fn()

vi.mock("@/utils/ai/embedding", () => ({
  generateEmbedding: (...args: unknown[]) => mockGenerateEmbedding(...args),
  isEmbeddingAvailable: () => mockIsEmbeddingAvailable(),
}))

// Supabase クライアントのモック
const mockRpc = vi.fn()

vi.mock("@/utils/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({
    rpc: (...args: unknown[]) => mockRpc(...args),
  }),
}))

describe("search", () => {
  beforeEach(() => {
    vi.resetModules()
    mockGenerateEmbedding.mockReset()
    mockIsEmbeddingAvailable.mockReset()
    mockRpc.mockReset()
  })

  describe("searchSimilar", () => {
    it("Embedding APIが未設定の場合は空配列を返す", async () => {
      mockIsEmbeddingAvailable.mockReturnValue(false)

      const { searchSimilar } = await import("./search")
      const result = await searchSimilar("テストクエリ", "project-id")
      expect(result).toEqual([])
      expect(mockGenerateEmbedding).not.toHaveBeenCalled()
    })

    it("正常系: 類似カードを返す", async () => {
      mockIsEmbeddingAvailable.mockReturnValue(true)
      const mockEmbedding = new Array(1536).fill(0.1)
      mockGenerateEmbedding.mockResolvedValue(mockEmbedding)

      mockRpc.mockResolvedValue({
        data: [
          {
            id: "card-1",
            title: "テストカード1",
            content: "テスト内容1",
            similarity: 0.85,
          },
          {
            id: "card-2",
            title: "テストカード2",
            content: "テスト内容2",
            similarity: 0.75,
          },
        ],
        error: null,
      })

      const { searchSimilar } = await import("./search")
      const result = await searchSimilar("テストクエリ", "project-id")

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual({
        id: "card-1",
        title: "テストカード1",
        content: "テスト内容1",
        similarity: 0.85,
      })
      expect(mockGenerateEmbedding).toHaveBeenCalledWith("テストクエリ")
      expect(mockRpc).toHaveBeenCalledWith("match_lore_cards", {
        query_embedding: JSON.stringify(mockEmbedding),
        match_threshold: 0.7,
        match_count: 10,
        filter_project_id: "project-id",
      })
    })

    it("limitパラメータが正しく渡される", async () => {
      mockIsEmbeddingAvailable.mockReturnValue(true)
      mockGenerateEmbedding.mockResolvedValue(new Array(1536).fill(0.1))
      mockRpc.mockResolvedValue({ data: [], error: null })

      const { searchSimilar } = await import("./search")
      await searchSimilar("テスト", "project-id", 5)

      expect(mockRpc).toHaveBeenCalledWith(
        "match_lore_cards",
        expect.objectContaining({ match_count: 5 })
      )
    })

    it("RPC呼び出しでエラーが発生した場合は空配列を返す", async () => {
      mockIsEmbeddingAvailable.mockReturnValue(true)
      mockGenerateEmbedding.mockResolvedValue(new Array(1536).fill(0.1))
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: "Function not found" },
      })

      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {})

      const { searchSimilar } = await import("./search")
      const result = await searchSimilar("テスト", "project-id")
      expect(result).toEqual([])
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Vector search failed:",
        expect.objectContaining({ message: "Function not found" })
      )

      consoleErrorSpy.mockRestore()
    })

    it("contentがnullの場合は空文字列に変換される", async () => {
      mockIsEmbeddingAvailable.mockReturnValue(true)
      mockGenerateEmbedding.mockResolvedValue(new Array(1536).fill(0.1))
      mockRpc.mockResolvedValue({
        data: [
          {
            id: "card-1",
            title: "タイトル",
            content: null,
            similarity: 0.9,
          },
        ],
        error: null,
      })

      const { searchSimilar } = await import("./search")
      const result = await searchSimilar("テスト", "project-id")

      expect(result[0].content).toBe("")
    })

    it("不正な形式のデータはフィルタされる", async () => {
      mockIsEmbeddingAvailable.mockReturnValue(true)
      mockGenerateEmbedding.mockResolvedValue(new Array(1536).fill(0.1))
      mockRpc.mockResolvedValue({
        data: [
          {
            id: "card-1",
            title: "有効なカード",
            content: "内容",
            similarity: 0.85,
          },
          { id: 123, title: "不正なID" },
          null,
        ],
        error: null,
      })

      const { searchSimilar } = await import("./search")
      const result = await searchSimilar("テスト", "project-id")

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe("card-1")
    })
  })
})
