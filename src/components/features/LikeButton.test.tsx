import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { LikeButton } from "./LikeButton"

// Server Actionをモック
vi.mock("@/app/actions/cardLike", () => ({
  toggleCardLike: vi.fn().mockResolvedValue({ success: true }),
}))

const defaultProps = {
  cardId: "card-1",
  projectId: "proj-1",
  likeCount: 5,
  isLiked: false,
  isLoggedIn: true,
}

describe("LikeButton", () => {
  it("いいね数が表示される", () => {
    render(<LikeButton {...defaultProps} />)
    expect(screen.getByText("5")).toBeInTheDocument()
  })

  it("未ログイン時はボタンが無効化される", () => {
    render(<LikeButton {...defaultProps} isLoggedIn={false} />)
    const button = screen.getByRole("button")
    expect(button).toBeDisabled()
  })

  it("ログイン時はボタンが有効", () => {
    render(<LikeButton {...defaultProps} isLoggedIn={true} />)
    const button = screen.getByRole("button")
    expect(button).not.toBeDisabled()
  })

  it("いいね済みの場合、aria-pressedがtrueになる", () => {
    render(<LikeButton {...defaultProps} isLiked={true} />)
    const button = screen.getByRole("button")
    expect(button).toHaveAttribute("aria-pressed", "true")
  })

  it("未いいねの場合、aria-pressedがfalseになる", () => {
    render(<LikeButton {...defaultProps} isLiked={false} />)
    const button = screen.getByRole("button")
    expect(button).toHaveAttribute("aria-pressed", "false")
  })

  it("aria-labelにいいね数が含まれる", () => {
    render(<LikeButton {...defaultProps} likeCount={10} />)
    const button = screen.getByRole("button")
    expect(button).toHaveAttribute("aria-label", "いいね 10件")
  })

  it("いいね済みの場合、aria-labelに「いいね済み」が含まれる", () => {
    render(<LikeButton {...defaultProps} isLiked={true} likeCount={3} />)
    const button = screen.getByRole("button")
    expect(button).toHaveAttribute(
      "aria-label",
      "いいね 3件（いいね済み）"
    )
  })

  it("未ログイン時はtitleに「ログインが必要です」と表示される", () => {
    render(<LikeButton {...defaultProps} isLoggedIn={false} />)
    const button = screen.getByRole("button")
    expect(button).toHaveAttribute("title", "ログインが必要です")
  })

  it("ログイン済みで未いいね時はtitleに「いいね」と表示される", () => {
    render(<LikeButton {...defaultProps} isLoggedIn={true} isLiked={false} />)
    const button = screen.getByRole("button")
    expect(button).toHaveAttribute("title", "いいね")
  })

  it("ログイン済みでいいね済み時はtitleに「いいねを解除」と表示される", () => {
    render(<LikeButton {...defaultProps} isLoggedIn={true} isLiked={true} />)
    const button = screen.getByRole("button")
    expect(button).toHaveAttribute("title", "いいねを解除")
  })

  it("いいね数が0の場合でも表示される", () => {
    render(<LikeButton {...defaultProps} likeCount={0} />)
    expect(screen.getByText("0")).toBeInTheDocument()
  })
})
