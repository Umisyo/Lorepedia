"use client"

import React, { useMemo, useCallback } from "react"
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
 * 文字列内のカードメンションを処理してReactノードに変換
 */
function processCardMentionsInText(
  text: string,
  projectId?: string,
  keyPrefix = ""
): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  // 毎回新しい正規表現を作成（lastIndex問題を回避）
  const pattern = createCardMentionPattern()

  while ((match = pattern.exec(text)) !== null) {
    // メンションの前のテキスト
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    // カードメンションリンク
    const [, cardTitle, cardId] = match
    parts.push(
      <CardMentionLink
        key={`${keyPrefix}${cardId}-${match.index}`}
        cardId={cardId}
        cardTitle={cardTitle}
        projectId={projectId}
      />
    )

    lastIndex = match.index + match[0].length
  }

  // 残りのテキスト
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}

/**
 * React子要素を再帰的に処理してカードメンションを変換
 */
function processChildren(
  children: React.ReactNode,
  projectId?: string,
  keyPrefix = ""
): React.ReactNode {
  // 文字列の場合はカードメンションを処理
  if (typeof children === "string") {
    if (hasCardMentionsInContent(children)) {
      return processCardMentionsInText(children, projectId, keyPrefix)
    }
    return children
  }

  // 配列の場合は各要素を再帰的に処理
  if (Array.isArray(children)) {
    return children.map((child, index) =>
      processChildren(child, projectId, `${keyPrefix}${index}-`)
    )
  }

  // React要素の場合は子要素を再帰的に処理
  if (React.isValidElement(children)) {
    const props = children.props as Record<string, unknown>
    const childrenProp = props.children as React.ReactNode | undefined
    if (childrenProp !== undefined) {
      return React.cloneElement(
        children,
        { ...props },
        processChildren(childrenProp, projectId, `${keyPrefix}child-`)
      )
    }
  }

  // その他の場合はそのまま返す
  return children
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

  // 子要素を再帰的に処理してカードメンションを変換する関数をメモ化
  const processChildrenWithMentions = useCallback(
    (children: React.ReactNode, keyPrefix = "") =>
      processChildren(children, projectId, keyPrefix),
    [projectId]
  )

  // カスタムコンポーネントをメモ化（不要な再レンダリングを防ぐ）
  const customComponents = useMemo(
    () => ({
      // カスタムコンポーネントでカードメンションを処理（子要素を再帰的に処理）
      p: ({ children }: { children?: React.ReactNode }) => (
        <p>{processChildrenWithMentions(children, "p-")}</p>
      ),
      // 他のブロック要素でも同様に処理
      li: ({ children }: { children?: React.ReactNode }) => (
        <li>{processChildrenWithMentions(children, "li-")}</li>
      ),
      // 見出し要素も処理
      h1: ({ children }: { children?: React.ReactNode }) => (
        <h1>{processChildrenWithMentions(children, "h1-")}</h1>
      ),
      h2: ({ children }: { children?: React.ReactNode }) => (
        <h2>{processChildrenWithMentions(children, "h2-")}</h2>
      ),
      h3: ({ children }: { children?: React.ReactNode }) => (
        <h3>{processChildrenWithMentions(children, "h3-")}</h3>
      ),
      // 引用も処理
      blockquote: ({ children }: { children?: React.ReactNode }) => (
        <blockquote>{processChildrenWithMentions(children, "bq-")}</blockquote>
      ),
    }),
    [processChildrenWithMentions]
  )

  // proseクラス設定
  const proseClassName = cn(
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
  )

  if (hasCardMentions) {
    return (
      <div className={proseClassName}>
        <ReactMarkdown
          rehypePlugins={[rehypeSanitize, rehypeHighlight]}
          components={customComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    )
  }

  // 通常のMarkdownレンダリング
  return (
    <div className={proseClassName}>
      <ReactMarkdown rehypePlugins={[rehypeSanitize, rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
