import Mention from "@tiptap/extension-mention"
import type { MentionOptions } from "@tiptap/extension-mention"

export type CardMentionAttrs = {
  id: string
  label: string
}

/**
 * カード間リンク用のMention拡張
 * @記法でカードへのリンクを作成
 */
export const CardMention = Mention.extend<MentionOptions>({
  name: "cardMention",
}).configure({
  HTMLAttributes: {
    class: "card-mention",
  },
  // @を入力でトリガー
  suggestion: {
    char: "@",
    allowSpaces: true,
    // 最低1文字入力で候補表示
    startOfLine: false,
  },
  // レンダリング時の属性マッピング
  renderText({ node }) {
    return `@${node.attrs.label}`
  },
  renderHTML({ node }) {
    return [
      "span",
      {
        "class": "card-mention",
        "data-card-id": node.attrs.id,
        "data-card-title": node.attrs.label,
      },
      `@${node.attrs.label}`,
    ]
  },
})
