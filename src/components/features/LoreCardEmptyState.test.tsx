import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { LoreCardEmptyState } from "./LoreCardEmptyState"

describe("LoreCardEmptyState", () => {
  const projectId = "test-project-id"

  describe("表示", () => {
    it("「カードがありません」というタイトルが表示される", () => {
      render(<LoreCardEmptyState projectId={projectId} />)
      expect(screen.getByText("カードがありません")).toBeInTheDocument()
    })

    it("説明文が表示される", () => {
      render(<LoreCardEmptyState projectId={projectId} />)
      expect(
        screen.getByText("世界設定を記録する最初のカードを作成しましょう")
      ).toBeInTheDocument()
    })

    it("「カードを作成」ボタンが表示される", () => {
      render(<LoreCardEmptyState projectId={projectId} />)
      expect(screen.getByText("カードを作成")).toBeInTheDocument()
    })
  })

  describe("リンク", () => {
    it("作成ボタンのリンク先が正しい", () => {
      render(<LoreCardEmptyState projectId={projectId} />)
      const link = screen.getByRole("link", { name: /カードを作成/i })
      expect(link).toHaveAttribute(
        "href",
        `/projects/${projectId}/cards/new`
      )
    })
  })
})
