import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"

import { OnboardingForm } from "./OnboardingForm"

// next/navigation モック
const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Server Action モック
vi.mock("@/app/actions/profile", () => ({
  completeOnboarding: vi.fn(),
}))

import { completeOnboarding } from "@/app/actions/profile"
const mockCompleteOnboarding = vi.mocked(completeOnboarding)

describe("OnboardingForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("レンダリング", () => {
    it("フォームの各要素が表示される", () => {
      render(<OnboardingForm />)

      expect(screen.getByLabelText(/表示名/)).toBeInTheDocument()
      expect(screen.getByRole("button", { name: "はじめる" })).toBeInTheDocument()
    })

    it("表示名の初期値が空である", () => {
      render(<OnboardingForm />)

      const input = screen.getByPlaceholderText("表示名を入力してください")
      expect(input).toHaveValue("")
    })
  })

  describe("バリデーション", () => {
    it("表示名が空の場合エラーが表示される", async () => {
      render(<OnboardingForm />)

      const submitButton = screen.getByRole("button", { name: "はじめる" })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("表示名を入力してください")).toBeInTheDocument()
      })
    })
  })

  describe("フォーム送信", () => {
    it("正常に送信されるとダッシュボードへ遷移する", async () => {
      mockCompleteOnboarding.mockResolvedValueOnce({ success: true })

      render(<OnboardingForm />)

      const input = screen.getByPlaceholderText("表示名を入力してください")
      await userEvent.type(input, "テストユーザー")

      const submitButton = screen.getByRole("button", { name: "はじめる" })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCompleteOnboarding).toHaveBeenCalledWith({
          displayName: "テストユーザー",
        })
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard")
      })
    })

    it("送信エラー時にエラーメッセージが表示される", async () => {
      mockCompleteOnboarding.mockResolvedValueOnce({
        success: false,
        error: "設定の保存に失敗しました",
      })

      render(<OnboardingForm />)

      const input = screen.getByPlaceholderText("表示名を入力してください")
      await userEvent.type(input, "テストユーザー")

      const submitButton = screen.getByRole("button", { name: "はじめる" })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("設定の保存に失敗しました")).toBeInTheDocument()
      })

      expect(mockPush).not.toHaveBeenCalled()
    })

    it("送信中はボタンが無効化される", async () => {
      mockCompleteOnboarding.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 1000))
      )

      render(<OnboardingForm />)

      const input = screen.getByPlaceholderText("表示名を入力してください")
      await userEvent.type(input, "テストユーザー")

      const submitButton = screen.getByRole("button", { name: "はじめる" })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("設定中...")).toBeInTheDocument()
      })
    })
  })
})
