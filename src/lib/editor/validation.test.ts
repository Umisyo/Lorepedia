import { describe, it, expect } from "vitest"
import { isValidUrl } from "./validation"

describe("isValidUrl", () => {
  describe("有効なURL", () => {
    it("https URLを受け入れる", () => {
      expect(isValidUrl("https://example.com")).toBe(true)
      expect(isValidUrl("https://example.com/path")).toBe(true)
      expect(isValidUrl("https://example.com/path?query=1")).toBe(true)
    })

    it("http URLを受け入れる", () => {
      expect(isValidUrl("http://example.com")).toBe(true)
      expect(isValidUrl("http://localhost:3000")).toBe(true)
    })

    it("相対URLを受け入れる", () => {
      expect(isValidUrl("/path/to/page")).toBe(true)
      expect(isValidUrl("/")).toBe(true)
    })

    it("大文字小文字を区別しない", () => {
      expect(isValidUrl("HTTPS://example.com")).toBe(true)
      expect(isValidUrl("HTTP://example.com")).toBe(true)
      expect(isValidUrl("Https://example.com")).toBe(true)
    })

    it("前後の空白を無視する", () => {
      expect(isValidUrl("  https://example.com  ")).toBe(true)
      expect(isValidUrl("\thttps://example.com\n")).toBe(true)
    })
  })

  describe("無効なURL（XSS対策）", () => {
    it("javascriptプロトコルを拒否する", () => {
      expect(isValidUrl("javascript:alert('xss')")).toBe(false)
      expect(isValidUrl("JAVASCRIPT:alert('xss')")).toBe(false)
    })

    it("dataプロトコルを拒否する", () => {
      expect(isValidUrl("data:text/html,<script>alert('xss')</script>")).toBe(
        false
      )
    })

    it("vbscriptプロトコルを拒否する", () => {
      expect(isValidUrl("vbscript:msgbox('xss')")).toBe(false)
    })

    it("空文字を拒否する", () => {
      expect(isValidUrl("")).toBe(false)
      expect(isValidUrl("   ")).toBe(false)
    })

    it("プロトコルなしのURLを拒否する", () => {
      expect(isValidUrl("example.com")).toBe(false)
      expect(isValidUrl("www.example.com")).toBe(false)
    })

    it("その他の危険なパターンを拒否する", () => {
      expect(isValidUrl("file:///etc/passwd")).toBe(false)
      expect(isValidUrl("ftp://example.com")).toBe(false)
    })
  })
})
