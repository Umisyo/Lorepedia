import TurndownService from "turndown"
import { marked } from "marked"

// TurndownService インスタンス（HTML → Markdown変換）
const turndownService = new TurndownService({
  headingStyle: "atx", // # 記法を使用
  codeBlockStyle: "fenced", // ``` 記法を使用
  bulletListMarker: "-",
  emDelimiter: "*",
  strongDelimiter: "**",
})

// テーブル対応のカスタムルール
turndownService.addRule("tableCell", {
  filter: ["th", "td"],
  replacement: (content) => {
    return ` ${content.trim()} |`
  },
})

turndownService.addRule("tableRow", {
  filter: "tr",
  replacement: (content, node) => {
    const isHeader = node.parentElement?.tagName === "THEAD"
    let row = `|${content}\n`

    if (isHeader) {
      const cellCount = node.querySelectorAll("th, td").length
      row += "|" + " --- |".repeat(cellCount) + "\n"
    }

    return row
  },
})

turndownService.addRule("table", {
  filter: "table",
  replacement: (content) => {
    return `\n${content}\n`
  },
})

// 画像対応のカスタムルール
turndownService.addRule("image", {
  filter: "img",
  replacement: (_content, node) => {
    const img = node as HTMLImageElement
    const alt = img.alt || ""
    const src = img.src || ""
    const title = img.title ? ` "${img.title}"` : ""
    return `![${alt}](${src}${title})`
  },
})

// コードブロック対応（言語指定を保持）
turndownService.addRule("codeBlock", {
  filter: (node) => {
    return (
      node.nodeName === "PRE" &&
      node.firstChild?.nodeName === "CODE"
    )
  },
  replacement: (_content, node) => {
    const codeElement = node.firstChild as HTMLElement
    const code = codeElement.textContent || ""
    // 言語クラスから言語を抽出（例: "language-javascript"）
    const langClass = codeElement.className.match(/language-(\w+)/)
    const lang = langClass ? langClass[1] : ""
    return `\n\`\`\`${lang}\n${code}\n\`\`\`\n`
  },
})

// カードメンション対応
turndownService.addRule("cardMention", {
  filter: (node) => {
    return (
      node.nodeName === "SPAN" &&
      node.getAttribute("data-type") === "mention"
    )
  },
  replacement: (_content, node) => {
    const element = node as HTMLElement
    const cardId = element.getAttribute("data-id") || ""
    const cardTitle = element.getAttribute("data-label") || ""
    // @[カード名](card:カードID) 形式で出力
    return `@[${cardTitle}](card:${cardId})`
  },
})

/**
 * HTMLをMarkdownに変換
 */
export function htmlToMarkdown(html: string): string {
  if (!html || html === "<p></p>") {
    return ""
  }
  return turndownService.turndown(html)
}

/**
 * HTML特殊文字をエスケープ（XSS対策）
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/**
 * カードメンション記法をHTMLに変換
 * @[カード名](card:カードID) → <span data-type="mention" data-id="ID" data-label="名前">@カード名</span>
 */
function convertCardMentionsToHtml(markdown: string): string {
  // @[カード名](card:カードID) のパターンにマッチ
  const mentionPattern = /@\[([^\]]+)\]\(card:([^)]+)\)/g
  return markdown.replace(mentionPattern, (_match, title, id) => {
    // XSS対策: 属性値とテキストをエスケープ
    const safeId = escapeHtml(id)
    const safeTitle = escapeHtml(title)
    return `<span data-type="mention" data-id="${safeId}" data-label="${safeTitle}" class="card-mention">@${safeTitle}</span>`
  })
}

/**
 * MarkdownをHTMLに変換
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown.trim()) {
    return ""
  }
  // カードメンションを先に処理
  const withMentions = convertCardMentionsToHtml(markdown)
  // markedはデフォルトで同期的に動作
  const result = marked.parse(withMentions, { async: false })
  return typeof result === "string" ? result : ""
}

/**
 * コンテンツがMarkdown形式かHTMLかを判定
 * Tiptapは内部的にHTMLを使用するため、既存データとの互換性を保つために必要
 */
export function isHtmlContent(content: string): boolean {
  // HTMLタグが含まれているかをチェック
  const htmlTagPattern = /<\/?[a-z][\s\S]*>/i
  return htmlTagPattern.test(content)
}

/**
 * エディタにセットするためのコンテンツを準備
 * - Markdownの場合はHTMLに変換
 * - HTMLの場合はそのまま返す
 * - 空の場合は空文字を返す
 */
export function prepareContentForEditor(content: string): string {
  if (!content.trim()) {
    return ""
  }

  // 既にHTMLの場合はそのまま返す
  if (isHtmlContent(content)) {
    return content
  }

  // MarkdownをHTMLに変換
  return markdownToHtml(content)
}

/**
 * Markdownが有効なHTMLに変換できるか検証
 * （現時点では単純にテキストとして扱う）
 */
export function isValidMarkdown(content: string): boolean {
  // 空文字列は有効
  if (!content.trim()) {
    return true
  }
  // Markdown構文として問題ないかの基本チェック
  // 現時点では全て有効として扱う
  return true
}

/**
 * プレーンテキストをMarkdownとして扱えるよう整形
 * （既存データとの互換性のため）
 */
export function normalizeMarkdown(content: string): string {
  // 既存のプレーンテキストはそのままMarkdownとして扱える
  return content
}
