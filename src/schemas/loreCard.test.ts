import { describe, it, expect } from "vitest"
import {
  createLoreCardSchema,
  updateLoreCardSchema,
  editLoreCardSchema,
} from "./loreCard"

describe("createLoreCardSchema", () => {
  it("有効なデータでパースが成功する", () => {
    const result = createLoreCardSchema.safeParse({
      title: "テストタイトル",
      content: "テスト内容",
      tagIds: ["tag-1", "tag-2"],
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe("テストタイトル")
      expect(result.data.content).toBe("テスト内容")
      expect(result.data.tagIds).toEqual(["tag-1", "tag-2"])
    }
  })

  it("tagIdsが省略された場合、空配列がデフォルト値になる", () => {
    const result = createLoreCardSchema.safeParse({
      title: "テスト",
      content: "内容",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tagIds).toEqual([])
    }
  })

  it("タイトルが空の場合はバリデーションエラー", () => {
    const result = createLoreCardSchema.safeParse({
      title: "",
      content: "テスト内容",
    })
    expect(result.success).toBe(false)
  })

  it("タイトルが200文字を超える場合はバリデーションエラー", () => {
    const result = createLoreCardSchema.safeParse({
      title: "あ".repeat(201),
      content: "テスト内容",
    })
    expect(result.success).toBe(false)
  })

  it("タイトルが200文字ちょうどの場合はパースが成功する", () => {
    const result = createLoreCardSchema.safeParse({
      title: "あ".repeat(200),
      content: "テスト内容",
    })
    expect(result.success).toBe(true)
  })

  it("詳細が空の場合はバリデーションエラー", () => {
    const result = createLoreCardSchema.safeParse({
      title: "テスト",
      content: "",
    })
    expect(result.success).toBe(false)
  })

  it("詳細が50000文字を超える場合はバリデーションエラー", () => {
    const result = createLoreCardSchema.safeParse({
      title: "テスト",
      content: "あ".repeat(50001),
    })
    expect(result.success).toBe(false)
  })

  it("詳細が50000文字ちょうどの場合はパースが成功する", () => {
    const result = createLoreCardSchema.safeParse({
      title: "テスト",
      content: "あ".repeat(50000),
    })
    expect(result.success).toBe(true)
  })

  it("タイトルが未指定の場合はバリデーションエラー", () => {
    const result = createLoreCardSchema.safeParse({
      content: "テスト内容",
    })
    expect(result.success).toBe(false)
  })

  it("詳細が未指定の場合はバリデーションエラー", () => {
    const result = createLoreCardSchema.safeParse({
      title: "テスト",
    })
    expect(result.success).toBe(false)
  })
})

describe("updateLoreCardSchema", () => {
  it("タイトルのみの部分更新が成功する", () => {
    const result = updateLoreCardSchema.safeParse({
      title: "更新タイトル",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBe("更新タイトル")
      expect(result.data.content).toBeUndefined()
    }
  })

  it("詳細のみの部分更新が成功する", () => {
    const result = updateLoreCardSchema.safeParse({
      content: "更新内容",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.title).toBeUndefined()
      expect(result.data.content).toBe("更新内容")
    }
  })

  it("空オブジェクトでもパースが成功する", () => {
    const result = updateLoreCardSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it("タイトルが空文字の場合はバリデーションエラー", () => {
    const result = updateLoreCardSchema.safeParse({
      title: "",
    })
    expect(result.success).toBe(false)
  })

  it("タイトルが200文字を超える場合はバリデーションエラー", () => {
    const result = updateLoreCardSchema.safeParse({
      title: "あ".repeat(201),
    })
    expect(result.success).toBe(false)
  })
})

describe("editLoreCardSchema", () => {
  it("createLoreCardSchemaと同じバリデーションが適用される", () => {
    const result = editLoreCardSchema.safeParse({
      title: "編集テスト",
      content: "編集内容",
    })
    expect(result.success).toBe(true)
  })

  it("タイトルが空の場合はバリデーションエラー", () => {
    const result = editLoreCardSchema.safeParse({
      title: "",
      content: "編集内容",
    })
    expect(result.success).toBe(false)
  })
})
