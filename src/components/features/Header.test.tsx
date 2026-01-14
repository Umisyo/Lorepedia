import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Header } from "./Header"

// next-themesのモック
vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
    resolvedTheme: "light",
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// 共通のモックユーザー
const mockUser = {
  email: "test@example.com",
  avatarUrl: null,
}

describe("Header", () => {
  const mockOnLogout = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("共通要素", () => {
    it("ロゴが表示され、クリックでホームへ遷移するリンクになっている", () => {
      render(<Header user={null} onLogout={mockOnLogout} />)

      const logoLink = screen.getByRole("link", { name: /lorepedia/i })
      expect(logoLink).toBeInTheDocument()
      expect(logoLink).toHaveAttribute("href", "/")
    })

    it("ダークモードトグルが表示される", () => {
      render(<Header user={null} onLogout={mockOnLogout} />)

      // デスクトップとモバイル両方にあるため複数見つかる
      const toggleButtons = screen.getAllByRole("button", { name: /テーマを切り替え|ライトモードに切り替え|ダークモードに切り替え/i })
      expect(toggleButtons.length).toBeGreaterThan(0)
    })
  })

  describe("未ログイン時", () => {
    it("ログインボタンが表示される", () => {
      render(<Header user={null} onLogout={mockOnLogout} />)

      const loginButton = screen.getByRole("link", { name: "ログイン" })
      expect(loginButton).toBeInTheDocument()
      expect(loginButton).toHaveAttribute("href", "/login")
    })

    it("サインアップボタンが表示される", () => {
      render(<Header user={null} onLogout={mockOnLogout} />)

      const signupButton = screen.getByRole("link", { name: "サインアップ" })
      expect(signupButton).toBeInTheDocument()
      expect(signupButton).toHaveAttribute("href", "/signup")
    })

    it("ダッシュボードリンクは表示されない", () => {
      render(<Header user={null} onLogout={mockOnLogout} />)

      const dashboardLink = screen.queryByRole("link", { name: "ダッシュボード" })
      expect(dashboardLink).not.toBeInTheDocument()
    })

    it("ユーザーメニューは表示されない", () => {
      render(<Header user={null} onLogout={mockOnLogout} />)

      // ユーザーアバターボタンが存在しないことを確認
      const avatarButton = screen.queryByRole("button", { name: mockUser.email })
      expect(avatarButton).not.toBeInTheDocument()
    })
  })

  describe("ログイン時", () => {
    it("ダッシュボードリンクが表示される", () => {
      render(<Header user={mockUser} onLogout={mockOnLogout} />)

      const dashboardLink = screen.getByRole("link", { name: "ダッシュボード" })
      expect(dashboardLink).toBeInTheDocument()
      expect(dashboardLink).toHaveAttribute("href", "/dashboard")
    })

    it("ユーザーメニューが表示される", async () => {
      const user = userEvent.setup()
      render(<Header user={mockUser} onLogout={mockOnLogout} />)

      // アバターボタン（ユーザーメニュートリガー）を探す
      const header = screen.getByRole("banner")
      const desktopNav = within(header).getByRole("navigation", { hidden: true })
      const avatarButtons = within(desktopNav).getAllByRole("button")

      // アバターボタンは最初の方にあるはず
      const avatarButton = avatarButtons.find(btn => btn.className.includes("rounded-full"))
      expect(avatarButton).toBeDefined()

      // クリックしてメニューを開く
      await user.click(avatarButton!)

      // プロフィール設定リンクが表示される
      expect(await screen.findByText("プロフィール設定")).toBeInTheDocument()

      // ログアウトボタンが表示される
      expect(screen.getByText("ログアウト")).toBeInTheDocument()
    })

    it("ログインボタン・サインアップボタンは表示されない", () => {
      render(<Header user={mockUser} onLogout={mockOnLogout} />)

      // デスクトップナビゲーション内を確認
      const header = screen.getByRole("banner")
      const desktopNav = within(header).getByRole("navigation", { hidden: true })

      // デスクトップナビにはログインボタンがない
      const loginButton = within(desktopNav).queryByRole("link", { name: "ログイン" })
      const signupButton = within(desktopNav).queryByRole("link", { name: "サインアップ" })

      expect(loginButton).not.toBeInTheDocument()
      expect(signupButton).not.toBeInTheDocument()
    })

    it("ログアウトボタンをクリックするとonLogoutが呼ばれる", async () => {
      const user = userEvent.setup()
      render(<Header user={mockUser} onLogout={mockOnLogout} />)

      // アバターボタンを探す
      const header = screen.getByRole("banner")
      const desktopNav = within(header).getByRole("navigation", { hidden: true })
      const avatarButtons = within(desktopNav).getAllByRole("button")
      const avatarButton = avatarButtons.find(btn => btn.className.includes("rounded-full"))

      await user.click(avatarButton!)

      // ログアウトボタンをクリック
      const logoutButton = await screen.findByText("ログアウト")
      await user.click(logoutButton)

      expect(mockOnLogout).toHaveBeenCalledTimes(1)
    })
  })

  describe("レスポンシブ", () => {
    it("モバイルメニューボタンが表示される", () => {
      render(<Header user={null} onLogout={mockOnLogout} />)

      // モバイルメニューを開くハンバーガーボタン
      const menuButton = screen.getByRole("button", { name: /メニューを開く/i })
      expect(menuButton).toBeInTheDocument()
    })
  })
})
