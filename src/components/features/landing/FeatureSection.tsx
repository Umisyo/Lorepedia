import { Users, Sparkles, GitBranch, Tags } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const features = [
  {
    icon: Users,
    title: "共同編集",
    description: "複数の創作者がリアルタイムで世界観を構築。権限管理で安全にコラボレーション。",
  },
  {
    icon: Sparkles,
    title: "AI支援",
    description: "AIが設定の矛盾を検出し、新たなアイデアを提案。創作のパートナーとして活躍。",
  },
  {
    icon: GitBranch,
    title: "関係性グラフ",
    description: "設定カード間の依存・派生・矛盾関係を可視化。世界観の全体像を直感的に把握。",
  },
  {
    icon: Tags,
    title: "タグ管理",
    description: "カスタムタグで設定を分類・検索。フィルタリングで必要な情報にすぐアクセス。",
  },
] as const

export function FeatureSection() {
  return (
    <section className="px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight">
          創作を加速する機能
        </h2>
        <p className="mb-12 text-center text-muted-foreground">
          Lorepediaは、シェアード・ワールドの構築に必要なすべてを提供します
        </p>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/50 bg-card/50">
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
