import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { LoreCardDetail } from "./LoreCardDetail"
import type { LoreCardWithRelations } from "@/types/loreCard"

// MarkdownRendererをモック
vi.mock("@/components/features/MarkdownRenderer", () => ({
  MarkdownRenderer: ({
    content,
    projectId,
  }: {
    content: string
    projectId?: string
  }) => (
    <div data-testid="markdown-renderer" data-project-id={projectId}>
      {content}
    </div>
  ),
}))

const baseCard: LoreCardWithRelations = {
  id: "card-1",
  title: "テストカード",
  content: "# テスト内容\nこれはテストです。",
  project_id: "proj-1",
  author_id: "user-1",
  created_at: "2025-01-15T10:00:00Z",
  updated_at: "2025-01-16T15:30:00Z",
  tags: [
    {
      id: "tag-1",
      name: "種族",
      color: "#22c55e",
      project_id: "proj-1",
      description: null,
      created_at: "",
      updated_at: "",
    },
    {
      id: "tag-2",
      name: "歴史",
      color: null,
      project_id: "proj-1",
      description: null,
      created_at: "",
      updated_at: "",
    },
  ],
  author: {
    id: "user-1",
    display_name: "テストユーザー",
    avatar_url: "https://example.com/avatar.png",
  },
}

describe("LoreCardDetail", () => {
  it("カードタイトルが表示される", () => {
    render(<LoreCardDetail card={baseCard} projectId="proj-1" />)
    expect(screen.getByText("テストカード")).toBeInTheDocument()
  })

  it("作成者名が表示される", () => {
    render(<LoreCardDetail card={baseCard} projectId="proj-1" />)
    expect(screen.getByText("テストユーザー")).toBeInTheDocument()
  })

  it("作成者がnullの場合「不明なユーザー」が表示される", () => {
    const cardWithoutAuthor = { ...baseCard, author: null }
    render(<LoreCardDetail card={cardWithoutAuthor} projectId="proj-1" />)
    expect(screen.getByText("不明なユーザー")).toBeInTheDocument()
  })

  it("作成者のdisplay_nameがnullの場合「不明なユーザー」が表示される", () => {
    const cardWithNullName = {
      ...baseCard,
      author: { id: "user-1", display_name: null, avatar_url: null },
    }
    render(<LoreCardDetail card={cardWithNullName} projectId="proj-1" />)
    expect(screen.getByText("不明なユーザー")).toBeInTheDocument()
  })

  it("タグが表示される", () => {
    render(<LoreCardDetail card={baseCard} projectId="proj-1" />)
    expect(screen.getByText("種族")).toBeInTheDocument()
    expect(screen.getByText("歴史")).toBeInTheDocument()
  })

  it("タグがない場合はタグセクションが表示されない", () => {
    const cardWithoutTags = { ...baseCard, tags: [] }
    render(<LoreCardDetail card={cardWithoutTags} projectId="proj-1" />)
    expect(screen.queryByText("種族")).not.toBeInTheDocument()
    expect(screen.queryByText("歴史")).not.toBeInTheDocument()
  })

  it("Markdownコンテンツが表示される", () => {
    render(<LoreCardDetail card={baseCard} projectId="proj-1" />)
    const renderer = screen.getByTestId("markdown-renderer")
    expect(renderer).toBeInTheDocument()
    expect(renderer).toHaveTextContent("# テスト内容")
  })

  it("コンテンツがnullの場合はMarkdownRendererが表示されない", () => {
    const cardWithoutContent = { ...baseCard, content: null }
    render(<LoreCardDetail card={cardWithoutContent} projectId="proj-1" />)
    expect(screen.queryByTestId("markdown-renderer")).not.toBeInTheDocument()
  })

  it("作成日時と更新日時が表示される", () => {
    render(<LoreCardDetail card={baseCard} projectId="proj-1" />)
    // formatDistanceToNowの結果は実行時点に依存するため、プレフィックスで確認
    expect(screen.getByText(/^作成:/)).toBeInTheDocument()
    expect(screen.getByText(/^更新:/)).toBeInTheDocument()
  })

  it("アバターのフォールバックに名前の頭文字が表示される", () => {
    render(<LoreCardDetail card={baseCard} projectId="proj-1" />)
    // "テストユーザー" の頭文字は "テ" → toUpperCase() → "テ"
    expect(screen.getByText("テ")).toBeInTheDocument()
  })
})
