import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useCardFilter } from "./useCardFilter"

// Next.js navigation hookのモック
const mockPush = vi.fn()
const mockSearchParams = new URLSearchParams()

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/projects/test-project",
}))

describe("useCardFilter", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // searchParamsをクリア
    Array.from(mockSearchParams.keys()).forEach((key) => {
      mockSearchParams.delete(key)
    })
  })

  describe("filters", () => {
    it("デフォルト値が設定される", () => {
      const { result } = renderHook(() => useCardFilter())

      expect(result.current.filters).toEqual({
        search: "",
        tags: [],
        authors: [],
        dateFrom: "",
        dateTo: "",
        sortBy: "updated_at",
        sortOrder: "desc",
        viewMode: "grid",
        page: 1,
      })
    })

    it("URLパラメータからフィルタ状態を復元する", () => {
      mockSearchParams.set("q", "検索キーワード")
      mockSearchParams.append("tag", "tag-1")
      mockSearchParams.append("tag", "tag-2")
      mockSearchParams.set("sort", "created_at")
      mockSearchParams.set("order", "asc")
      mockSearchParams.set("view", "list")
      mockSearchParams.set("page", "3")

      const { result } = renderHook(() => useCardFilter())

      expect(result.current.filters.search).toBe("検索キーワード")
      expect(result.current.filters.tags).toEqual(["tag-1", "tag-2"])
      expect(result.current.filters.sortBy).toBe("created_at")
      expect(result.current.filters.sortOrder).toBe("asc")
      expect(result.current.filters.viewMode).toBe("list")
      expect(result.current.filters.page).toBe(3)
    })

    it("無効なソート値はデフォルトにフォールバックする", () => {
      mockSearchParams.set("sort", "invalid")
      mockSearchParams.set("order", "invalid")
      mockSearchParams.set("view", "invalid")

      const { result } = renderHook(() => useCardFilter())

      expect(result.current.filters.sortBy).toBe("updated_at")
      expect(result.current.filters.sortOrder).toBe("desc")
      expect(result.current.filters.viewMode).toBe("grid")
    })

    it("無効なページ番号は1にフォールバックする", () => {
      mockSearchParams.set("page", "invalid")

      const { result } = renderHook(() => useCardFilter())

      expect(result.current.filters.page).toBe(1)
    })

    it("負のページ番号は1にフォールバックする", () => {
      mockSearchParams.set("page", "-5")

      const { result } = renderHook(() => useCardFilter())

      expect(result.current.filters.page).toBe(1)
    })
  })

  describe("setFilters", () => {
    it("検索キーワードを更新できる", () => {
      const { result } = renderHook(() => useCardFilter())

      act(() => {
        result.current.setFilters({ search: "テスト" })
      })

      expect(mockPush).toHaveBeenCalledWith("/projects/test-project?q=%E3%83%86%E3%82%B9%E3%83%88")
    })

    it("検索キーワードを空にするとパラメータが削除される", () => {
      mockSearchParams.set("q", "テスト")
      const { result } = renderHook(() => useCardFilter())

      act(() => {
        result.current.setFilters({ search: "" })
      })

      expect(mockPush).toHaveBeenCalledWith("/projects/test-project")
    })

    it("タグを更新できる", () => {
      const { result } = renderHook(() => useCardFilter())

      act(() => {
        result.current.setFilters({ tags: ["tag-1", "tag-2"] })
      })

      expect(mockPush).toHaveBeenCalledWith("/projects/test-project?tag=tag-1&tag=tag-2")
    })

    it("ソート項目を更新できる", () => {
      const { result } = renderHook(() => useCardFilter())

      act(() => {
        result.current.setFilters({ sortBy: "created_at" })
      })

      expect(mockPush).toHaveBeenCalledWith("/projects/test-project?sort=created_at")
    })

    it("デフォルト値のソート項目を設定するとパラメータが削除される", () => {
      mockSearchParams.set("sort", "created_at")
      const { result } = renderHook(() => useCardFilter())

      act(() => {
        result.current.setFilters({ sortBy: "updated_at" })
      })

      expect(mockPush).toHaveBeenCalledWith("/projects/test-project")
    })

    it("表示モードを更新できる", () => {
      const { result } = renderHook(() => useCardFilter())

      act(() => {
        result.current.setFilters({ viewMode: "list" })
      })

      expect(mockPush).toHaveBeenCalledWith("/projects/test-project?view=list")
    })

    it("ページを更新できる", () => {
      const { result } = renderHook(() => useCardFilter())

      act(() => {
        result.current.setFilters({ page: 5 })
      })

      expect(mockPush).toHaveBeenCalledWith("/projects/test-project?page=5")
    })

    it("フィルタ変更時にページがリセットされる", () => {
      mockSearchParams.set("page", "3")
      const { result } = renderHook(() => useCardFilter())

      act(() => {
        result.current.setFilters({ search: "新しい検索" })
      })

      // ページパラメータが含まれていないことを確認
      const callArg = mockPush.mock.calls[0][0] as string
      expect(callArg).not.toContain("page=")
    })

    it("ページのみの更新時はページがリセットされない", () => {
      mockSearchParams.set("q", "検索")
      const { result } = renderHook(() => useCardFilter())

      act(() => {
        result.current.setFilters({ page: 2 })
      })

      const callArg = mockPush.mock.calls[0][0] as string
      expect(callArg).toContain("page=2")
    })
  })

  describe("resetFilters", () => {
    it("フィルタをリセットできる", () => {
      mockSearchParams.set("q", "検索")
      mockSearchParams.set("sort", "created_at")
      const { result } = renderHook(() => useCardFilter())

      act(() => {
        result.current.resetFilters()
      })

      expect(mockPush).toHaveBeenCalledWith("/projects/test-project")
    })
  })
})
