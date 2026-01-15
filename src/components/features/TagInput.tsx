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

  const addTag = useCallback(
    (tagName: string) => {
      const trimmed = tagName.trim()

      // 空文字チェック
      if (!trimmed) {
        return
      }

      // 最大文字数チェック
      if (trimmed.length > maxTagLength) {
        setError(`タグ名は${maxTagLength}文字以内で入力してください`)
        return
      }

      // 最大個数チェック
      if (value.length >= maxTags) {
        setError(`タグは最大${maxTags}個まで設定できます`)
        return
      }

      // 重複チェック
      if (value.includes(trimmed)) {
        setError("このタグは既に追加されています")
        return
      }

      setError(null)
      onChange([...value, trimmed])
      setInputValue("")
    },
    [value, onChange, maxTags, maxTagLength]
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
        parts.forEach((part, index) => {
          if (index < parts.length - 1) {
            addTag(part)
          } else {
            setInputValue(part)
          }
        })
      } else {
        setInputValue(newValue)
        setError(null)
      }
    },
    [addTag]
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
