"use client"

import ReactMarkdown from "react-markdown"
import rehypeSanitize from "rehype-sanitize"
import rehypeHighlight from "rehype-highlight"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Props = {
  content: string
  projectId?: string // カード間リンクのナビゲーション用
  className?: string
}

// カードメンションを抽出する正規表現パターン
const CARD_MENTION_REGEX_SOURCE = /@\[([^\]]+)\]\(card:([^)]+)\)/

/**
 * カードメンション判定用（グローバルフラグなし）
 */
function hasCardMentionsInContent(content: string): boolean {
  return CARD_MENTION_REGEX_SOURCE.test(content)
}

/**
 * カードメンション抽出用の正規表現を作成（毎回新規作成でlastIndex問題を回避）
 */
function createCardMentionPattern(): RegExp {
  return new RegExp(CARD_MENTION_REGEX_SOURCE.source, "g")
}

/**
 * カードメンションをReactコンポーネントに変換
 */
function CardMentionLink({
  cardId,
  cardTitle,
  projectId,
}: {
  cardId: string
  cardTitle: string
  projectId?: string
}) {
  if (!projectId) {
    return (
      <span className="card-mention inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-primary font-medium">
        @{cardTitle}
      </span>
    )
  }

  return (
    <Link
      href={`/projects/${projectId}/cards/${cardId}`}
      className="card-mention inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-primary font-medium hover:bg-primary/20 transition-colors"
    >
      @{cardTitle}
    </Link>
  )
}

/**
 * Markdownコンテンツ内のカードメンションを処理
 */
function processCardMentions(
  content: string,
  projectId?: string
): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  // 毎回新しい正規表現を作成（lastIndex問題を回避）
  const pattern = createCardMentionPattern()

  while ((match = pattern.exec(content)) !== null) {
    // メンションの前のテキスト
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index))
    }

    // カードメンションリンク
    const [, cardTitle, cardId] = match
    parts.push(
      <CardMentionLink
        key={`${cardId}-${match.index}`}
        cardId={cardId}
        cardTitle={cardTitle}
        projectId={projectId}
      />
    )

    lastIndex = match.index + match[0].length
  }

  // 残りのテキスト
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex))
  }

  return parts
}

/**
 * Markdownを表示するコンポーネント
 * - XSS対策（rehype-sanitize）
 * - シンタックスハイライト（rehype-highlight）
 * - カード間リンク対応
 */
export function MarkdownRenderer({ content, projectId, className }: Props) {
  // カードメンションを含む場合はカスタム処理
  const hasCardMentions = hasCardMentionsInContent(content)

  if (hasCardMentions) {
    // カードメンションを含む場合は行ごとに処理してカスタムコンポーネントで表示
    const lines = content.split("\n")

    return (
      <div
        className={cn(
          "prose prose-neutral dark:prose-invert max-w-none",
          "prose-headings:font-bold",
          "prose-h1:text-2xl prose-h1:mt-6 prose-h1:mb-4",
          "prose-h2:text-xl prose-h2:mt-5 prose-h2:mb-3",
          "prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2",
          "prose-ul:list-disc prose-ul:pl-6",
          "prose-ol:list-decimal prose-ol:pl-6",
          "prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground/30",
          "prose-blockquote:pl-4 prose-blockquote:italic",
          "prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5",
          "prose-pre:bg-muted prose-pre:rounded prose-pre:p-4",
          className
        )}
      >
        <ReactMarkdown
          rehypePlugins={[rehypeSanitize, rehypeHighlight]}
          components={{
            // カスタムコンポーネントでカードメンションを処理
            p: ({ children }) => {
              // 子要素がテキストの場合はカードメンションを処理
              if (typeof children === "string") {
                return <p>{processCardMentions(children, projectId)}</p>
              }
              return <p>{children}</p>
            },
            // 他のブロック要素でも同様に処理
            li: ({ children }) => {
              if (typeof children === "string") {
                return <li>{processCardMentions(children, projectId)}</li>
              }
              return <li>{children}</li>
            },
          }}
        >
          {lines.join("\n")}
        </ReactMarkdown>
      </div>
    )
  }

  // 通常のMarkdownレンダリング
  return (
    <div
      className={cn(
        "prose prose-neutral dark:prose-invert max-w-none",
        "prose-headings:font-bold",
        "prose-h1:text-2xl prose-h1:mt-6 prose-h1:mb-4",
        "prose-h2:text-xl prose-h2:mt-5 prose-h2:mb-3",
        "prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2",
        "prose-ul:list-disc prose-ul:pl-6",
        "prose-ol:list-decimal prose-ol:pl-6",
        "prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground/30",
        "prose-blockquote:pl-4 prose-blockquote:italic",
        "prose-code:bg-muted prose-code:rounded prose-code:px-1.5 prose-code:py-0.5",
        "prose-pre:bg-muted prose-pre:rounded prose-pre:p-4",
        className
      )}
    >
      <ReactMarkdown rehypePlugins={[rehypeSanitize, rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
