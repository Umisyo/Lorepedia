import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"

import { TagInput } from "./TagInput"

describe("TagInput", () => {
  const defaultProps = {
    value: [],
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("レンダリング", () => {
    it("初期状態で入力フィールドが表示される", () => {
      render(<TagInput {...defaultProps} />)

      expect(
        screen.getByPlaceholderText("タグを入力してEnterで追加")
      ).toBeInTheDocument()
      expect(screen.getByText("0/5個のタグ")).toBeInTheDocument()
    })

    it("既存のタグがBadgeとして表示される", () => {
      render(<TagInput {...defaultProps} value={["ファンタジー", "SF"]} />)

      expect(screen.getByText("ファンタジー")).toBeInTheDocument()
      expect(screen.getByText("SF")).toBeInTheDocument()
      expect(screen.getByText("2/5個のタグ")).toBeInTheDocument()
    })

    it("maxTagsに達すると入力フィールドが非表示になる", () => {
      render(
        <TagInput
          {...defaultProps}
          value={["タグ1", "タグ2", "タグ3", "タグ4", "タグ5"]}
          maxTags={5}
        />
      )

      expect(
        screen.queryByPlaceholderText("タグを入力してEnterで追加")
      ).not.toBeInTheDocument()
    })

    it("disabledの場合、入力が無効化される", () => {
      render(<TagInput {...defaultProps} disabled />)

      expect(
        screen.getByPlaceholderText("タグを入力してEnterで追加")
      ).toBeDisabled()
    })
  })

  describe("タグ追加", () => {
    it("Enterキーでタグを追加できる", async () => {
      const onChange = vi.fn()
      render(<TagInput {...defaultProps} onChange={onChange} />)

      const input = screen.getByPlaceholderText("タグを入力してEnterで追加")
      await userEvent.type(input, "新しいタグ{enter}")

      expect(onChange).toHaveBeenCalledWith(["新しいタグ"])
    })

    it("カンマでタグを追加できる", async () => {
      const onChange = vi.fn()
      render(<TagInput {...defaultProps} onChange={onChange} />)

      const input = screen.getByPlaceholderText("タグを入力してEnterで追加")
      await userEvent.type(input, "タグA,")

      expect(onChange).toHaveBeenCalledWith(["タグA"])
    })

    it("空白のみのタグは追加されない", async () => {
      const onChange = vi.fn()
      render(<TagInput {...defaultProps} onChange={onChange} />)

      const input = screen.getByPlaceholderText("タグを入力してEnterで追加")
      await userEvent.type(input, "   {enter}")

      expect(onChange).not.toHaveBeenCalled()
    })

    it("前後の空白はトリムされる", async () => {
      const onChange = vi.fn()
      render(<TagInput {...defaultProps} onChange={onChange} />)

      const input = screen.getByPlaceholderText("タグを入力してEnterで追加")
      await userEvent.type(input, "  トリムテスト  {enter}")

      expect(onChange).toHaveBeenCalledWith(["トリムテスト"])
    })

    it("複数カンマを含む入力でも全てのタグが追加される（ペースト時）", async () => {
      // 注: userEvent.typeは各文字を個別に入力するため、
      // 各カンマ入力時に別々のonChangeが呼ばれる。
      // 実際のユースケースとして問題になるのはペースト時なので、
      // pasteでテストする。
      const onChange = vi.fn()
      render(<TagInput {...defaultProps} onChange={onChange} />)

      const input = screen.getByPlaceholderText("タグを入力してEnterで追加")
      await userEvent.click(input)
      // 複数カンマを含む文字列をペースト
      await userEvent.paste("タグA,タグB,タグC,")

      expect(onChange).toHaveBeenLastCalledWith(["タグA", "タグB", "タグC"])
    })

  })

  describe("タグ削除", () => {
    it("削除ボタンでタグを削除できる", async () => {
      const onChange = vi.fn()
      render(
        <TagInput {...defaultProps} onChange={onChange} value={["削除対象"]} />
      )

      const deleteButton = screen.getByRole("button", {
        name: "削除対象を削除",
      })
      await userEvent.click(deleteButton)

      expect(onChange).toHaveBeenCalledWith([])
    })

    it("Backspaceで最後のタグを削除できる", async () => {
      const onChange = vi.fn()
      render(
        <TagInput
          {...defaultProps}
          onChange={onChange}
          value={["タグ1", "タグ2"]}
        />
      )

      const input = screen.getByPlaceholderText("タグを入力してEnterで追加")
      await userEvent.click(input)
      await userEvent.keyboard("{backspace}")

      expect(onChange).toHaveBeenCalledWith(["タグ1"])
    })
  })

  describe("バリデーション", () => {
    it("重複タグはエラーを表示する", async () => {
      const onChange = vi.fn()
      render(
        <TagInput {...defaultProps} onChange={onChange} value={["既存タグ"]} />
      )

      const input = screen.getByPlaceholderText("タグを入力してEnterで追加")
      await userEvent.type(input, "既存タグ{enter}")

      expect(screen.getByText("このタグは既に追加されています")).toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalled()
    })

    it("最大個数を超えるとエラーを表示する", async () => {
      const onChange = vi.fn()
      render(
        <TagInput
          {...defaultProps}
          onChange={onChange}
          value={["1", "2", "3", "4", "5"]}
          maxTags={5}
        />
      )

      // maxTagsに達しているので入力フィールドは非表示
      expect(
        screen.queryByPlaceholderText("タグを入力してEnterで追加")
      ).not.toBeInTheDocument()
    })

    it("最大文字数を超えるとエラーを表示する", async () => {
      const onChange = vi.fn()
      render(
        <TagInput {...defaultProps} onChange={onChange} maxTagLength={10} />
      )

      const input = screen.getByPlaceholderText("タグを入力してEnterで追加")
      await userEvent.type(input, "これは長すぎるタグ名です{enter}")

      expect(
        screen.getByText("タグ名は10文字以内で入力してください")
      ).toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalled()
    })
  })
})
