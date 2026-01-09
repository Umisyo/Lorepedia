import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator"

describe("PasswordStrengthIndicator", () => {
  describe("表示条件", () => {
    it("パスワードが空の場合は何も表示されない", () => {
      const { container } = render(<PasswordStrengthIndicator password="" />)
      expect(container.firstChild).toBeNull()
    })

    it("パスワードが入力されている場合は表示される", () => {
      render(<PasswordStrengthIndicator password="test" />)
      expect(screen.getByText(/パスワード強度:/)).toBeInTheDocument()
    })
  })

  describe("強度表示", () => {
    it("弱いパスワードの場合「弱い」と表示される", () => {
      render(<PasswordStrengthIndicator password="short" />)
      expect(screen.getByText("パスワード強度: 弱い")).toBeInTheDocument()
    })

    it("普通のパスワードの場合「普通」と表示される", () => {
      render(<PasswordStrengthIndicator password="password123" />)
      expect(screen.getByText("パスワード強度: 普通")).toBeInTheDocument()
    })

    it("強いパスワードの場合「強い」と表示される", () => {
      render(<PasswordStrengthIndicator password="Pass123!" />)
      expect(screen.getByText("パスワード強度: 強い")).toBeInTheDocument()
    })
  })

  describe("スタイル", () => {
    it("弱いパスワードは赤色のテキストで表示される", () => {
      render(<PasswordStrengthIndicator password="weak" />)
      const text = screen.getByText("パスワード強度: 弱い")
      expect(text).toHaveClass("text-red-600")
    })

    it("普通のパスワードは黄色のテキストで表示される", () => {
      render(<PasswordStrengthIndicator password="password123" />)
      const text = screen.getByText("パスワード強度: 普通")
      expect(text).toHaveClass("text-yellow-600")
    })

    it("強いパスワードは緑色のテキストで表示される", () => {
      render(<PasswordStrengthIndicator password="Pass123!" />)
      const text = screen.getByText("パスワード強度: 強い")
      expect(text).toHaveClass("text-green-600")
    })

    it("カスタムclassNameが適用される", () => {
      const { container } = render(
        <PasswordStrengthIndicator password="test" className="custom-class" />
      )
      expect(container.firstChild).toHaveClass("custom-class")
    })
  })
})
