import { describe, it, expect, vi } from "vitest"
import { createCardMentionSuggestion } from "./cardMentionSuggestion"

describe("createCardMentionSuggestion", () => {
  const mockCards = [
    { id: "1", title: "勇者の剣" },
    { id: "2", title: "魔法の杖" },
    { id: "3", title: "勇者の盾" },
  ]

  function createMockOptions() {
    return {
      projectId: "test-project",
      filterCards: vi.fn().mockReturnValue(mockCards),
      isLoaded: vi.fn().mockReturnValue(true),
    }
  }

  describe("items", () => {
    it("filterCardsにクエリを渡して結果を返す", () => {
      const options = createMockOptions()
      const suggestion = createCardMentionSuggestion(options)

      const result = suggestion.items({ query: "勇者", editor: {} as never })

      expect(options.filterCards).toHaveBeenCalledWith("勇者")
      expect(result).toEqual(mockCards)
    })

    it("空クエリでもfilterCardsが呼ばれる", () => {
      const options = createMockOptions()
      const suggestion = createCardMentionSuggestion(options)

      suggestion.items({ query: "", editor: {} as never })

      expect(options.filterCards).toHaveBeenCalledWith("")
    })

    it("連続呼び出しで毎回filterCardsが呼ばれる", () => {
      const options = createMockOptions()
      const suggestion = createCardMentionSuggestion(options)

      suggestion.items({ query: "テスト", editor: {} as never })
      suggestion.items({ query: "テスト2", editor: {} as never })

      expect(options.filterCards).toHaveBeenCalledTimes(2)
      expect(options.filterCards).toHaveBeenNthCalledWith(1, "テスト")
      expect(options.filterCards).toHaveBeenNthCalledWith(2, "テスト2")
    })

    it("filterCardsの戻り値をそのまま返す", () => {
      const filteredCards = [{ id: "1", title: "勇者の剣" }]
      const options = createMockOptions()
      options.filterCards.mockReturnValue(filteredCards)
      const suggestion = createCardMentionSuggestion(options)

      const result = suggestion.items({ query: "勇者", editor: {} as never })

      expect(result).toEqual(filteredCards)
    })
  })
})
