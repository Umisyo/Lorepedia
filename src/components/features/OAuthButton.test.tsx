import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { OAuthButton } from './OAuthButton'

// Server Actionのモック
const mockSignInWithGoogle = vi.fn()

vi.mock('@/app/actions/auth', () => ({
  signInWithGoogle: () => mockSignInWithGoogle(),
}))

describe('OAuthButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('レンダリング', () => {
    it('Googleでログインボタンが表示される', () => {
      render(<OAuthButton />)

      expect(screen.getByRole('button', { name: /Googleでログイン/i })).toBeInTheDocument()
    })

    it('Googleアイコンが表示される', () => {
      render(<OAuthButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      expect(button.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('クリックイベント', () => {
    it('クリック時にsignInWithGoogleが呼ばれる', async () => {
      mockSignInWithGoogle.mockResolvedValue({})
      const user = userEvent.setup()

      render(<OAuthButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      await user.click(button)

      expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1)
    })

    it('ローディング中は「ログイン中...」と表示される', async () => {
      // 遅延するPromiseを設定
      mockSignInWithGoogle.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({}), 100))
      )
      const user = userEvent.setup()

      render(<OAuthButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      await user.click(button)

      expect(screen.getByText('ログイン中...')).toBeInTheDocument()
      expect(button).toBeDisabled()
    })

    it('エラー時にエラーメッセージが表示される', async () => {
      mockSignInWithGoogle.mockResolvedValue({ error: 'Googleログインに失敗しました' })
      const user = userEvent.setup()

      render(<OAuthButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('Googleログインに失敗しました')).toBeInTheDocument()
      })
    })

    it('例外発生時にエラーメッセージが表示される', async () => {
      mockSignInWithGoogle.mockRejectedValue(new Error('Network error'))
      const user = userEvent.setup()

      render(<OAuthButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })
      await user.click(button)

      await waitFor(() => {
        expect(screen.getByText('Googleログインに失敗しました')).toBeInTheDocument()
      })
    })

    it('再クリック時にエラーがクリアされる', async () => {
      // 1回目はエラー、2回目は成功
      mockSignInWithGoogle
        .mockResolvedValueOnce({ error: 'Googleログインに失敗しました' })
        .mockResolvedValueOnce({})

      const user = userEvent.setup()
      render(<OAuthButton />)

      const button = screen.getByRole('button', { name: /Googleでログイン/i })

      // 1回目のクリックでエラー表示
      await user.click(button)
      await waitFor(() => {
        expect(screen.getByText('Googleログインに失敗しました')).toBeInTheDocument()
      })

      // 2回目のクリックでエラーがクリアされる
      await user.click(button)
      await waitFor(() => {
        expect(screen.queryByText('Googleログインに失敗しました')).not.toBeInTheDocument()
      })
    })
  })
})
