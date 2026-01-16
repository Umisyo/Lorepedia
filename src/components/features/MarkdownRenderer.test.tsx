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
})
