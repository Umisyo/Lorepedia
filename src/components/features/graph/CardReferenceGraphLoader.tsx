"use client"

import dynamic from "next/dynamic"
import type { GraphDataResult } from "@/app/actions/cardReference"

// バンドルサイズ対策: React Flowを動的インポート（ssr: falseはClient Componentでのみ使用可能）
const CardReferenceGraph = dynamic(
  () =>
    import("@/components/features/graph/CardReferenceGraph").then(
      (mod) => mod.CardReferenceGraph
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <p className="text-muted-foreground">グラフを読み込み中...</p>
      </div>
    ),
  }
)

type CardReferenceGraphLoaderProps = {
  data: GraphDataResult
  projectId: string
}

export function CardReferenceGraphLoader({
  data,
  projectId,
}: CardReferenceGraphLoaderProps) {
  return <CardReferenceGraph data={data} projectId={projectId} />
}
