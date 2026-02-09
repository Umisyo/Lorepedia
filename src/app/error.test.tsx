import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ErrorPage from "./error"

describe("ErrorPage", () => {
  const defaultProps = {
    error: new Error("テストエラー"),
    reset: vi.fn(),
  }

  it("エラーメッセージが表示される", () => {
    render(<ErrorPage {...defaultProps} />)
    expect(screen.getByRole("heading")).toHaveTextContent(
      "エラーが発生しました"
    )
  })

  it("「もう一度試す」ボタンをクリックするとreset関数が呼ばれる", async () => {
    const reset = vi.fn()
    render(<ErrorPage error={new Error("テスト")} reset={reset} />)

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: "もう一度試す" }))

    expect(reset).toHaveBeenCalledOnce()
  })

  it("ホームへのリンクが表示される", () => {
    render(<ErrorPage {...defaultProps} />)
    const homeLink = screen.getByRole("link", { name: "ホームへ戻る" })
    expect(homeLink).toHaveAttribute("href", "/")
  })
})
