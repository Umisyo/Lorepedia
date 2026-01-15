import type { LoreCardWithTags, Author } from "./loreCard"

// ソート対象カラム
export type SortBy = "created_at" | "updated_at" | "title"

// ソート順
export type SortOrder = "asc" | "desc"

// 表示モード
export type ViewMode = "grid" | "list"

// フィルタ状態（URLパラメータと対応）
export type CardFilterState = {
  search: string
  tags: string[]
  authors: string[]
  dateFrom: string
  dateTo: string
  sortBy: SortBy
  sortOrder: SortOrder
  viewMode: ViewMode
  page: number
}

// getLoreCards用のオプション
export type GetLoreCardsOptions = {
  projectId: string
  page?: number
  limit?: number
  search?: string
  tagIds?: string[]
  authorIds?: string[]
  dateFrom?: string
  dateTo?: string
  sortBy?: SortBy
  sortOrder?: SortOrder
}

// ページネーション付きカード一覧結果
export type PaginatedLoreCards = {
  cards: LoreCardWithTags[]
  total: number
  page: number
  totalPages: number
}

// プロジェクトメンバー情報（フィルタ用）
export type ProjectMember = {
  user_id: string
  role: "owner" | "editor" | "viewer"
  profile: Author | null
}
