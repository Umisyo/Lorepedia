"use client"

import { Menu } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

import { ThemeToggle } from "@/components/features/ThemeToggle"
import { UserMenu } from "@/components/features/UserMenu"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

type NavItem = {
  href: string
  label: string
}

type User = {
  email: string
  avatarUrl?: string | null
}

type Props = {
  navItems: NavItem[]
  user: User | null
  onLogout: () => void
}

// モバイル用ハンバーガーメニュー
export function MobileMenu({ navItems, user, onLogout }: Props) {
  const [open, setOpen] = useState(false)

  const closeMenu = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">メニューを開く</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>メニュー</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-6">
          {/* ナビゲーションリンク */}
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-lg font-medium hover:text-primary transition-colors"
              onClick={closeMenu}
            >
              {item.label}
            </Link>
          ))}

          {/* 認証関連 */}
          {user ? (
            <div className="flex items-center gap-4 pt-4 border-t">
              <UserMenu user={user} onLogout={onLogout} />
              <span className="text-sm text-muted-foreground">{user.email}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-4 border-t">
              <Button asChild variant="outline" onClick={closeMenu}>
                <Link href="/login">ログイン</Link>
              </Button>
              <Button asChild onClick={closeMenu}>
                <Link href="/signup">サインアップ</Link>
              </Button>
            </div>
          )}

          {/* ダークモードトグル */}
          <div className="flex items-center gap-2 pt-4 border-t">
            <span className="text-sm text-muted-foreground">テーマ</span>
            <ThemeToggle />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
