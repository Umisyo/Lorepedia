/**
 * URLが安全かどうかを検証（XSS対策）
 * javascript:, data:, vbscript: などの危険なプロトコルを拒否
 */
export function isValidUrl(url: string): boolean {
  const trimmed = url.trim()
  // 空文字は無効
  if (!trimmed) return false
  // 相対URLは許可
  if (trimmed.startsWith("/")) return true
  // http/httpsのみ許可
  return /^https?:\/\//i.test(trimmed)
}
