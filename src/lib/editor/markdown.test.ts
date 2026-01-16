import { describe, it, expect } from "vitest"
import {
  htmlToMarkdown,
  markdownToHtml,
  isHtmlContent,
  prepareContentForEditor,
} from "./markdown"

describe("markdown変換ユーティリティ", () => {
  describe("htmlToMarkdown", () => {
    it("空文字列を処理できる", () => {
      expect(htmlToMarkdown("")).toBe("")
      expect(htmlToMarkdown("<p></p>")).toBe("")
    })

    it("基本的なHTMLをMarkdownに変換できる", () => {
      const html = "<p>Hello <strong>World</strong></p>"
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain("**World**")
    })

    it("見出しを変換できる", () => {
      expect(htmlToMarkdown("<h1>Title</h1>")).toContain("# Title")
      expect(htmlToMarkdown("<h2>Subtitle</h2>")).toContain("## Subtitle")
      expect(htmlToMarkdown("<h3>Section</h3>")).toContain("### Section")
    })

    it("リストを変換できる", () => {
      const html = "<ul><li>Item 1</li><li>Item 2</li></ul>"
      const markdown = htmlToMarkdown(html)
      // Turndownはリスト項目に余分なスペースを追加する
      expect(markdown).toContain("Item 1")
      expect(markdown).toContain("Item 2")
      expect(markdown).toMatch(/-\s+Item 1/)
      expect(markdown).toMatch(/-\s+Item 2/)
    })

    it("番号付きリストを変換できる", () => {
      const html = "<ol><li>First</li><li>Second</li></ol>"
      const markdown = htmlToMarkdown(html)
      // Turndownはリスト項目に余分なスペースを追加する
      expect(markdown).toContain("First")
      expect(markdown).toContain("Second")
      expect(markdown).toMatch(/1\.\s+First/)
      expect(markdown).toMatch(/2\.\s+Second/)
    })

    it("コードブロックを変換できる", () => {
      const html =
        '<pre><code class="language-javascript">const x = 1;</code></pre>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain("```javascript")
      expect(markdown).toContain("const x = 1;")
      expect(markdown).toContain("```")
    })

    it("引用を変換できる", () => {
      const html = "<blockquote><p>Quote text</p></blockquote>"
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain("> Quote text")
    })

    it("リンクを変換できる", () => {
      const html = '<a href="https://example.com">Link</a>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toContain("[Link](https://example.com)")
    })

    it("カードメンションを変換できる", () => {
      const html =
        '<span data-type="mention" data-id="card-123" data-label="Test Card">@Test Card</span>'
      const markdown = htmlToMarkdown(html)
      expect(markdown).toBe("@[Test Card](card:card-123)")
    })
  })

  describe("markdownToHtml", () => {
    it("空文字列を処理できる", () => {
      expect(markdownToHtml("")).toBe("")
      expect(markdownToHtml("   ")).toBe("")
    })

    it("基本的なMarkdownをHTMLに変換できる", () => {
      const markdown = "Hello **World**"
      const html = markdownToHtml(markdown)
      expect(html).toContain("<strong>World</strong>")
    })

    it("見出しを変換できる", () => {
      expect(markdownToHtml("# Title")).toContain("<h1>Title</h1>")
      expect(markdownToHtml("## Subtitle")).toContain("<h2>Subtitle</h2>")
    })

    it("リストを変換できる", () => {
      const markdown = "- Item 1\n- Item 2"
      const html = markdownToHtml(markdown)
      expect(html).toContain("<ul>")
      expect(html).toContain("<li>Item 1</li>")
      expect(html).toContain("<li>Item 2</li>")
    })

    it("カードメンションを変換できる", () => {
      const markdown = "@[Test Card](card:card-123)"
      const html = markdownToHtml(markdown)
      expect(html).toContain('data-type="mention"')
      expect(html).toContain('data-id="card-123"')
      expect(html).toContain('data-label="Test Card"')
    })

    it("カードメンションのXSS対策ができている", () => {
      // 特殊文字を含むカード名（IDはUUID形式を想定）
      const xssTitle = '<script>alert("xss")</script>'
      const cardId = "test-card-123"
      const markdown = `@[${xssTitle}](card:${cardId})`
      const html = markdownToHtml(markdown)
      // data-label属性内のスクリプトタグがエスケープされていること
      expect(html).toContain('data-label="&lt;script&gt;')
      expect(html).toContain("&lt;/script&gt;")
      // 表示テキスト部分もエスケープされていること
      expect(html).toContain("@&lt;script&gt;")
    })

    it("特殊文字を含むカード名を正しくエスケープできる", () => {
      // クォートや特殊記号を含むカード名
      const title = 'Test "Card" & <Special>'
      const markdown = `@[${title}](card:card-456)`
      const html = markdownToHtml(markdown)
      // クォートがエスケープされていること
      expect(html).toContain("&quot;Card&quot;")
      // アンパサンドがエスケープされていること
      expect(html).toContain("&amp;")
      // 山括弧がエスケープされていること
      expect(html).toContain("&lt;Special&gt;")
    })
  })

  describe("isHtmlContent", () => {
    it("HTMLコンテンツを正しく判定できる", () => {
      expect(isHtmlContent("<p>Hello</p>")).toBe(true)
      expect(isHtmlContent("<div>Content</div>")).toBe(true)
      expect(isHtmlContent("<span>Text</span>")).toBe(true)
    })

    it("Markdownコンテンツを正しく判定できる", () => {
      expect(isHtmlContent("# Title")).toBe(false)
      expect(isHtmlContent("**bold**")).toBe(false)
      expect(isHtmlContent("- list item")).toBe(false)
    })

    it("プレーンテキストを正しく判定できる", () => {
      expect(isHtmlContent("Hello World")).toBe(false)
      expect(isHtmlContent("No tags here")).toBe(false)
    })
  })

  describe("prepareContentForEditor", () => {
    it("空文字列を処理できる", () => {
      expect(prepareContentForEditor("")).toBe("")
      expect(prepareContentForEditor("   ")).toBe("")
    })

    it("HTMLコンテンツをそのまま返す", () => {
      const html = "<p>Hello <strong>World</strong></p>"
      expect(prepareContentForEditor(html)).toBe(html)
    })

    it("MarkdownをHTMLに変換して返す", () => {
      const markdown = "# Title"
      const result = prepareContentForEditor(markdown)
      expect(result).toContain("<h1>Title</h1>")
    })

    it("プレーンテキストをHTMLに変換して返す", () => {
      const text = "Hello World"
      const result = prepareContentForEditor(text)
      expect(result).toContain("<p>Hello World</p>")
    })
  })
})
