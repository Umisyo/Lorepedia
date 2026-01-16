import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"

import { LoreCardForm } from "./LoreCardForm"

// next/navigation モック
const mockPush = vi.fn()
const mockBack = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}))

// Server Action モック
vi.mock("@/app/actions/loreCard", () => ({
  createLoreCard: vi.fn(),
  updateLoreCard: vi.fn(),
}))

vi.mock("@/app/actions/tag", () => ({
  updateCardTags: vi.fn(),
}))

// Server Action をインポートしてモック関数として使用
import { createLoreCard, updateLoreCard } from "@/app/actions/loreCard"
import { updateCardTags } from "@/app/actions/tag"
const mockCreateLoreCard = vi.mocked(createLoreCard)
const mockUpdateLoreCard = vi.mocked(updateLoreCard)
const mockUpdateCardTags = vi.mocked(updateCardTags)

describe("LoreCardForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // デフォルトでupdateCardTagsは成功するようにモック
    mockUpdateCardTags.mockResolvedValue({ success: true })
  })

  describe("レンダリング", () => {
    it("作成モードでフォームが表示される", () => {
      render(<LoreCardForm projectId="project-1" />)

      expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument()
      expect(screen.getByLabelText(/詳細/)).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "カードを作成" })
      ).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "キャンセル" })
      ).toBeInTheDocument()
    })

    it("編集モードでフォームが表示される", () => {
      render(
        <LoreCardForm
          projectId="project-1"
          mode="edit"
          cardId="card-1"
          defaultValues={{
            title: "テストタイトル",
            content: "テストコンテンツ",
          }}
        />
      )

      expect(screen.getByLabelText(/タイトル/)).toBeInTheDocument()
      expect(screen.getByLabelText(/詳細/)).toBeInTheDocument()
      expect(
        screen.getByRole("button", { name: "カードを更新" })
      ).toBeInTheDocument()
    })

    it("編集モードで初期値が正しく設定される", () => {
      render(
        <LoreCardForm
          projectId="project-1"
          mode="edit"
          cardId="card-1"
          defaultValues={{
            title: "テストタイトル",
            content: "テストコンテンツ",
          }}
        />
      )

      expect(screen.getByDisplayValue("テストタイトル")).toBeInTheDocument()
      expect(screen.getByDisplayValue("テストコンテンツ")).toBeInTheDocument()
    })
  })

  describe("バリデーション", () => {
    it("タイトルが空の場合、送信時にエラーが表示される", async () => {
      render(<LoreCardForm projectId="project-1" />)

      const submitButton = screen.getByRole("button", { name: "カードを作成" })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("タイトルを入力してください")
        ).toBeInTheDocument()
      })
    })

    it("詳細が空の場合、送信時にエラーが表示される", async () => {
      render(<LoreCardForm projectId="project-1" />)

      // タイトルのみ入力
      const titleInput = screen.getByPlaceholderText("カードのタイトルを入力")
      await userEvent.type(titleInput, "テストタイトル")

      const submitButton = screen.getByRole("button", { name: "カードを作成" })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("詳細を入力してください")).toBeInTheDocument()
      })
    })
  })

  describe("作成モード", () => {
    it("正常に送信されるとカード詳細ページにリダイレクトされる", async () => {
      mockCreateLoreCard.mockResolvedValueOnce({
        success: true,
        data: { id: "new-card-id" },
      })

      render(<LoreCardForm projectId="project-1" />)

      // フォーム入力
      const titleInput = screen.getByPlaceholderText("カードのタイトルを入力")
      await userEvent.type(titleInput, "テストタイトル")

      const contentInput = screen.getByPlaceholderText(
        "世界設定の詳細を入力..."
      )
      await userEvent.type(contentInput, "テストコンテンツ")

      // 送信
      const submitButton = screen.getByRole("button", { name: "カードを作成" })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateLoreCard).toHaveBeenCalledWith("project-1", {
          title: "テストタイトル",
          content: "テストコンテンツ",
          tagIds: [],
        })
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/projects/project-1/cards/new-card-id")
      })
    })

    it("作成エラー時にエラーメッセージが表示される", async () => {
      mockCreateLoreCard.mockResolvedValueOnce({
        success: false,
        error: "カードの作成に失敗しました",
      })

      render(<LoreCardForm projectId="project-1" />)

      // フォーム入力
      const titleInput = screen.getByPlaceholderText("カードのタイトルを入力")
      await userEvent.type(titleInput, "テストタイトル")

      const contentInput = screen.getByPlaceholderText(
        "世界設定の詳細を入力..."
      )
      await userEvent.type(contentInput, "テストコンテンツ")

      // 送信
      const submitButton = screen.getByRole("button", { name: "カードを作成" })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("カードの作成に失敗しました")
        ).toBeInTheDocument()
      })

      // リダイレクトされないことを確認
      expect(mockPush).not.toHaveBeenCalled()
    })

    it("送信中はボタンが「作成中...」になる", async () => {
      mockCreateLoreCard.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ success: true, data: { id: "new-card-id" } }),
              1000
            )
          )
      )

      render(<LoreCardForm projectId="project-1" />)

      // フォーム入力
      const titleInput = screen.getByPlaceholderText("カードのタイトルを入力")
      await userEvent.type(titleInput, "テストタイトル")

      const contentInput = screen.getByPlaceholderText(
        "世界設定の詳細を入力..."
      )
      await userEvent.type(contentInput, "テストコンテンツ")

      // 送信
      const submitButton = screen.getByRole("button", { name: "カードを作成" })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("作成中...")).toBeInTheDocument()
      })
    })
  })

  describe("編集モード", () => {
    it("正常に送信されるとカード詳細ページにリダイレクトされる", async () => {
      mockUpdateLoreCard.mockResolvedValueOnce({
        success: true,
        data: { id: "card-1" },
      })

      render(
        <LoreCardForm
          projectId="project-1"
          mode="edit"
          cardId="card-1"
          defaultValues={{
            title: "元のタイトル",
            content: "元のコンテンツ",
          }}
        />
      )

      // タイトルを更新
      const titleInput = screen.getByDisplayValue("元のタイトル")
      await userEvent.clear(titleInput)
      await userEvent.type(titleInput, "更新後タイトル")

      // 送信
      const submitButton = screen.getByRole("button", { name: "カードを更新" })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateLoreCard).toHaveBeenCalledWith(
          "project-1",
          "card-1",
          {
            title: "更新後タイトル",
            content: "元のコンテンツ",
            tagIds: [],
          }
        )
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/projects/project-1/cards/card-1")
      })
    })

    it("更新エラー時にエラーメッセージが表示される", async () => {
      mockUpdateLoreCard.mockResolvedValueOnce({
        success: false,
        error: "カードの更新に失敗しました",
      })

      render(
        <LoreCardForm
          projectId="project-1"
          mode="edit"
          cardId="card-1"
          defaultValues={{
            title: "元のタイトル",
            content: "元のコンテンツ",
          }}
        />
      )

      // 送信
      const submitButton = screen.getByRole("button", { name: "カードを更新" })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(
          screen.getByText("カードの更新に失敗しました")
        ).toBeInTheDocument()
      })

      // リダイレクトされないことを確認
      expect(mockPush).not.toHaveBeenCalled()
    })

    it("送信中はボタンが「更新中...」になる", async () => {
      mockUpdateLoreCard.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ success: true, data: { id: "card-1" } }),
              1000
            )
          )
      )

      render(
        <LoreCardForm
          projectId="project-1"
          mode="edit"
          cardId="card-1"
          defaultValues={{
            title: "元のタイトル",
            content: "元のコンテンツ",
          }}
        />
      )

      // 送信
      const submitButton = screen.getByRole("button", { name: "カードを更新" })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText("更新中...")).toBeInTheDocument()
      })
    })
  })

  describe("キャンセル", () => {
    it("キャンセルボタンで前のページに戻る", async () => {
      render(<LoreCardForm projectId="project-1" />)

      const cancelButton = screen.getByRole("button", { name: "キャンセル" })
      await userEvent.click(cancelButton)

      expect(mockBack).toHaveBeenCalled()
    })
  })

  describe("タグ機能", () => {
    const mockTags = [
      { id: "tag-1", name: "キャラクター", color: "#FF0000", project_id: "project-1", created_at: "2024-01-01T00:00:00Z" },
      { id: "tag-2", name: "世界観", color: "#00FF00", project_id: "project-1", created_at: "2024-01-01T00:00:00Z" },
    ]

    it("タグフィールドが表示される", () => {
      render(<LoreCardForm projectId="project-1" availableTags={mockTags} />)

      // フォームラベルとして「タグ」が表示されることを確認
      expect(screen.getByText("タグ")).toBeInTheDocument()
      expect(screen.getByText("カードに関連するタグを選択")).toBeInTheDocument()
    })

    it("編集モードで初期タグが設定される", () => {
      render(
        <LoreCardForm
          projectId="project-1"
          mode="edit"
          cardId="card-1"
          defaultValues={{
            title: "テストタイトル",
            content: "テストコンテンツ",
            tagIds: ["tag-1"],
          }}
          availableTags={mockTags}
        />
      )

      // タグ (1) のような表示を確認
      expect(screen.getByText(/タグ.*1/)).toBeInTheDocument()
    })

    it("作成時にタグが送信される", async () => {
      mockCreateLoreCard.mockResolvedValueOnce({
        success: true,
        data: { id: "new-card-id" },
      })
      mockUpdateCardTags.mockResolvedValueOnce({ success: true })

      render(<LoreCardForm projectId="project-1" availableTags={mockTags} />)

      // フォーム入力
      const titleInput = screen.getByPlaceholderText("カードのタイトルを入力")
      await userEvent.type(titleInput, "テストタイトル")

      const contentInput = screen.getByPlaceholderText(
        "世界設定の詳細を入力..."
      )
      await userEvent.type(contentInput, "テストコンテンツ")

      // タグを選択
      const tagFilterButton = screen.getByRole("combobox")
      await userEvent.click(tagFilterButton)

      // ポップオーバー内のタグをクリック
      const tagButton = await screen.findByText("キャラクター")
      await userEvent.click(tagButton)

      // 送信
      const submitButton = screen.getByRole("button", { name: "カードを作成" })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockCreateLoreCard).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(mockUpdateCardTags).toHaveBeenCalledWith(
          "project-1",
          "new-card-id",
          ["tag-1"]
        )
      })
    })

    it("編集時にタグが更新される", async () => {
      mockUpdateLoreCard.mockResolvedValueOnce({
        success: true,
        data: { id: "card-1" },
      })
      mockUpdateCardTags.mockResolvedValueOnce({ success: true })

      render(
        <LoreCardForm
          projectId="project-1"
          mode="edit"
          cardId="card-1"
          defaultValues={{
            title: "元のタイトル",
            content: "元のコンテンツ",
            tagIds: ["tag-1"],
          }}
          availableTags={mockTags}
        />
      )

      // 送信
      const submitButton = screen.getByRole("button", { name: "カードを更新" })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockUpdateLoreCard).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(mockUpdateCardTags).toHaveBeenCalledWith(
          "project-1",
          "card-1",
          ["tag-1"]
        )
      })
    })
  })
})
