// Headerコンポーネント関連の型定義

// ナビゲーションリンクの型
export type NavItem = {
  href: string
  label: string
}

// ユーザー情報の型（ヘッダー表示用）
export type HeaderUser = {
  email: string
  avatarUrl?: string | null
}
