import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useCardSearch } from "./useCardSearch"

// searchCardsForMentionのモック
const mockSearchCardsForMention = vi.fn()

vi.mock("@/app/actions/loreCard", () => ({
  searchCardsForMention: (...args: unknown[]) =>
    mockSearchCardsForMention(...args),
}))

describe("useCardSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockSearchCardsForMention.mockResolvedValue({
      success: true,
      data: [{ id: "1", title: "テストカード" }],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("検索呼び出し時にisLoadingが即座にtrueになる", () => {
    const { result } = renderHook(() =>
      useCardSearch({ projectId: "test-project", debounceMs: 300 })
    )

    expect(result.current.isLoading).toBe(false)

    act(() => {
      result.current.search("テスト")
    })

    // デバウンス待ちでもisLoadingがtrueになっている
    expect(result.current.isLoading).toBe(true)
  })

  it("デバウンス後にAPIが呼ばれる", async () => {
    const { result } = renderHook(() =>
      useCardSearch({ projectId: "test-project", debounceMs: 300 })
    )

    act(() => {
      result.current.search("テスト")
    })

    // デバウンス前はAPIが呼ばれていない
    expect(mockSearchCardsForMention).not.toHaveBeenCalled()

    // デバウンス完了
    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    expect(mockSearchCardsForMention).toHaveBeenCalledWith(
      "test-project",
      "テスト"
    )
  })

  it("デバウンス中に再度searchが呼ばれると前のタイマーがキャンセルされる", async () => {
    const { result } = renderHook(() =>
      useCardSearch({ projectId: "test-project", debounceMs: 300 })
    )

    act(() => {
      result.current.search("テス")
    })

    // 200ms後に別のクエリ
    act(() => {
      vi.advanceTimersByTime(200)
    })

    act(() => {
      result.current.search("テスト")
    })

    // 最初の300msが経過しても、最初のクエリではAPIが呼ばれない
    await act(async () => {
      vi.advanceTimersByTime(100)
    })
    expect(mockSearchCardsForMention).not.toHaveBeenCalled()

    // 2回目のクエリのデバウンス完了
    await act(async () => {
      vi.advanceTimersByTime(200)
    })

    expect(mockSearchCardsForMention).toHaveBeenCalledTimes(1)
    expect(mockSearchCardsForMention).toHaveBeenCalledWith(
      "test-project",
      "テスト"
    )
  })

  it("検索成功時にsuggestionsが更新される", async () => {
    const mockData = [
      { id: "1", title: "カード1" },
      { id: "2", title: "カード2" },
    ]
    mockSearchCardsForMention.mockResolvedValue({
      success: true,
      data: mockData,
    })

    const { result } = renderHook(() =>
      useCardSearch({ projectId: "test-project", debounceMs: 300 })
    )

    act(() => {
      result.current.search("テスト")
    })

    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current.suggestions).toEqual(mockData)
    expect(result.current.isLoading).toBe(false)
  })

  it("検索失敗時にerrorが設定される", async () => {
    mockSearchCardsForMention.mockResolvedValue({
      success: false,
      error: "検索エラー",
    })

    const { result } = renderHook(() =>
      useCardSearch({ projectId: "test-project", debounceMs: 300 })
    )

    act(() => {
      result.current.search("テスト")
    })

    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current.error).toBe("検索エラー")
    expect(result.current.suggestions).toEqual([])
    expect(result.current.isLoading).toBe(false)
  })

  it("空クエリの場合は結果をクリアしAPIを呼ばない", () => {
    const { result } = renderHook(() =>
      useCardSearch({ projectId: "test-project", debounceMs: 300 })
    )

    act(() => {
      result.current.search("   ")
    })

    expect(result.current.isLoading).toBe(false)
    expect(result.current.suggestions).toEqual([])
    expect(mockSearchCardsForMention).not.toHaveBeenCalled()
  })

  it("clearで状態がリセットされる", async () => {
    const { result } = renderHook(() =>
      useCardSearch({ projectId: "test-project", debounceMs: 300 })
    )

    // 先に検索して結果を得る
    act(() => {
      result.current.search("テスト")
    })

    await act(async () => {
      vi.advanceTimersByTime(300)
    })

    expect(result.current.suggestions).toHaveLength(1)

    // クリア
    act(() => {
      result.current.clear()
    })

    expect(result.current.suggestions).toEqual([])
    expect(result.current.isLoading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("古いリクエストの結果は無視される（競合処理）", async () => {
    let resolveFirst: (value: unknown) => void
    let resolveSecond: (value: unknown) => void

    mockSearchCardsForMention
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveFirst = resolve
          })
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveSecond = resolve
          })
      )

    const { result } = renderHook(() =>
      useCardSearch({ projectId: "test-project", debounceMs: 100 })
    )

    // 1回目の検索
    act(() => {
      result.current.search("テスト1")
    })

    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    // 2回目の検索
    act(() => {
      result.current.search("テスト2")
    })

    await act(async () => {
      vi.advanceTimersByTime(100)
    })

    // 2回目が先に解決
    await act(async () => {
      resolveSecond!({
        success: true,
        data: [{ id: "2", title: "結果2" }],
      })
    })

    expect(result.current.suggestions).toEqual([{ id: "2", title: "結果2" }])

    // 1回目が後から解決（古い結果なので無視される）
    await act(async () => {
      resolveFirst!({
        success: true,
        data: [{ id: "1", title: "結果1" }],
      })
    })

    // 古い結果で上書きされていないことを確認
    expect(result.current.suggestions).toEqual([{ id: "2", title: "結果2" }])
  })
})
