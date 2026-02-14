import { describe, it, expect, vi } from "vitest"
import { createCardMentionSuggestion } from "./cardMentionSuggestion"

describe("createCardMentionSuggestion", () => {
  function createMockOptions() {
    return {
      projectId: "test-project",
      onSearch: vi.fn(),
      getSuggestions: vi.fn().mockReturnValue([]),
      isLoading: vi.fn().mockReturnValue(false),
    }
  }

  describe("items", () => {
    it("クエリが変わった場合にonSearchが呼ばれる", () => {
      const options = createMockOptions()
      const suggestion = createCardMentionSuggestion(options)

      suggestion.items({ query: "テスト", editor: {} as never })

      expect(options.onSearch).toHaveBeenCalledWith("テスト")
      expect(options.onSearch).toHaveBeenCalledTimes(1)
    })

    it("同一クエリの連続呼び出しではonSearchが重複実行されない", () => {
      const options = createMockOptions()
      const suggestion = createCardMentionSuggestion(options)

      suggestion.items({ query: "テスト", editor: {} as never })
      suggestion.items({ query: "テスト", editor: {} as never })
      suggestion.items({ query: "テスト", editor: {} as never })

      expect(options.onSearch).toHaveBeenCalledTimes(1)
    })

    it("異なるクエリの場合はonSearchが再度呼ばれる", () => {
      const options = createMockOptions()
      const suggestion = createCardMentionSuggestion(options)

      suggestion.items({ query: "テスト", editor: {} as never })
      suggestion.items({ query: "テスト2", editor: {} as never })

      expect(options.onSearch).toHaveBeenCalledTimes(2)
      expect(options.onSearch).toHaveBeenNthCalledWith(1, "テスト")
      expect(options.onSearch).toHaveBeenNthCalledWith(2, "テスト2")
    })

    it("空文字列のクエリでもonSearchが呼ばれる", () => {
      const options = createMockOptions()
      const suggestion = createCardMentionSuggestion(options)

      // 初回は空文字（lastQueryの初期値""と同じ）なのでスキップされる
      suggestion.items({ query: "", editor: {} as never })
      expect(options.onSearch).not.toHaveBeenCalled()

      // テキスト入力後に空文字に戻った場合は呼ばれる
      suggestion.items({ query: "a", editor: {} as never })
      suggestion.items({ query: "", editor: {} as never })
      expect(options.onSearch).toHaveBeenCalledTimes(2)
    })

    it("毎回getSuggestionsの結果を返す", () => {
      const mockSuggestions = [{ id: "1", title: "カード1" }]
      const options = createMockOptions()
      options.getSuggestions.mockReturnValue(mockSuggestions)
      const suggestion = createCardMentionSuggestion(options)

      const result = suggestion.items({ query: "テスト", editor: {} as never })

      expect(result).toEqual(mockSuggestions)
    })
  })
})
