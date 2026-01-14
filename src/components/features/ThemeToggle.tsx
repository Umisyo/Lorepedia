"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

// ダークモード/ライトモード切り替えトグルボタン
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()

  // hydrationエラーを防ぐため、resolvedThemeがundefinedの間はスケルトンを表示
  // resolvedThemeはクライアントサイドでのみ解決される
  if (resolvedTheme === undefined) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Sun className="h-5 w-5" />
        <span className="sr-only">テーマを切り替え</span>
      </Button>
    )
  }

  const isDark = resolvedTheme === "dark"

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={isDark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
      <span className="sr-only">
        {isDark ? "ライトモードに切り替え" : "ダークモードに切り替え"}
      </span>
    </Button>
  )
}
