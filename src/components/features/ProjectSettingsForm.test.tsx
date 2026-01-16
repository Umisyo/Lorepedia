import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"

import { ProjectSettingsForm } from "./ProjectSettingsForm"
import type { ProjectWithTags } from "@/types/project"

// next/navigation モック
const mockRefresh = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

// Server Action モック
vi.mock("@/app/actions/project", () => ({
  updateProject: vi.fn(),
}))

// updateProject をインポートしてモック関数として使用
import { updateProject } from "@/app/actions/project"
const mockUpdateProject = vi.mocked(updateProject)

// テスト用プロジェクトデータ
const mockProject: ProjectWithTags = {
  id: "test-project-id",
  name: "テストプロジェクト",
  description: "テスト用の説明",
  is_public_editable: false,
  owner_id: "test-owner-id",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  tags: ["タグ1", "タグ2"],
}

describe("ProjectSettingsForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("レンダリング", () => {
    it("フォームの各フィールドが表示される", () => {
      render(<ProjectSettingsForm project={mockProject} />)

      // プロジェクト名フィールド
      expect(screen.getByLabelText(/プロジェクト名/)).toBeInTheDocument()

      // 概要フィールド
      expect(screen.getByLabelText(/概要/)).toBeInTheDocument()

      // 誰でも編集可能スイッチ
      expect(screen.getByText("誰でも編集可能にする")).toBeInTheDocument()

      // タグ入力フィールド
      expect(screen.getByText("プロジェクトタグ")).toBeInTheDocument()

      // ボタン
      expect(
        screen.getByRole("button", { name: "設定を保存" })
      ).toBeInTheDocument()
    })

    it("初期値がプロジェクトデータで設定されている", () => {
      render(<ProjectSettingsForm project={mockProject} />)

      // プロジェクト名
      const nameInput = screen.getByPlaceholderText(
        /例: ファンタジー世界「エルドラシア」/
      )
      expect(nameInput).toHaveValue("テストプロジェクト")

      // 概要
      const descriptionInput = screen.getByPlaceholderText(
        /プロジェクトの説明を入力してください/
      )
      expect(descriptionInput).toHaveValue("テスト用の説明")
    })
  })

  describe("バリデーション", () => {
    it("プロジェクト名が空の場合、送信時にエラーが表示される", async () => {
      render(<ProjectSettingsForm project={mockProject} />)

      // プロジェクト名を空にする
      const nameInput = screen.getByPlaceholderText(
        /例: ファンタジー世界「エルドラシア」/
      )
      await userEvent.clear(nameInput)

      const submitButton = screen.getByRole("button", {
        name: "設定を保存",
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
    it("正常に送信されると成功メッセージが表示される", async () => {
      mockUpdateProject.mockResolvedValueOnce({
        success: true,
      })

      render(<ProjectSettingsForm project={mockProject} />)

      // 送信
      const submitButton = screen.getByRole("button", {
        name: "設定を保存",
      })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateProject).toHaveBeenCalledWith("test-project-id", {
          name: "テストプロジェクト",
          description: "テスト用の説明",
          isPublicEditable: false,
          tags: ["タグ1", "タグ2"],
        })
      })

      await waitFor(() => {
        expect(
          screen.getByText("プロジェクト設定を保存しました")
        ).toBeInTheDocument()
      })

      // router.refresh が呼ばれることを確認
      expect(mockRefresh).toHaveBeenCalled()
    })

    it("送信エラー時にエラーメッセージが表示される", async () => {
      mockUpdateProject.mockResolvedValueOnce({
        success: false,
        error: "プロジェクトの更新に失敗しました",
      })

      render(<ProjectSettingsForm project={mockProject} />)

      // 送信
      const submitButton = screen.getByRole("button", {
        name: "設定を保存",
      })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("プロジェクトの更新に失敗しました")
        ).toBeInTheDocument()
      })

      // router.refresh が呼ばれないことを確認
      expect(mockRefresh).not.toHaveBeenCalled()
    })

    it("送信中はボタンが無効化される", async () => {
      // 送信を遅延させる
      mockUpdateProject.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 1000)
          )
      )

      render(<ProjectSettingsForm project={mockProject} />)

      // 送信
      const submitButton = screen.getByRole("button", {
        name: "設定を保存",
      })
      await userEvent.click(submitButton)

      // 送信中のUI確認
      await waitFor(() => {
        expect(screen.getByText("保存中...")).toBeInTheDocument()
      })
    })
  })
})
