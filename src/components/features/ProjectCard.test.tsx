import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { ProjectCard } from "./ProjectCard"
import type { ProjectWithMeta } from "@/types/project"

// date-fnsのモック
vi.mock("date-fns", () => ({
  formatDistanceToNow: () => "3日前",
}))

vi.mock("date-fns/locale", () => ({
  ja: {},
}))

// テスト用のプロジェクトデータ
const createMockProject = (
  overrides: Partial<ProjectWithMeta> = {}
): ProjectWithMeta => ({
  id: "project-1",
  name: "テストプロジェクト",
  description: "これはテスト用のプロジェクトです",
  owner_id: "user-1",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-10T00:00:00Z",
  memberCount: 5,
  myRole: "owner",
  ...overrides,
})

describe("ProjectCard", () => {
  it("プロジェクト名が表示される", () => {
    const project = createMockProject({ name: "マイプロジェクト" })
    render(<ProjectCard project={project} />)

    expect(screen.getByText("マイプロジェクト")).toBeInTheDocument()
  })

  it("説明文が表示される", () => {
    const project = createMockProject({ description: "プロジェクトの説明文" })
    render(<ProjectCard project={project} />)

    expect(screen.getByText("プロジェクトの説明文")).toBeInTheDocument()
  })

  it("説明文がない場合はデフォルトメッセージが表示される", () => {
    const project = createMockProject({ description: null })
    render(<ProjectCard project={project} />)

    expect(screen.getByText("説明はありません")).toBeInTheDocument()
  })

  it("メンバー数が表示される", () => {
    const project = createMockProject({ memberCount: 10 })
    render(<ProjectCard project={project} />)

    expect(screen.getByText("10")).toBeInTheDocument()
  })

  it("更新日が相対時間で表示される", () => {
    const project = createMockProject()
    render(<ProjectCard project={project} />)

    expect(screen.getByText("3日前")).toBeInTheDocument()
  })

  describe("ロールバッジ", () => {
    it("オーナーの場合「オーナー」バッジが表示される", () => {
      const project = createMockProject({ myRole: "owner" })
      render(<ProjectCard project={project} />)

      expect(screen.getByText("オーナー")).toBeInTheDocument()
    })

    it("編集者の場合「編集者」バッジが表示される", () => {
      const project = createMockProject({ myRole: "editor" })
      render(<ProjectCard project={project} />)

      expect(screen.getByText("編集者")).toBeInTheDocument()
    })

    it("閲覧者の場合「閲覧者」バッジが表示される", () => {
      const project = createMockProject({ myRole: "viewer" })
      render(<ProjectCard project={project} />)

      expect(screen.getByText("閲覧者")).toBeInTheDocument()
    })
  })

  it("プロジェクト詳細ページへのリンクになっている", () => {
    const project = createMockProject({ id: "test-project-id" })
    render(<ProjectCard project={project} />)

    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/projects/test-project-id")
  })
})
