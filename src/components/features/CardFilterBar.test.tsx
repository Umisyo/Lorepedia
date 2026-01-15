import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { CardFilterBar } from "./CardFilterBar"
import type { Tag } from "@/types/loreCard"
import type { CardFilterState } from "@/types/filter"

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

const mockInitialFilters: CardFilterState = {
  search: "",
  tags: [],
  authors: [],
  dateFrom: "",
  dateTo: "",
  sortBy: "updated_at",
  sortOrder: "desc",
  viewMode: "grid",
  page: 1,
}

describe("CardFilterBar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("フィルタバーがレンダリングされる", () => {
    render(<CardFilterBar tags={mockTags} initialFilters={mockInitialFilters} />)

    // 検索入力が存在する
    expect(screen.getByPlaceholderText("カードを検索...")).toBeInTheDocument()

    // combobox(タグフィルタ + ソートセレクト)が存在する
    const comboboxes = screen.getAllByRole("combobox")
    expect(comboboxes.length).toBe(2)

    // ビュー切り替えボタンが存在する
    expect(screen.getByRole("tablist")).toBeInTheDocument()
  })

  it("検索入力で値を変更するとsetFiltersが呼ばれる", () => {
    render(<CardFilterBar tags={mockTags} initialFilters={mockInitialFilters} />)

    const searchInput = screen.getByPlaceholderText("カードを検索...")
    fireEvent.change(searchInput, { target: { value: "テスト検索" } })

    expect(mockSetFilters).toHaveBeenCalledWith({ search: "テスト検索" })
  })

  it("ソート順トグルボタンをクリックするとsetFiltersが呼ばれる", () => {
    render(<CardFilterBar tags={mockTags} initialFilters={mockInitialFilters} />)

    // ソート順トグルボタンをクリック（title属性で特定）
    const sortToggleButton = screen.getByTitle("降順")
    fireEvent.click(sortToggleButton)

    expect(mockSetFilters).toHaveBeenCalledWith({ sortOrder: "asc" })
  })

  it("グリッド表示とリスト表示のタブが存在する", () => {
    render(<CardFilterBar tags={mockTags} initialFilters={mockInitialFilters} />)

    // グリッド表示とリスト表示のタブが存在する
    expect(screen.getByRole("tab", { name: "グリッド表示" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "リスト表示" })).toBeInTheDocument()
  })

  it("タグがない場合でもエラーなくレンダリングされる", () => {
    render(<CardFilterBar tags={[]} initialFilters={mockInitialFilters} />)

    expect(screen.getByPlaceholderText("カードを検索...")).toBeInTheDocument()
  })
})
