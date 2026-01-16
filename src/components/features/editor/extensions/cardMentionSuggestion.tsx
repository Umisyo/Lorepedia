"use client"

import { ReactRenderer } from "@tiptap/react"
import tippy, { type Instance as TippyInstance } from "tippy.js"
import type { SuggestionOptions, SuggestionProps } from "@tiptap/suggestion"
import {
  CardSuggestionList,
  type CardSuggestionListRef,
} from "../CardSuggestionList"
import type { CardMentionSuggestion } from "@/app/actions/loreCard"

export type CardMentionSuggestionOptions = {
  projectId: string
  onSearch: (query: string) => void
  getSuggestions: () => CardMentionSuggestion[]
  isLoading: () => boolean
}

/**
 * CardMention用のsuggestion設定を生成
 */
export function createCardMentionSuggestion(
  options: CardMentionSuggestionOptions
): Omit<SuggestionOptions<CardMentionSuggestion>, "editor"> {
  return {
    char: "@",
    allowSpaces: true,

    items: ({ query }): CardMentionSuggestion[] => {
      // 検索をトリガー
      options.onSearch(query)
      // 現在のサジェスト結果を返す
      return options.getSuggestions()
    },

    render: () => {
      let component: ReactRenderer<CardSuggestionListRef> | null = null
      let popup: TippyInstance[] | null = null

      return {
        onStart: (props: SuggestionProps<CardMentionSuggestion>) => {
          component = new ReactRenderer(CardSuggestionList, {
            props: {
              items: props.items,
              isLoading: options.isLoading(),
              command: (item: CardMentionSuggestion) => {
                props.command({ id: item.id, label: item.title })
              },
            },
            editor: props.editor,
          })

          if (!props.clientRect) {
            return
          }

          popup = tippy("body", {
            getReferenceClientRect: props.clientRect as () => DOMRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
          })
        },

        onUpdate: (props: SuggestionProps<CardMentionSuggestion>) => {
          component?.updateProps({
            items: props.items,
            isLoading: options.isLoading(),
            command: (item: CardMentionSuggestion) => {
              props.command({ id: item.id, label: item.title })
            },
          })

          if (!props.clientRect) {
            return
          }

          popup?.[0]?.setProps({
            getReferenceClientRect: props.clientRect as () => DOMRect,
          })
        },

        onKeyDown: (props: { event: KeyboardEvent }) => {
          if (props.event.key === "Escape") {
            popup?.[0]?.hide()
            return true
          }

          return component?.ref?.onKeyDown(props) ?? false
        },

        onExit: () => {
          popup?.[0]?.destroy()
          component?.destroy()
        },
      }
    },
  }
}
