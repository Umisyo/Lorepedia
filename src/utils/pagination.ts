// ページネーション関連のユーティリティ関数

// 日付範囲のフィルタ終了日を計算（翌日の0時を返す）
export function getDateRangeEndDate(dateTo: string): string {
  const endDate = new Date(dateTo)
  endDate.setDate(endDate.getDate() + 1)
  return endDate.toISOString().split("T")[0]
}

// ページネーション情報を計算
export function calculatePagination(
  total: number,
  page: number,
  limit: number
): { totalPages: number; offset: number } {
  const totalPages = Math.ceil(total / limit)
  const offset = (page - 1) * limit
  return { totalPages, offset }
}
