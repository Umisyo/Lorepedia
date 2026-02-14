import Link from "next/link"
import { ArrowRight, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center px-4 py-24 text-center md:py-32">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <BookOpen className="h-8 w-8 text-primary" />
      </div>
      <h1 className="mb-6 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
        シェアード・ワールドを
        <br />
        共に創ろう
      </h1>
      <p className="mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
        Lorepediaは、複数の創作者が一つの世界観を共同で構築するための
        プラットフォームです。設定カードの作成・管理で、
        あなたの創作をもっと豊かに。
      </p>
      <div className="flex flex-col gap-4 sm:flex-row">
        <Button size="lg" asChild>
          <Link href="/signup">
            無料で始める
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href="/dashboard">ダッシュボードへ</Link>
        </Button>
      </div>
    </section>
  )
}
