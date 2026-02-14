import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"

// Server Actionをモック
vi.mock("@/app/actions/loreCard", () => ({
  searchCardsForMention: vi.fn(),
}))

import { searchCardsForMention } from "@/app/actions/loreCard"
import { useCardSearch } from "./useCardSearch"

const mockSearchCardsForMention = vi.mocked(searchCardsForMention)

const mockCards = [
  { id: "1", title: "勇者の剣" },
  { id: "2", title: "魔法の杖" },
  { id: "3", title: "勇者の盾" },
]

describe("useCardSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchCardsForMention.mockResolvedValue({
      success: true,
      data: mockCards,
    })
  })

  it("マウント時に全カードをフェッチする", async () => {
    const { result } = renderHook(() =>
      useCardSearch({ projectId: "project-1" })
    )

    // 初期状態はisLoaded: false
    expect(result.current.isLoaded).toBe(false)

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    expect(mockSearchCardsForMention).toHaveBeenCalledWith("project-1")
    expect(mockSearchCardsForMention).toHaveBeenCalledTimes(1)
  })

  it("filterCardsが空クエリで全件返す", async () => {
    const { result } = renderHook(() =>
      useCardSearch({ projectId: "project-1" })
    )

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    const allResults = result.current.filterCards("")
    expect(allResults).toHaveLength(3)
    expect(allResults).toEqual(mockCards)
  })

  it("filterCardsがクエリで部分一致フィルタする（大文字小文字非区別）", async () => {
    const { result } = renderHook(() =>
      useCardSearch({ projectId: "project-1" })
    )

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    // 「勇者」で絞り込み
    const filtered = result.current.filterCards("勇者")
    expect(filtered).toHaveLength(2)
    expect(filtered.map((c) => c.title)).toEqual(["勇者の剣", "勇者の盾"])

    // 「魔法」で絞り込み
    const filtered2 = result.current.filterCards("魔法")
    expect(filtered2).toHaveLength(1)
    expect(filtered2[0].title).toBe("魔法の杖")
  })

  it("projectId未指定時はフェッチしない", async () => {
    const { result } = renderHook(() => useCardSearch({ projectId: "" }))

    // フェッチされない
    expect(mockSearchCardsForMention).not.toHaveBeenCalled()
    expect(result.current.isLoaded).toBe(false)

    // filterCardsは空配列を返す
    const allResults = result.current.filterCards("")
    expect(allResults).toHaveLength(0)
  })

  it("projectId変更時にキャッシュがクリアされ再フェッチされる", async () => {
    const newCards = [{ id: "4", title: "新しいカード" }]

    const { result, rerender } = renderHook(
      ({ projectId }) => useCardSearch({ projectId }),
      { initialProps: { projectId: "project-1" } }
    )

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    expect(result.current.filterCards("")).toHaveLength(3)

    // projectId変更時に新しいデータを返す
    mockSearchCardsForMention.mockResolvedValue({
      success: true,
      data: newCards,
    })

    rerender({ projectId: "project-2" })

    // キャッシュがクリアされ、isLoadedがfalseにリセットされる
    expect(result.current.isLoaded).toBe(false)
    expect(result.current.filterCards("")).toHaveLength(0)

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    expect(result.current.filterCards("")).toEqual(newCards)
    expect(mockSearchCardsForMention).toHaveBeenCalledWith("project-2")
  })

  it("フェッチが失敗してもisLoadedがtrueになる", async () => {
    mockSearchCardsForMention.mockResolvedValue({
      success: false,
      error: "エラーが発生しました",
    })

    const { result } = renderHook(() =>
      useCardSearch({ projectId: "project-1" })
    )

    await waitFor(() => {
      expect(result.current.isLoaded).toBe(true)
    })

    // データは空のまま
    const allResults = result.current.filterCards("")
    expect(allResults).toHaveLength(0)
  })
})
