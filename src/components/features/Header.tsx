import Link from "next/link"

import { MobileMenu } from "@/components/features/MobileMenu"
import { ThemeToggle } from "@/components/features/ThemeToggle"
import { UserMenu } from "@/components/features/UserMenu"
import { Button } from "@/components/ui/button"

type NavItem = {
  href: string
  label: string
}

type User = {
  email: string
  avatarUrl?: string | null
}

type Props = {
  user: User | null
  onLogout: () => void
}

// ナビゲーションリンクの定義（拡張可能な配列で管理）
const getNavItems = (isLoggedIn: boolean): NavItem[] => {
  if (isLoggedIn) {
    return [
      { href: "/dashboard", label: "ダッシュボード" },
    ]
  }
  return []
}

// 全ページ共通のヘッダーコンポーネント
// ログイン状態に応じて表示内容が切り替わる
export function Header({ user, onLogout }: Props) {
  const navItems = getNavItems(!!user)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* ロゴ */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">Lorepedia</span>
        </Link>

        {/* デスクトップナビゲーション */}
        <nav className="hidden md:flex items-center gap-6">
          {/* ナビゲーションリンク */}
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ))}

          {/* 認証関連 */}
          {user ? (
            <UserMenu user={user} onLogout={onLogout} />
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">ログイン</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">サインアップ</Link>
              </Button>
            </div>
          )}

          {/* ダークモードトグル */}
          <ThemeToggle />
        </nav>

        {/* モバイルメニュー */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <MobileMenu navItems={navItems} user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  )
}
