import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { CardFilterBar } from "./CardFilterBar"
import type { Tag } from "@/types/loreCard"

// useCardFilterフックのモック
const mockSetFilters = vi.fn()

vi.mock("@/hooks/useCardFilter", () => ({
  useCardFilter: () => ({
    filters: {
      search: "",
      tags: [],
      authors: [],
      dateFrom: "",
      dateTo: "",
      sortBy: "updated_at",
      sortOrder: "desc",
      viewMode: "grid",
      page: 1,
    },
    setFilters: mockSetFilters,
    isPending: false,
  }),
}))

// テスト用データ
const mockTags: Tag[] = [
  {
    id: "tag-1",
    project_id: "project-1",
    name: "キャラクター",
    color: "#ff0000",
    created_at: "2026-01-15T00:00:00Z",
    created_by: null,
    description: null,
  },
  {
    id: "tag-2",
    project_id: "project-1",
    name: "設定",
    color: "#00ff00",
    created_at: "2026-01-15T00:00:00Z",
    created_by: null,
    description: null,
  },
]

describe("CardFilterBar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("フィルタバーがレンダリングされる", () => {
    render(<CardFilterBar tags={mockTags} />)

    // 検索入力が存在する
    expect(screen.getByPlaceholderText("カードを検索...")).toBeInTheDocument()

    // combobox(タグフィルタ + ソートセレクト)が存在する
    const comboboxes = screen.getAllByRole("combobox")
    expect(comboboxes.length).toBe(2)

    // ビュー切り替えボタンが存在する
    expect(screen.getByRole("tablist")).toBeInTheDocument()
  })

  it("Enterキー押下で検索が実行される", () => {
    render(<CardFilterBar tags={mockTags} />)

    const searchInput = screen.getByPlaceholderText("カードを検索...")
    fireEvent.change(searchInput, { target: { value: "テスト検索" } })

    // Enterキーを押す
    fireEvent.keyDown(searchInput, { key: "Enter" })

    expect(mockSetFilters).toHaveBeenCalledWith({ search: "テスト検索" })
  })

  it("IME変換中はEnterキーで検索が実行されない", () => {
    render(<CardFilterBar tags={mockTags} />)

    const searchInput = screen.getByPlaceholderText("カードを検索...")
    fireEvent.change(searchInput, { target: { value: "テスト" } })

    // IME変換開始
    fireEvent.compositionStart(searchInput)

    // Enterキーを押す（変換確定を意図）
    fireEvent.keyDown(searchInput, { key: "Enter" })

    // IME変換中なので検索は実行されない
    expect(mockSetFilters).not.toHaveBeenCalled()

    // IME変換終了
    fireEvent.compositionEnd(searchInput)

    // 変換終了後にEnterキーを押す
    fireEvent.keyDown(searchInput, { key: "Enter" })

    // 今度は検索が実行される
    expect(mockSetFilters).toHaveBeenCalledWith({ search: "テスト" })
  })

  it("検索ボタンクリックで検索が実行される", () => {
    render(<CardFilterBar tags={mockTags} />)

    const searchInput = screen.getByPlaceholderText("カードを検索...")
    fireEvent.change(searchInput, { target: { value: "ボタン検索" } })

    // 検索ボタンをクリック
    const searchButton = screen.getByRole("button", { name: "検索" })
    fireEvent.click(searchButton)

    expect(mockSetFilters).toHaveBeenCalledWith({ search: "ボタン検索" })
  })

  it("検索入力の変更だけでは検索が実行されない", () => {
    render(<CardFilterBar tags={mockTags} />)

    const searchInput = screen.getByPlaceholderText("カードを検索...")
    fireEvent.change(searchInput, { target: { value: "入力のみ" } })

    // 入力だけでは検索は実行されない
    expect(mockSetFilters).not.toHaveBeenCalled()
  })

  it("ソート順トグルボタンをクリックするとsetFiltersが呼ばれる", () => {
    render(<CardFilterBar tags={mockTags} />)

    // ソート順トグルボタンをクリック（title属性で特定）
    const sortToggleButton = screen.getByTitle("降順")
    fireEvent.click(sortToggleButton)

    expect(mockSetFilters).toHaveBeenCalledWith({ sortOrder: "asc" })
  })

  it("グリッド表示とリスト表示のタブが存在する", () => {
    render(<CardFilterBar tags={mockTags} />)

    // グリッド表示とリスト表示のタブが存在する
    expect(screen.getByRole("tab", { name: "グリッド表示" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "リスト表示" })).toBeInTheDocument()
  })

  it("タグがない場合でもエラーなくレンダリングされる", () => {
    render(<CardFilterBar tags={[]} />)

    expect(screen.getByPlaceholderText("カードを検索...")).toBeInTheDocument()
  })
})
