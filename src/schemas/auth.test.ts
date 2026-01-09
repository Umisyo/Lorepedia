import { describe, it, expect } from 'vitest'
import { loginSchema } from './auth'

describe('loginSchema', () => {
  describe('正常系', () => {
    it('有効なメールアドレスとパスワードを受け入れる', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('emailのバリデーション', () => {
    it('メールアドレスが空の場合エラーを返す', () => {
      const result = loginSchema.safeParse({
        email: '',
        password: 'password123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toContain(
          'メールアドレスは必須です'
        )
      }
    })

    it('メールアドレス形式が不正な場合エラーを返す', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.email).toContain(
          '正しいメール形式で入力してください'
        )
      }
    })
  })

  describe('passwordのバリデーション', () => {
    it('パスワードが空の場合エラーを返す', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toContain(
          'パスワードは必須です'
        )
      }
    })

    it('パスワードが8文字未満の場合エラーを返す', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '1234567',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.password).toContain(
          'パスワードは8文字以上で入力してください'
        )
      }
    })

    it('パスワードが8文字の場合は成功する（境界値）', () => {
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '12345678',
      })
      expect(result.success).toBe(true)
    })
  })
})
