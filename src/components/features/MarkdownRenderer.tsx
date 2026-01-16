"use client"

import React, { useMemo } from "react"
import ReactMarkdown from "react-markdown"
import rehypeSanitize, { defaultSchema } from "rehype-sanitize"
import rehypeHighlight from "rehype-highlight"
import Link from "next/link"
import { cn } from "@/lib/utils"

type Props = {
  content: string
  projectId?: string // カード間リンクのナビゲーション用
  className?: string
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
        {cardTitle}
      </span>
    )
  }

  return (
    <Link
      href={`/projects/${projectId}/cards/${cardId}`}
      className="card-mention inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-primary font-medium hover:bg-primary/20 transition-colors"
    >
      {cardTitle}
    </Link>
  )
}

/**
 * CardMentionLinkコンポーネントかどうかを判定
 */
function isCardMentionElement(element: React.ReactElement): boolean {
  // コンポーネントの型で直接判定
  return element.type === CardMentionLink
}

/**
 * "@" + CardMentionLink のパターンを検出して "@" を除去
 */
function removeAtBeforeCardLinks(children: React.ReactNode): React.ReactNode {
  if (!Array.isArray(children)) return children

  const result: React.ReactNode[] = []
  for (let i = 0; i < children.length; i++) {
    const current = children[i]
    const next = children[i + 1]

    // "@" + CardMentionLink のパターンを検出してスキップ
    if (
      current === "@" &&
      React.isValidElement(next) &&
      isCardMentionElement(next)
    ) {
      continue
    }
    result.push(current)
  }
  return result
}

// rehype-sanitize用のカスタムスキーマ（card:スキームを許可）
const customSanitizeSchema = {
  ...defaultSchema,
  protocols: {
    ...defaultSchema.protocols,
    href: [...(defaultSchema.protocols?.href ?? []), "card"],
  },
}

/**
 * URLを変換する関数（card:プロトコルを許可）
 * react-markdownはデフォルトで特定のプロトコルのみ許可するため、
 * card:プロトコルを明示的に許可する
 */
function transformUrl(url: string): string {
  // card:プロトコルは許可する
  if (url.startsWith("card:")) {
    return url
  }
  // その他のURLはデフォルトの動作に任せる
  return url
}

/**
 * Markdownを表示するコンポーネント
 * - XSS対策（rehype-sanitize）
 * - シンタックスハイライト（rehype-highlight）
 * - カード間リンク対応
 */
export function MarkdownRenderer({ content, projectId, className }: Props) {
  // カスタムコンポーネントをメモ化（不要な再レンダリングを防ぐ）
  const customComponents = useMemo(
    () => ({
      // card:スキームのリンクをCardMentionLinkに変換
      a: ({
        href,
        children,
      }: {
        href?: string
        children?: React.ReactNode
      }) => {
        if (href?.startsWith("card:")) {
          const cardId = href.replace("card:", "")
          let cardTitle =
            typeof children === "string" ? children : String(children ?? "")
          // Markdown形式 @[title](card:id) から変換された際に含まれる先頭の @ を除去
          if (cardTitle.startsWith("@")) {
            cardTitle = cardTitle.slice(1)
          }
          return (
            <CardMentionLink
              cardId={cardId}
              cardTitle={cardTitle}
              projectId={projectId}
            />
          )
        }
        return (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
          </a>
        )
      },
      // 各ブロック要素で "@" + CardMentionLink パターンの "@" を除去
      p: ({ children }: { children?: React.ReactNode }) => (
        <p>{removeAtBeforeCardLinks(children)}</p>
      ),
      li: ({ children }: { children?: React.ReactNode }) => (
        <li>{removeAtBeforeCardLinks(children)}</li>
      ),
      h1: ({ children }: { children?: React.ReactNode }) => (
        <h1>{removeAtBeforeCardLinks(children)}</h1>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <h2>{removeAtBeforeCardLinks(children)}</h2>
      ),
      h3: ({ children }: { children?: React.ReactNode }) => (
        <h3>{removeAtBeforeCardLinks(children)}</h3>
      ),
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <blockquote>{removeAtBeforeCardLinks(children)}</blockquote>
      ),
    }),
    [projectId]
  )

  // proseクラス設定
  const proseClassName = cn(
    "prose prose-neutral dark:prose-invert max-w-none",
    // 文字色を明示的に設定（ライトモード対応）
    "text-foreground",
    "prose-headings:font-bold prose-headings:text-foreground",
    "prose-strong:text-foreground",
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
  )

  return (
    <div className={proseClassName}>
      <ReactMarkdown
        urlTransform={transformUrl}
        rehypePlugins={[
          [rehypeSanitize, customSanitizeSchema],
          rehypeHighlight,
        ]}
        components={customComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
