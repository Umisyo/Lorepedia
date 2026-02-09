import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ErrorPage from "./error"

describe("ErrorPage", () => {
  const mockReset = vi.fn()
  const mockError = new Error("テストエラー")

  it("エラーメッセージが表示される", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />)
    expect(screen.getByText("エラーが発生しました")).toBeInTheDocument()
  })

  it("「もう一度試す」ボタンがreset関数を呼ぶ", async () => {
    const user = userEvent.setup()
    render(<ErrorPage error={mockError} reset={mockReset} />)
    await user.click(screen.getByRole("button", { name: "もう一度試す" }))
    expect(mockReset).toHaveBeenCalledTimes(1)
  })

  it("ホームへのリンクが表示される", () => {
    render(<ErrorPage error={mockError} reset={mockReset} />)
    const link = screen.getByRole("link", { name: "ホームへ戻る" })
    expect(link).toHaveAttribute("href", "/")
  })
})
