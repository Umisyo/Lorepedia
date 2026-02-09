import { describe, it, expect } from "vitest"
import {
  sortBySchema,
  sortOrderSchema,
  viewModeSchema,
  cardFilterSchema,
  parseFilterParams,
  buildFilterParams,
  DEFAULT_CARD_FILTERS,
} from "./cardFilter"

describe("sortBySchema", () => {
  it("有効な値をパースできる", () => {
    expect(sortBySchema.safeParse("created_at").success).toBe(true)
    expect(sortBySchema.safeParse("updated_at").success).toBe(true)
    expect(sortBySchema.safeParse("title").success).toBe(true)
    expect(sortBySchema.safeParse("likes").success).toBe(true)
  })

  it("無効な値はパース失敗する", () => {
    expect(sortBySchema.safeParse("invalid").success).toBe(false)
    expect(sortBySchema.safeParse("").success).toBe(false)
  })
})

describe("sortOrderSchema", () => {
  it("有効な値をパースできる", () => {
    expect(sortOrderSchema.safeParse("asc").success).toBe(true)
    expect(sortOrderSchema.safeParse("desc").success).toBe(true)
  })

  it("無効な値はパース失敗する", () => {
    expect(sortOrderSchema.safeParse("ascending").success).toBe(false)
  })
})

describe("viewModeSchema", () => {
  it("有効な値をパースできる", () => {
    expect(viewModeSchema.safeParse("grid").success).toBe(true)
    expect(viewModeSchema.safeParse("list").success).toBe(true)
  })

  it("無効な値はパース失敗する", () => {
    expect(viewModeSchema.safeParse("table").success).toBe(false)
  })
})

describe("cardFilterSchema", () => {
  it("空オブジェクトでデフォルト値が設定される", () => {
    const result = cardFilterSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.search).toBe("")
      expect(result.data.tags).toEqual([])
      expect(result.data.authors).toEqual([])
      expect(result.data.dateFrom).toBe("")
      expect(result.data.dateTo).toBe("")
      expect(result.data.sortBy).toBe("updated_at")
      expect(result.data.sortOrder).toBe("desc")
      expect(result.data.viewMode).toBe("grid")
      expect(result.data.page).toBe(1)
    }
  })

  it("すべてのフィールドを指定できる", () => {
    const uuid = "550e8400-e29b-41d4-a716-446655440000"
    const result = cardFilterSchema.safeParse({
      search: "テスト",
      tags: [uuid],
      authors: [uuid],
      dateFrom: "2025-01-01",
      dateTo: "2025-12-31",
      sortBy: "title",
      sortOrder: "asc",
      viewMode: "list",
      page: 3,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.search).toBe("テスト")
      expect(result.data.tags).toEqual([uuid])
      expect(result.data.page).toBe(3)
    }
  })

  it("tagsにUUIDでない文字列はバリデーションエラー", () => {
    const result = cardFilterSchema.safeParse({
      tags: ["not-a-uuid"],
    })
    expect(result.success).toBe(false)
  })

  it("pageが0以下はバリデーションエラー", () => {
    const result = cardFilterSchema.safeParse({ page: 0 })
    expect(result.success).toBe(false)

    const result2 = cardFilterSchema.safeParse({ page: -1 })
    expect(result2.success).toBe(false)
  })

  it("pageが小数はバリデーションエラー", () => {
    const result = cardFilterSchema.safeParse({ page: 1.5 })
    expect(result.success).toBe(false)
  })
})

