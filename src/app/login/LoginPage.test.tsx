import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from './page'

// next/navigationのモック
const mockSearchParams = new Map<string, string>()
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => mockSearchParams.get(key) ?? null,
  }),
}))

// Server Actionのモック
vi.mock('@/app/actions/auth', () => ({
  signInWithEmail: vi.fn(),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    mockSearchParams.clear()
    vi.clearAllMocks()
  })

  describe('レンダリング', () => {
    it('ログインページが正常に表示される', () => {
      render(<LoginPage />)

      expect(screen.getByText('ログイン')).toBeInTheDocument()
      expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument()
      expect(screen.getByLabelText('パスワード')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument()
    })

    it('パスワードリセットへのリンクが表示される', () => {
      render(<LoginPage />)

      expect(screen.getByText('パスワードを忘れた方')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'パスワードを忘れた方' })).toHaveAttribute(
        'href',
        '/reset-password'
      )
    })

    it('新規登録へのリンクが表示される', () => {
      render(<LoginPage />)

      expect(screen.getByText('新規登録')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: '新規登録' })).toHaveAttribute(
        'href',
        '/signup'
      )
    })

    it('Google OAuthボタンが表示される', () => {
      render(<LoginPage />)

      expect(screen.getByText('Googleでログイン')).toBeInTheDocument()
    })
  })

  describe('パスワード表示切り替え', () => {
    it('パスワードの表示/非表示を切り替えできる', async () => {
      const user = userEvent.setup()
      render(<LoginPage />)

      const passwordInput = screen.getByLabelText('パスワード')
      const toggleButton = screen.getByRole('button', { name: 'パスワードを表示' })

      // 初期状態はパスワード非表示
      expect(passwordInput).toHaveAttribute('type', 'password')

      // クリックでパスワード表示
      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
      expect(screen.getByRole('button', { name: 'パスワードを隠す' })).toBeInTheDocument()

      // 再クリックでパスワード非表示
      await user.click(screen.getByRole('button', { name: 'パスワードを隠す' }))
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('URLエラーパラメータ', () => {
    it('auth_failedエラー時にエラーメッセージが表示される', () => {
      mockSearchParams.set('error', 'auth_failed')
      render(<LoginPage />)

      expect(
        screen.getByText('Googleログインに失敗しました。再度お試しください')
      ).toBeInTheDocument()
    })

    it('missing_codeエラー時にエラーメッセージが表示される', () => {
      mockSearchParams.set('error', 'missing_code')
      render(<LoginPage />)

      expect(
        screen.getByText('認証コードが見つかりません。再度お試しください')
      ).toBeInTheDocument()
    })

    it('不明なエラーパラメータの場合はエラーメッセージが表示されない', () => {
      mockSearchParams.set('error', 'unknown_error')
      render(<LoginPage />)

      expect(
        screen.queryByText('Googleログインに失敗しました。再度お試しください')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByText('認証コードが見つかりません。再度お試しください')
      ).not.toBeInTheDocument()
    })
  })
})
