import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-2xl rounded-2xl bg-primary/5 px-8 py-16 text-center">
        <h2 className="mb-4 text-3xl font-bold tracking-tight">
          今すぐ創作を始めよう
        </h2>
        <p className="mb-8 text-muted-foreground">
          無料で利用開始。あなたの世界観を共に創るパートナーを見つけましょう。
        </p>
        <Button size="lg" asChild>
          <Link href="/signup">
            無料で始める
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  )
}