describe("parseFilterParams", () => {
  it("空のURLSearchParamsからデフォルト値を返す", () => {
    const params = new URLSearchParams()
    const result = parseFilterParams(params)
    expect(result).toEqual(DEFAULT_CARD_FILTERS)
  })

  it("検索クエリをパースできる", () => {
    const params = new URLSearchParams("q=テスト")
    const result = parseFilterParams(params)
    expect(result.search).toBe("テスト")
  })

  it("ソートパラメータをパースできる", () => {
    const params = new URLSearchParams("sort=title&order=asc")
    const result = parseFilterParams(params)
    expect(result.sortBy).toBe("title")
    expect(result.sortOrder).toBe("asc")
  })

  it("表示モードをパースできる", () => {
    const params = new URLSearchParams("view=list")
    const result = parseFilterParams(params)
    expect(result.viewMode).toBe("list")
  })

  it("ページ番号をパースできる", () => {
    const params = new URLSearchParams("page=5")
    const result = parseFilterParams(params)
    expect(result.page).toBe(5)
  })

  it("無効なソート値はデフォルトにフォールバックする", () => {
    const params = new URLSearchParams("sort=invalid")
    const result = parseFilterParams(params)
    expect(result.sortBy).toBe(DEFAULT_CARD_FILTERS.sortBy)
  })

  it("無効な表示モードはデフォルトにフォールバックする", () => {
    const params = new URLSearchParams("view=table")
    const result = parseFilterParams(params)
    expect(result.viewMode).toBe(DEFAULT_CARD_FILTERS.viewMode)
  })

  it("ページ番号が0以下の場合は1にフォールバックする", () => {
    const params = new URLSearchParams("page=0")
    const result = parseFilterParams(params)
    expect(result.page).toBe(1)

    const params2 = new URLSearchParams("page=-3")
    const result2 = parseFilterParams(params2)
    expect(result2.page).toBe(1)
  })

  it("ページ番号が数値でない場合は1にフォールバックする", () => {
    const params = new URLSearchParams("page=abc")
    const result = parseFilterParams(params)
    expect(result.page).toBe(1)
  })

  it("複数タグをパースできる", () => {
    const params = new URLSearchParams("tag=id1&tag=id2&tag=id3")
    const result = parseFilterParams(params)
    expect(result.tags).toEqual(["id1", "id2", "id3"])
  })

  it("空タグ値はフィルタされる", () => {
    const params = new URLSearchParams("tag=&tag=id1")
    const result = parseFilterParams(params)
    expect(result.tags).toEqual(["id1"])
  })

  it("日付範囲をパースできる", () => {
    const params = new URLSearchParams("from=2025-01-01&to=2025-12-31")
    const result = parseFilterParams(params)
    expect(result.dateFrom).toBe("2025-01-01")
    expect(result.dateTo).toBe("2025-12-31")
  })
})

describe("buildFilterParams", () => {
  it("デフォルト値のフィルタは空のパラメータを返す", () => {
    const params = buildFilterParams(DEFAULT_CARD_FILTERS)
    expect(params.toString()).toBe("")
  })

  it("検索クエリがセットされる", () => {
    const params = buildFilterParams({ search: "テスト" })
    expect(params.get("q")).toBe("テスト")
  })

  it("空の検索クエリは省略される", () => {
    const params = buildFilterParams({ search: "" })
    expect(params.has("q")).toBe(false)
  })

  it("タグがセットされる", () => {
    const params = buildFilterParams({ tags: ["id1", "id2"] })
    expect(params.getAll("tag")).toEqual(["id1", "id2"])
  })

  it("空のタグ配列は省略される", () => {
    const params = buildFilterParams({ tags: [] })
    expect(params.has("tag")).toBe(false)
  })

  it("デフォルトと異なるソート値がセットされる", () => {
    const params = buildFilterParams({ sortBy: "title" })
    expect(params.get("sort")).toBe("title")
  })

  it("デフォルトと同じソート値は省略される", () => {
    const params = buildFilterParams({ sortBy: "updated_at" })
    expect(params.has("sort")).toBe(false)
  })

  it("デフォルトと異なるソート順がセットされる", () => {
    const params = buildFilterParams({ sortOrder: "asc" })
    expect(params.get("order")).toBe("asc")
  })

  it("デフォルトと同じソート順は省略される", () => {
    const params = buildFilterParams({ sortOrder: "desc" })
    expect(params.has("order")).toBe(false)
  })

  it("デフォルトと異なる表示モードがセットされる", () => {
    const params = buildFilterParams({ viewMode: "list" })
    expect(params.get("view")).toBe("list")
  })

  it("デフォルトと同じ表示モードは省略される", () => {
    const params = buildFilterParams({ viewMode: "grid" })
    expect(params.has("view")).toBe(false)
  })

  it("ページ1は省略される", () => {
    const params = buildFilterParams({ page: 1 })
    expect(params.has("page")).toBe(false)
  })

  it("ページ2以上はセットされる", () => {
    const params = buildFilterParams({ page: 3 })
    expect(params.get("page")).toBe("3")
  })

  it("日付範囲がセットされる", () => {
    const params = buildFilterParams({
      dateFrom: "2025-01-01",
      dateTo: "2025-12-31",
    })
    expect(params.get("from")).toBe("2025-01-01")
    expect(params.get("to")).toBe("2025-12-31")
  })

  it("空の日付は省略される", () => {
    const params = buildFilterParams({ dateFrom: "", dateTo: "" })
    expect(params.has("from")).toBe(false)
    expect(params.has("to")).toBe(false)
  })

  it("authorsがセットされる", () => {
    const params = buildFilterParams({ authors: ["user1", "user2"] })
    expect(params.getAll("author")).toEqual(["user1", "user2"])
  })
})
