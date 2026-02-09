import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { HeroSection } from "./HeroSection"

describe("HeroSection", () => {
  it("メインの見出しが表示される", () => {
    render(<HeroSection />)
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "シェアード・ワールドを共に創ろう"
    )
  })

  it("サインアップへのCTAリンクが表示される", () => {
    render(<HeroSection />)
    const signupLink = screen.getByRole("link", { name: /無料で始める/ })
    expect(signupLink).toHaveAttribute("href", "/signup")
  })

  it("ダッシュボードへのリンクが表示される", () => {
    render(<HeroSection />)
    const dashboardLink = screen.getByRole("link", { name: "ダッシュボードへ" })
    expect(dashboardLink).toHaveAttribute("href", "/dashboard")
  })
})
