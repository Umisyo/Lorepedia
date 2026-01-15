"use client"

import { useState, useCallback, type KeyboardEvent } from "react"
import { X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

type Props = {
  value: string[]
  onChange: (tags: string[]) => void
  maxTags?: number
  maxTagLength?: number
  disabled?: boolean
  placeholder?: string
}

export function TagInput({
  value,
  onChange,
  maxTags = 5,
  maxTagLength = 20,
  disabled = false,
  placeholder = "タグを入力してEnterで追加",
}: Props) {
  const [inputValue, setInputValue] = useState("")
  const [error, setError] = useState<string | null>(null)

  // 複数のタグを一度に追加する関数
  const addTags = useCallback(
    (tagNames: string[]) => {
      const currentTags = [...value]
      let lastError: string | null = null

      for (const tagName of tagNames) {
        const trimmed = tagName.trim()

        // 空文字チェック
        if (!trimmed) {
          continue
        }

        // 最大文字数チェック
        if (trimmed.length > maxTagLength) {
          lastError = `タグ名は${maxTagLength}文字以内で入力してください`
          continue
        }

        // 最大個数チェック
        if (currentTags.length >= maxTags) {
          lastError = `タグは最大${maxTags}個まで設定できます`
          break
        }

        // 重複チェック（既存のタグと新しく追加するタグの両方をチェック）
        if (currentTags.includes(trimmed)) {
          lastError = "このタグは既に追加されています"
          continue
        }

        currentTags.push(trimmed)
      }

      // 変更があった場合のみ更新
      if (currentTags.length > value.length) {
        setError(null)
        onChange(currentTags)
        setInputValue("")
      } else if (lastError) {
        setError(lastError)
      }
    },
    [value, onChange, maxTags, maxTagLength]
  )

  // 単一のタグを追加する関数（addTagsのラッパー）
  const addTag = useCallback(
    (tagName: string) => {
      addTags([tagName])
    },
    [addTags]
  )

  const removeTag = useCallback(
    (tagToRemove: string) => {
      onChange(value.filter((tag) => tag !== tagToRemove))
      setError(null)
    },
    [value, onChange]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault()
        addTag(inputValue)
      }

      // Backspaceで最後のタグを削除
      if (e.key === "Backspace" && !inputValue && value.length > 0) {
        removeTag(value[value.length - 1])
      }
    },
    [inputValue, addTag, removeTag, value]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value

      // カンマが入力された場合、タグを追加
      if (newValue.includes(",")) {
        const parts = newValue.split(",")
        // 最後のパート以外をタグとして追加（一度に追加）
        const tagsToAdd = parts.slice(0, -1)
        const remainder = parts[parts.length - 1]

        if (tagsToAdd.length > 0) {
          addTags(tagsToAdd)
        }
        setInputValue(remainder)
      } else {
        setInputValue(newValue)
        setError(null)
      }
    },
    [addTags]
  )

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1 pr-1">
            {tag}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 hover:bg-transparent"
              onClick={() => removeTag(tag)}
              disabled={disabled}
              aria-label={`${tag}を削除`}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>

      {value.length < maxTags && (
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? "tag-input-error" : undefined}
        />
      )}

      {error && (
        <p id="tag-input-error" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        {value.length}/{maxTags}個のタグ
      </p>
    </div>
  )
}
