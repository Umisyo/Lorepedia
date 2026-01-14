import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { HeaderWrapper } from "@/components/features/HeaderWrapper"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { createClient } from "@/utils/supabase/server"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Lorepedia",
  description: "シェアード・ワールド創作支援Webアプリケーション",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // 認証情報を取得
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Headerに渡すユーザー情報を整形
  // emailが存在しない場合は未認証扱いとする
  const headerUser =
    user && user.email
      ? {
          email: user.email,
          avatarUrl: user.user_metadata?.avatar_url ?? null,
        }
      : null

  return (
    <html lang="ja" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <HeaderWrapper user={headerUser} />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
