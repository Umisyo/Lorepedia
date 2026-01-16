import { z } from "zod"
import type { CardFilterState } from "@/types/filter"

// ソート対象カラムのスキーマ
export const sortBySchema = z.enum(["created_at", "updated_at", "title", "likes"])

// ソート順のスキーマ
export const sortOrderSchema = z.enum(["asc", "desc"])

// 表示モードのスキーマ
export const viewModeSchema = z.enum(["grid", "list"])

// フィルタのデフォルト値（SSOT: Single Source of Truth）
export const DEFAULT_CARD_FILTERS: CardFilterState = {
  search: "",
  tags: [],
  authors: [],
  dateFrom: "",
  dateTo: "",
  sortBy: "updated_at",
  sortOrder: "desc",
  viewMode: "grid",
  page: 1,
}

// フィルタパラメータのスキーマ
export const cardFilterSchema = z.object({
  search: z.string().optional().default(""),
  tags: z.array(z.string().uuid()).optional().default([]),
  authors: z.array(z.string().uuid()).optional().default([]),
  dateFrom: z.string().optional().default(""),
  dateTo: z.string().optional().default(""),
  sortBy: sortBySchema.optional().default("updated_at"),
  sortOrder: sortOrderSchema.optional().default("desc"),
  viewMode: viewModeSchema.optional().default("grid"),
  page: z.number().int().positive().optional().default(1),
})

export type CardFilterParams = z.infer<typeof cardFilterSchema>

// URLSearchParamsからフィルタパラメータを抽出するヘルパー
export function parseFilterParams(
  searchParams: URLSearchParams
): CardFilterParams {
  // Zodで安全にパース（無効値はデフォルト値を使用）
  const sortByResult = sortBySchema.safeParse(searchParams.get("sort"))
  const sortOrderResult = sortOrderSchema.safeParse(searchParams.get("order"))
  const viewModeResult = viewModeSchema.safeParse(searchParams.get("view"))

  return {
    search: searchParams.get("q") ?? DEFAULT_CARD_FILTERS.search,
    tags: searchParams.getAll("tag").filter((id) => id.length > 0),
    authors: searchParams.getAll("author").filter((id) => id.length > 0),
    dateFrom: searchParams.get("from") ?? DEFAULT_CARD_FILTERS.dateFrom,
    dateTo: searchParams.get("to") ?? DEFAULT_CARD_FILTERS.dateTo,
    sortBy: sortByResult.success
      ? sortByResult.data
      : DEFAULT_CARD_FILTERS.sortBy,
    sortOrder: sortOrderResult.success
      ? sortOrderResult.data
      : DEFAULT_CARD_FILTERS.sortOrder,
    viewMode: viewModeResult.success
      ? viewModeResult.data
      : DEFAULT_CARD_FILTERS.viewMode,
    page: Math.max(
      1,
      parseInt(searchParams.get("page") ?? "1", 10) || DEFAULT_CARD_FILTERS.page
    ),
  }
}

// フィルタパラメータをURLSearchParamsに変換するヘルパー
// デフォルト値と同じ場合はパラメータを省略（URLを短くする）
export function buildFilterParams(
  filters: Partial<CardFilterParams>
): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.search) {
    params.set("q", filters.search)
  }
  if (filters.tags && filters.tags.length > 0) {
    for (const tag of filters.tags) {
      params.append("tag", tag)
    }
  }
  if (filters.authors && filters.authors.length > 0) {
    for (const author of filters.authors) {
      params.append("author", author)
    }
  }
  if (filters.dateFrom) {
    params.set("from", filters.dateFrom)
  }
  if (filters.dateTo) {
    params.set("to", filters.dateTo)
  }
  if (filters.sortBy && filters.sortBy !== DEFAULT_CARD_FILTERS.sortBy) {
    params.set("sort", filters.sortBy)
  }
  if (
    filters.sortOrder &&
    filters.sortOrder !== DEFAULT_CARD_FILTERS.sortOrder
  ) {
    params.set("order", filters.sortOrder)
  }
  if (filters.viewMode && filters.viewMode !== DEFAULT_CARD_FILTERS.viewMode) {
    params.set("view", filters.viewMode)
  }
  if (filters.page && filters.page > DEFAULT_CARD_FILTERS.page) {
    params.set("page", filters.page.toString())
  }

  return params
}
