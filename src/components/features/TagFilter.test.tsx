import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { TagFilter } from "./TagFilter"
import type { Tag } from "@/types/loreCard"

// テスト用データ
const mockTags: Tag[] = [
  {
    id: "tag-1",
    project_id: "project-1",
    name: "キャラクター",
    color: "#ff0000",
    created_at: "2026-01-15T00:00:00Z",
    created_by: null,
    description: null,
  },
  {
    id: "tag-2",
    project_id: "project-1",
    name: "設定",
    color: "#00ff00",
    created_at: "2026-01-15T00:00:00Z",
    created_by: null,
    description: null,
  },
  {
    id: "tag-3",
    project_id: "project-1",
    name: "世界観",
    color: "#0000ff",
    created_at: "2026-01-15T00:00:00Z",
    created_by: null,
    description: null,
  },
]

describe("TagFilter", () => {
  it("タグフィルタボタンが表示される", () => {
    const onChange = vi.fn()
    render(<TagFilter tags={mockTags} selectedIds={[]} onChange={onChange} />)

    expect(screen.getByRole("combobox")).toBeInTheDocument()
    expect(screen.getByText("タグで絞り込み")).toBeInTheDocument()
  })

  it("タグが選択されている場合、選択数が表示される", () => {
    const onChange = vi.fn()
    render(
      <TagFilter
        tags={mockTags}
        selectedIds={["tag-1", "tag-2"]}
        onChange={onChange}
      />
    )

    expect(screen.getByText("タグ (2)")).toBeInTheDocument()
  })

  it("選択されたタグがバッジとして表示される", () => {
    const onChange = vi.fn()
    render(
      <TagFilter
        tags={mockTags}
        selectedIds={["tag-1"]}
        onChange={onChange}
      />
    )

    expect(screen.getByText("キャラクター")).toBeInTheDocument()
  })

  it("クリアボタンをクリックすると全選択が解除される", () => {
    const onChange = vi.fn()
    render(
      <TagFilter
        tags={mockTags}
        selectedIds={["tag-1", "tag-2"]}
        onChange={onChange}
      />
    )

    const clearButton = screen.getByText("クリア")
    fireEvent.click(clearButton)

    expect(onChange).toHaveBeenCalledWith([])
  })

  it("タグがない場合はボタンが無効化される", () => {
    const onChange = vi.fn()
    render(<TagFilter tags={[]} selectedIds={[]} onChange={onChange} />)

    expect(screen.getByRole("combobox")).toBeDisabled()
  })

  it("disabled=trueの場合はボタンが無効化される", () => {
    const onChange = vi.fn()
    render(
      <TagFilter
        tags={mockTags}
        selectedIds={[]}
        onChange={onChange}
        disabled={true}
      />
    )

    expect(screen.getByRole("combobox")).toBeDisabled()
  })

  it("4つ以上のタグを選択すると「+N」バッジが表示される", () => {
    const onChange = vi.fn()
    const manyTags: Tag[] = [
      ...mockTags,
      {
        id: "tag-4",
        project_id: "project-1",
        name: "魔法",
        color: "#ffff00",
        created_at: "2026-01-15T00:00:00Z",
        created_by: null,
        description: null,
      },
    ]

    render(
      <TagFilter
        tags={manyTags}
        selectedIds={["tag-1", "tag-2", "tag-3", "tag-4"]}
        onChange={onChange}
      />
    )

    expect(screen.getByText("+1")).toBeInTheDocument()
  })
})
