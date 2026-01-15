import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"

import { ProjectCreateForm } from "./ProjectCreateForm"

// next/navigation モック
const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Server Action モック
vi.mock("@/app/actions/project", () => ({
  createProject: vi.fn(),
}))

// createProject をインポートしてモック関数として使用
import { createProject } from "@/app/actions/project"
const mockCreateProject = vi.mocked(createProject)

describe("ProjectCreateForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("レンダリング", () => {
    it("フォームの各フィールドが表示される", () => {
      render(<ProjectCreateForm />)

      // プロジェクト名フィールド
      expect(screen.getByLabelText(/プロジェクト名/)).toBeInTheDocument()

      // 概要フィールド
      expect(screen.getByLabelText(/概要/)).toBeInTheDocument()

      // 誰でも編集可能スイッチ
      expect(screen.getByText("誰でも編集可能にする")).toBeInTheDocument()

      // タグ入力フィールド
      expect(screen.getByText("プロジェクトタグ")).toBeInTheDocument()

      // ボタン
      expect(screen.getByRole("button", { name: "キャンセル" })).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "プロジェクトを作成" })
      ).toBeInTheDocument()
    })
  })

  describe("バリデーション", () => {
    it("プロジェクト名が空の場合、送信時にエラーが表示される", async () => {
      render(<ProjectCreateForm />)

      const submitButton = screen.getByRole("button", {
        name: "プロジェクトを作成",
      })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("プロジェクト名を入力してください")
        ).toBeInTheDocument()
      })
    })
  })

  describe("フォーム送信", () => {
    it("正常に送信されるとプロジェクト詳細ページにリダイレクトされる", async () => {
      mockCreateProject.mockResolvedValueOnce({
        success: true,
        projectId: "test-project-id",
      })

      render(<ProjectCreateForm />)

      // プロジェクト名を入力
      const nameInput = screen.getByPlaceholderText(
        /例: ファンタジー世界「エルドラシア」/
      )
      await userEvent.type(nameInput, "テストプロジェクト")

      // 送信
      const submitButton = screen.getByRole("button", {
        name: "プロジェクトを作成",
      })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateProject).toHaveBeenCalledWith({
          name: "テストプロジェクト",
          description: "",
          isPublicEditable: false,
          tags: [],
        })
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/projects/test-project-id")
      })
    })

    it("送信エラー時にエラーメッセージが表示される", async () => {
      mockCreateProject.mockResolvedValueOnce({
        success: false,
        error: "プロジェクトの作成に失敗しました",
      })

      render(<ProjectCreateForm />)

      // プロジェクト名を入力
      const nameInput = screen.getByPlaceholderText(
        /例: ファンタジー世界「エルドラシア」/
      )
      await userEvent.type(nameInput, "テストプロジェクト")

      // 送信
      const submitButton = screen.getByRole("button", {
        name: "プロジェクトを作成",
      })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("プロジェクトの作成に失敗しました")
        ).toBeInTheDocument()
      })

      // リダイレクトされないことを確認
      expect(mockPush).not.toHaveBeenCalled()
    })

    it("送信中はボタンが無効化される", async () => {
      // 送信を遅延させる
      mockCreateProject.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ success: true, projectId: "test-id" }),
              1000
            )
          )
      )

      render(<ProjectCreateForm />)

      // プロジェクト名を入力
      const nameInput = screen.getByPlaceholderText(
        /例: ファンタジー世界「エルドラシア」/
      )
      await userEvent.type(nameInput, "テストプロジェクト")

      // 送信
      const submitButton = screen.getByRole("button", {
        name: "プロジェクトを作成",
      })
      await userEvent.click(submitButton)

      // 送信中のUI確認
      await waitFor(() => {
        expect(screen.getByText("作成中...")).toBeInTheDocument()
      })
    })
  })

  describe("キャンセル", () => {
    it("キャンセルボタンでダッシュボードにリダイレクトされる", async () => {
      render(<ProjectCreateForm />)

      const cancelButton = screen.getByRole("button", { name: "キャンセル" })
      await userEvent.click(cancelButton)

      expect(mockPush).toHaveBeenCalledWith("/dashboard")
    })
  })
})
