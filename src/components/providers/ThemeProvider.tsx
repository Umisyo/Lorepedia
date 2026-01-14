"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"

type Props = {
  children: React.ReactNode
}

// next-themesを使用したテーマプロバイダー
// ダークモード/ライトモードの切り替えを管理
export function ThemeProvider({ children }: Props) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  )
}
