import { describe, it, expect } from "vitest"
import { getDateRangeEndDate, calculatePagination } from "./pagination"

describe("getDateRangeEndDate", () => {
  it("翌日の日付文字列を返す", () => {
    expect(getDateRangeEndDate("2024-01-15")).toBe("2024-01-16")
  })

  it("月末の場合は翌月1日を返す", () => {
    expect(getDateRangeEndDate("2024-01-31")).toBe("2024-02-01")
  })

  it("年末の場合は翌年1月1日を返す", () => {
    expect(getDateRangeEndDate("2024-12-31")).toBe("2025-01-01")
  })

  it("うるう年の2月28日の場合は2月29日を返す", () => {
    expect(getDateRangeEndDate("2024-02-28")).toBe("2024-02-29")
  })

  it("うるう年の2月29日の場合は3月1日を返す", () => {
    expect(getDateRangeEndDate("2024-02-29")).toBe("2024-03-01")
  })

  it("通常年の2月28日の場合は3月1日を返す", () => {
    expect(getDateRangeEndDate("2023-02-28")).toBe("2023-03-01")
  })
})

describe("calculatePagination", () => {
  describe("totalPagesの計算", () => {
    it("total=0の場合、totalPages=0を返す", () => {
      const result = calculatePagination(0, 1, 10)
      expect(result.totalPages).toBe(0)
    })

    it("totalがlimitより小さい場合、totalPages=1を返す", () => {
      const result = calculatePagination(5, 1, 10)
      expect(result.totalPages).toBe(1)
    })

    it("totalがlimitと等しい場合、totalPages=1を返す", () => {
      const result = calculatePagination(10, 1, 10)
      expect(result.totalPages).toBe(1)
    })

    it("totalがlimitより大きい場合、切り上げたtotalPagesを返す", () => {
      const result = calculatePagination(15, 1, 10)
      expect(result.totalPages).toBe(2)
    })

    it("totalがlimitの倍数の場合、正確なtotalPagesを返す", () => {
      const result = calculatePagination(30, 1, 10)
      expect(result.totalPages).toBe(3)
    })
  })

  describe("offsetの計算", () => {
    it("page=1の場合、offset=0を返す", () => {
      const result = calculatePagination(100, 1, 10)
      expect(result.offset).toBe(0)
    })

    it("page=2の場合、offset=limitを返す", () => {
      const result = calculatePagination(100, 2, 10)
      expect(result.offset).toBe(10)
    })

    it("page=3、limit=12の場合、offset=24を返す", () => {
      const result = calculatePagination(100, 3, 12)
      expect(result.offset).toBe(24)
    })

    it("limit=1の場合、offset=page-1を返す", () => {
      const result = calculatePagination(100, 5, 1)
      expect(result.offset).toBe(4)
    })
  })

  describe("境界値テスト", () => {
    it("大きな数値でも正しく計算できる", () => {
      const result = calculatePagination(1000000, 1000, 100)
      expect(result.totalPages).toBe(10000)
      expect(result.offset).toBe(99900)
    })

    it("limit=1でも正しく計算できる", () => {
      const result = calculatePagination(100, 50, 1)
      expect(result.totalPages).toBe(100)
      expect(result.offset).toBe(49)
    })
  })
})
