import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { Pagination } from "./Pagination"

// useCardFilterフックのモック
const mockSetFilters = vi.fn()

vi.mock("@/hooks/useCardFilter", () => ({
  useCardFilter: () => ({
    setFilters: mockSetFilters,
    isPending: false,
  }),
}))

describe("Pagination", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("件数表示が正しくレンダリングされる", () => {
    render(<Pagination currentPage={1} totalPages={5} total={50} pageSize={12} />)

    expect(screen.getByText(/全 50 件中/)).toBeInTheDocument()
    expect(screen.getByText(/1 - 12 件を表示/)).toBeInTheDocument()
  })

  it("最後のページで件数表示が正しい", () => {
    render(<Pagination currentPage={5} totalPages={5} total={50} pageSize={12} />)

    // 49件目から50件目を表示
    expect(screen.getByText(/49 - 50 件を表示/)).toBeInTheDocument()
  })

  it("前へボタンが最初のページで無効化される", () => {
    render(<Pagination currentPage={1} totalPages={5} total={50} pageSize={12} />)

    const prevButton = screen.getByRole("button", { name: "前のページ" })
    expect(prevButton).toBeDisabled()
  })

  it("次へボタンが最後のページで無効化される", () => {
    render(<Pagination currentPage={5} totalPages={5} total={50} pageSize={12} />)

    const nextButton = screen.getByRole("button", { name: "次のページ" })
    expect(nextButton).toBeDisabled()
  })

  it("前へボタンをクリックするとsetFiltersが呼ばれる", () => {
    render(<Pagination currentPage={3} totalPages={5} total={50} pageSize={12} />)

    const prevButton = screen.getByRole("button", { name: "前のページ" })
    fireEvent.click(prevButton)

    expect(mockSetFilters).toHaveBeenCalledWith({ page: 2 })
  })

  it("次へボタンをクリックするとsetFiltersが呼ばれる", () => {
    render(<Pagination currentPage={3} totalPages={5} total={50} pageSize={12} />)

    const nextButton = screen.getByRole("button", { name: "次のページ" })
    fireEvent.click(nextButton)

    expect(mockSetFilters).toHaveBeenCalledWith({ page: 4 })
  })

  it("ページ番号をクリックするとsetFiltersが呼ばれる", () => {
    render(<Pagination currentPage={1} totalPages={5} total={50} pageSize={12} />)

    // ページ番号2をクリック
    const page2Button = screen.getByRole("button", { name: "2" })
    fireEvent.click(page2Button)

    expect(mockSetFilters).toHaveBeenCalledWith({ page: 2 })
  })

  it("現在のページがハイライトされる", () => {
    render(<Pagination currentPage={3} totalPages={5} total={50} pageSize={12} />)

    // 現在のページ3のボタンを取得
    const buttons = screen.getAllByRole("button")
    const page3Button = buttons.find((btn) => btn.textContent === "3")

    // defaultバリアントが適用されているはず（class名で確認）
    expect(page3Button).toHaveClass("bg-primary")
  })

  it("ページ数が少ない場合は省略記号が表示されない", () => {
    render(<Pagination currentPage={1} totalPages={3} total={30} pageSize={12} />)

    // 省略記号のアイコンが存在しないことを確認
    const ellipsisButtons = screen.queryAllByRole("button", { name: "" })
    const disabledEllipsis = ellipsisButtons.filter(
      (btn) => btn.hasAttribute("disabled") && btn.querySelector("svg")
    )
    expect(disabledEllipsis.length).toBe(0)
  })

  it("ページ数が多い場合は省略記号が表示される", () => {
    render(<Pagination currentPage={5} totalPages={10} total={100} pageSize={12} />)

    // 省略記号を示す無効化されたボタンが存在する
    const buttons = screen.getAllByRole("button")
    const disabledButtons = buttons.filter(
      (btn) => btn.hasAttribute("disabled") && btn.classList.contains("cursor-default")
    )
    expect(disabledButtons.length).toBeGreaterThan(0)
  })
})
