import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { MarkdownRenderer } from "./MarkdownRenderer"

describe("MarkdownRenderer", () => {
  it("基本的なMarkdownをレンダリングできる", () => {
    render(<MarkdownRenderer content="# Title" />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Title")
  })

  it("太字と斜体をレンダリングできる", () => {
    render(<MarkdownRenderer content="**bold** and *italic*" />)
    expect(screen.getByText("bold")).toBeInTheDocument()
    expect(screen.getByText("italic")).toBeInTheDocument()
  })

  it("リストをレンダリングできる", () => {
    const { container } = render(
      <MarkdownRenderer content={"- Item 1\n- Item 2"} />
    )
    // ul要素が存在することを確認
    const list = container.querySelector("ul")
    expect(list).toBeInTheDocument()
    // li要素が存在することを確認
    const listItems = container.querySelectorAll("li")
    expect(listItems.length).toBeGreaterThan(0)
  })

  it("コードブロックをレンダリングできる", () => {
    const { container } = render(
      <MarkdownRenderer content={"```js\nconst x = 1\n```"} />
    )
    // code要素が存在することを確認
    const code = container.querySelector("code")
    expect(code).toBeInTheDocument()
  })

  it("空のコンテンツを処理できる", () => {
    const { container } = render(<MarkdownRenderer content="" />)
    expect(container.querySelector(".prose")).toBeInTheDocument()
  })

  it("カスタムclassNameを適用できる", () => {
    const { container } = render(
      <MarkdownRenderer content="test" className="custom-class" />
    )
    expect(container.querySelector(".custom-class")).toBeInTheDocument()
  })

  it("proseスタイルが適用される", () => {
    const { container } = render(<MarkdownRenderer content="# Title" />)
    expect(container.querySelector(".prose")).toBeInTheDocument()
  })

  it("見出し階層を正しくレンダリングできる", () => {
    render(<MarkdownRenderer content="## Subtitle" />)
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      "Subtitle"
    )
  })

  describe("GFM（GitHub Flavored Markdown）", () => {
    it("テーブルをレンダリングできる", () => {
      const tableMarkdown = `
| 列1 | 列2 |
| --- | --- |
| A | B |
| C | D |
`
      const { container } = render(<MarkdownRenderer content={tableMarkdown} />)

      expect(container.querySelector("table")).toBeInTheDocument()
      expect(container.querySelectorAll("th")).toHaveLength(2)
      expect(container.querySelectorAll("td")).toHaveLength(4)
    })

    it("打消し線をレンダリングできる", () => {
      const { container } = render(
        <MarkdownRenderer content="~~deleted text~~" />
      )
      const del = container.querySelector("del")
      expect(del).toBeInTheDocument()
      expect(del).toHaveTextContent("deleted text")
    })

    it("タスクリストをレンダリングできる", () => {
      const taskListMarkdown = `
- [ ] 未完了タスク
- [x] 完了タスク
`
      const { container } = render(
        <MarkdownRenderer content={taskListMarkdown} />
      )
      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      expect(checkboxes).toHaveLength(2)
    })
  })

  describe("カードメンション", () => {
    it("カードメンションをリンクとしてレンダリングできる", () => {
      render(
        <MarkdownRenderer
          content="@[テストカード](card:card-123)"
          projectId="project-456"
        />
      )
      const link = screen.getByRole("link", { name: "テストカード" })
      expect(link).toHaveAttribute(
        "href",
        "/projects/project-456/cards/card-123"
      )
    })

    it("カードメンションに@プレフィックスが表示されない", () => {
      render(
        <MarkdownRenderer
          content="@[テストカード](card:card-123)"
          projectId="project-456"
        />
      )
      expect(screen.queryByText("@テストカード")).not.toBeInTheDocument()
      expect(screen.getByText("テストカード")).toBeInTheDocument()
    })

    it("projectIdがない場合はspanとしてレンダリングされる", () => {
      const { container } = render(
        <MarkdownRenderer content="@[テストカード](card:card-123)" />
      )
      expect(container.querySelector(".card-mention")?.tagName).toBe("SPAN")
    })

    it("複数のカードメンションを正しくレンダリングできる", () => {
      render(
        <MarkdownRenderer
          content="@[カード1](card:id-1)と@[カード2](card:id-2)があります"
          projectId="project-456"
        />
      )
      expect(
        screen.getByRole("link", { name: "カード1" })
      ).toBeInTheDocument()
      expect(
        screen.getByRole("link", { name: "カード2" })
      ).toBeInTheDocument()
    })

    it("通常のリンクは影響を受けない", () => {
      render(
        <MarkdownRenderer
          content="[外部リンク](https://example.com)"
          projectId="project-456"
        />
      )
      const link = screen.getByRole("link", { name: "外部リンク" })
      expect(link).toHaveAttribute("href", "https://example.com")
    })
  })
})
