import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { LoreCardList } from "./LoreCardList"
import type { LoreCardWithTags } from "@/types/loreCard"

// モックデータ
const mockCards: LoreCardWithTags[] = [
  {
    id: "card-1",
    project_id: "project-1",
    title: "テストカード1",
    content: "テスト内容1",
    author_id: "author-1",
    created_at: "2026-01-15T00:00:00Z",
    updated_at: "2026-01-15T00:00:00Z",
    tags: [],
  },
  {
    id: "card-2",
    project_id: "project-1",
    title: "テストカード2",
    content: "テスト内容2",
    author_id: "author-1",
    created_at: "2026-01-15T00:00:00Z",
    updated_at: "2026-01-15T00:00:00Z",
    tags: [
      {
        id: "tag-1",
        project_id: "project-1",
        name: "タグ1",
        color: "#ff0000",
        created_at: "2026-01-15T00:00:00Z",
      },
    ],
  },
]

describe("LoreCardList", () => {
  const projectId = "test-project-id"

  describe("空の場合", () => {
    it("EmptyStateが表示される", () => {
      render(<LoreCardList cards={[]} projectId={projectId} />)
      expect(screen.getByText("カードがありません")).toBeInTheDocument()
    })
  })

  describe("カードがある場合", () => {
    it("カードのタイトルが表示される", () => {
      render(<LoreCardList cards={mockCards} projectId={projectId} />)
      expect(screen.getByText("テストカード1")).toBeInTheDocument()
      expect(screen.getByText("テストカード2")).toBeInTheDocument()
    })

    it("カードの数だけアイテムが表示される", () => {
      render(<LoreCardList cards={mockCards} projectId={projectId} />)
      const links = screen.getAllByRole("link")
      expect(links.length).toBe(2)
    })

    it("タグが表示される", () => {
      render(<LoreCardList cards={mockCards} projectId={projectId} />)
      expect(screen.getByText("タグ1")).toBeInTheDocument()
    })
  })
})
