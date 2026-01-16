"use client"

import { useMemo, useCallback, useRef } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { Table } from "@tiptap/extension-table"
import { TableRow } from "@tiptap/extension-table-row"
import { TableCell } from "@tiptap/extension-table-cell"
import { TableHeader } from "@tiptap/extension-table-header"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Mention from "@tiptap/extension-mention"
import { common, createLowlight } from "lowlight"
import { EditorToolbar } from "./EditorToolbar"
import { createCardMentionSuggestion } from "./extensions/cardMentionSuggestion"
import { cn } from "@/lib/utils"
import { htmlToMarkdown, prepareContentForEditor } from "@/lib/editor/markdown"
import { useCardSearch } from "@/hooks/useCardSearch"
import type { CardMentionSuggestion } from "@/app/actions/loreCard"

// シンタックスハイライト用のlowlightインスタンス
const lowlight = createLowlight(common)

type Props = {
  content?: string
  onChange?: (content: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  projectId?: string // カード間リンク機能用（オプショナル）
}

export function RichTextEditor({
  content = "",
  onChange,
  placeholder = "内容を入力...",
  disabled = false,
  className,
  projectId,
}: Props) {

  // Markdownコンテンツをエディタ用のHTMLに変換（初回のみ）
  const initialContent = useMemo(
    () => prepareContentForEditor(content),
    // 初回レンダリング時のみ変換するため、依存配列は空
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // カード検索（projectIdがある場合のみ有効）
  const { suggestions, isLoading, search } = useCardSearch({
    projectId: projectId ?? "",
  })

  // サジェスト結果をrefで管理（suggestion.itemsからアクセスするため）
  const suggestionsRef = useRef<CardMentionSuggestion[]>([])
  const isLoadingRef = useRef(false)
  suggestionsRef.current = suggestions
  isLoadingRef.current = isLoading

  const getSuggestions = useCallback(() => suggestionsRef.current, [])
  const getIsLoading = useCallback(() => isLoadingRef.current, [])

  // Mention拡張（projectIdがある場合のみ有効化）
  const mentionExtension = useMemo(() => {
    if (!projectId) return null

    return Mention.configure({
      HTMLAttributes: {
        class:
          "card-mention inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-primary font-medium cursor-pointer hover:bg-primary/20",
      },
      suggestion: createCardMentionSuggestion({
        projectId,
        onSearch: search,
        getSuggestions,
        isLoading: getIsLoading,
      }),
      renderText({ node }) {
        return `@${node.attrs.label ?? ""}`
      },
    })
  }, [projectId, search, getSuggestions, getIsLoading])

  const extensions = useMemo(() => {
    const baseExtensions = [
      StarterKit.configure({
        // CodeBlockLowlightを使うのでデフォルトのcodeBlockは無効化
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full",
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-border p-2",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-border p-2 bg-muted font-bold",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "bg-muted rounded p-4 font-mono text-sm overflow-x-auto",
        },
      }),
      // カードメンション機能（projectIdがある場合のみ）
      ...(mentionExtension ? [mentionExtension] : []),
    ]

    return baseExtensions
  }, [mentionExtension])

  const editor = useEditor({
    extensions,
    content: initialContent,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-neutral dark:prose-invert max-w-none",
          "min-h-[300px] p-4 focus:outline-none",
          // 見出しスタイル
          "prose-headings:font-bold prose-headings:text-foreground",
          "prose-h1:text-2xl prose-h1:mt-6 prose-h1:mb-4",
          "prose-h2:text-xl prose-h2:mt-5 prose-h2:mb-3",
          "prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2",
          // リストスタイル
          "prose-ul:list-disc prose-ul:pl-6",
          "prose-ol:list-decimal prose-ol:pl-6",
          // 引用スタイル
          "prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground/30",
          "prose-blockquote:pl-4 prose-blockquote:italic"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      // HTMLをMarkdownに変換して出力
      const html = editor.getHTML()
      const markdown = htmlToMarkdown(html)
      onChange?.(markdown)
    },
  })

  // プレースホルダー表示（エディタが空の場合）
  const isEmpty = editor?.isEmpty

  return (
    <div
      className={cn(
        "rounded-md border bg-background",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div className="flex items-center justify-between border-b px-2 py-1">
        <EditorToolbar editor={editor} />
      </div>
      <div className="relative">
        {isEmpty && (
          <div className="pointer-events-none absolute left-4 top-4 text-muted-foreground">
            {placeholder}
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
