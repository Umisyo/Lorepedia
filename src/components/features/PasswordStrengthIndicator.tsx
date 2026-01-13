"use client"

import { cn } from "@/utils/utils"
import { getPasswordStrength, type PasswordStrength } from "@/schemas/auth"

type Props = {
  password: string
  className?: string
}

const strengthConfig: Record<
  PasswordStrength,
  { label: string; color: string; barColor: string; width: string }
> = {
  weak: {
    label: "弱い",
    color: "text-red-600",
    barColor: "bg-red-500",
    width: "w-1/3",
  },
  medium: {
    label: "普通",
    color: "text-yellow-600",
    barColor: "bg-yellow-500",
    width: "w-2/3",
  },
  strong: {
    label: "強い",
    color: "text-green-600",
    barColor: "bg-green-500",
    width: "w-full",
  },
}

export function PasswordStrengthIndicator({ password, className }: Props) {
  // パスワードが空の場合は表示しない
  if (!password) {
    return null
  }

  const strength = getPasswordStrength(password)
  const config = strengthConfig[strength]

  return (
    <div className={cn("space-y-1", className)}>
      {/* インジケーターバー */}
      <div className="h-1 w-full rounded-full bg-gray-200">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            config.barColor,
            config.width
          )}
        />
      </div>
      {/* 強度テキスト */}
      <p className={cn("text-xs", config.color)}>
        パスワード強度: {config.label}
      </p>
    </div>
  )
}
