import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"

import { ProfileForm } from "./ProfileForm"

// next/navigation モック
const mockRefresh = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: mockRefresh,
  }),
}))

// Server Action モック
vi.mock("@/app/actions/profile", () => ({
  updateProfile: vi.fn(),
}))

import { updateProfile } from "@/app/actions/profile"
const mockUpdateProfile = vi.mocked(updateProfile)

const defaultProps = {
  email: "test@example.com",
  defaultValues: {
    displayName: "テストユーザー",
    bio: "自己紹介",
    xAccount: "test_user",
    birthday: "2000-01-01",
  },
}

describe("ProfileForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("レンダリング", () => {
    it("フォームの各フィールドが表示される", () => {
      render(<ProfileForm {...defaultProps} />)

      expect(screen.getByLabelText(/メールアドレス/)).toBeInTheDocument()
      expect(screen.getByLabelText(/表示名/)).toBeInTheDocument()
      expect(screen.getByLabelText(/自己紹介/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Xアカウント/)).toBeInTheDocument()
      expect(screen.getByLabelText(/生年月日/)).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "プロフィールを保存" })
      ).toBeInTheDocument()
    })

    it("初期値が設定されている", () => {
      render(<ProfileForm {...defaultProps} />)

      expect(screen.getByLabelText(/メールアドレス/)).toHaveValue(
        "test@example.com"
      )
      expect(screen.getByLabelText(/メールアドレス/)).toBeDisabled()
      expect(
        screen.getByPlaceholderText("表示名を入力してください")
      ).toHaveValue("テストユーザー")
      expect(
        screen.getByPlaceholderText(/自己紹介を入力してください/)
      ).toHaveValue("自己紹介")
    })
  })

  describe("バリデーション", () => {
    it("表示名が空の場合エラーが表示される", async () => {
      render(<ProfileForm {...defaultProps} />)

      const nameInput = screen.getByPlaceholderText("表示名を入力してください")
      await userEvent.clear(nameInput)

      const submitButton = screen.getByRole("button", {
        name: "プロフィールを保存",
      })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("表示名を入力してください")
        ).toBeInTheDocument()
      })
    })
  })

  describe("フォーム送信", () => {
    it("正常に送信されると成功メッセージが表示される", async () => {
      mockUpdateProfile.mockResolvedValueOnce({ success: true })

      render(<ProfileForm {...defaultProps} />)

      const submitButton = screen.getByRole("button", {
        name: "プロフィールを保存",
      })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(
          screen.getByText("プロフィールを保存しました")
        ).toBeInTheDocument()
      })

      expect(mockRefresh).toHaveBeenCalled()
    })

    it("送信エラー時にエラーメッセージが表示される", async () => {
      mockUpdateProfile.mockResolvedValueOnce({
        success: false,
        error: "プロフィールの更新に失敗しました",
      })

      render(<ProfileForm {...defaultProps} />)

      const submitButton = screen.getByRole("button", {
        name: "プロフィールを保存",
      })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("プロフィールの更新に失敗しました")
        ).toBeInTheDocument()
      })

      expect(mockRefresh).not.toHaveBeenCalled()
    })

    it("送信中はボタンが無効化される", async () => {
      mockUpdateProfile.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 1000)
          )
      )

      render(<ProfileForm {...defaultProps} />)

      const submitButton = screen.getByRole("button", {
        name: "プロフィールを保存",
      })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("保存中...")).toBeInTheDocument()
      })
    })
  })
})
