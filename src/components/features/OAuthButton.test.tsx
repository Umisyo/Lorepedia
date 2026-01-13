import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { OAuthButton } from "./OAuthButton"

describe("OAuthButton", () => {
  describe("表示", () => {
    it("サインアップモードで「Googleで登録」と表示される", () => {
      render(
        <OAuthButton provider="google" mode="signup" onClick={() => {}} />
      )
      expect(screen.getByText("Googleで登録")).toBeInTheDocument()
    })

    it("ログインモードで「Googleでログイン」と表示される", () => {
      render(
        <OAuthButton provider="google" mode="login" onClick={() => {}} />
      )
      expect(screen.getByText("Googleでログイン")).toBeInTheDocument()
    })

    it("Googleアイコンが表示される", () => {
      render(
        <OAuthButton provider="google" mode="signup" onClick={() => {}} />
      )
      // SVGアイコンの存在を確認
      const button = screen.getByRole("button")
      const svg = button.querySelector("svg")
      expect(svg).toBeInTheDocument()
    })
  })

  describe("クリック動作", () => {
    it("ボタンクリック時にonClickが呼ばれる", () => {
      const handleClick = vi.fn()
      render(
        <OAuthButton provider="google" mode="signup" onClick={handleClick} />
      )

      const button = screen.getByRole("button")
      fireEvent.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("disabled時はクリックできない", () => {
      const handleClick = vi.fn()
      render(
        <OAuthButton
          provider="google"
          mode="signup"
          onClick={handleClick}
          disabled
        />
      )

      const button = screen.getByRole("button")
      expect(button).toBeDisabled()

      fireEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe("スタイル", () => {
    it("カスタムclassNameが適用される", () => {
      render(
        <OAuthButton
          provider="google"
          mode="signup"
          onClick={() => {}}
          className="custom-class"
        />
      )

      const button = screen.getByRole("button")
      expect(button).toHaveClass("custom-class")
    })

    it("w-fullクラスが適用される", () => {
      render(
        <OAuthButton provider="google" mode="signup" onClick={() => {}} />
      )

      const button = screen.getByRole("button")
      expect(button).toHaveClass("w-full")
    })
  })
})
