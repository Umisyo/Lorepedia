import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { EmptyState } from "./EmptyState"

describe("EmptyState", () => {
  it("メッセージが表示される", () => {
    render(<EmptyState />)

    expect(screen.getByText("まだプロジェクトがありません")).toBeInTheDocument()
    expect(
      screen.getByText("新しいプロジェクトを作成して、創作を始めましょう")
    ).toBeInTheDocument()
  })

  it("新規プロジェクト作成ボタンが表示される", () => {
    render(<EmptyState />)

    const button = screen.getByRole("link", { name: "新規プロジェクト" })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute("href", "/projects/new")
  })
})
