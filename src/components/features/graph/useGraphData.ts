import { useMemo } from "react"
import type { Node, Edge } from "@xyflow/react"
import type { CardNodeData, ReferenceType } from "@/types/loreCard"
import type { GraphCardData, GraphDataResult } from "@/app/actions/cardReference"

// 参照タイプごとのエッジスタイル
const edgeStyles: Record<
  ReferenceType,
  { stroke: string; strokeDasharray?: string; strokeWidth: number }
> = {
  depends_on: { stroke: "#3b82f6", strokeWidth: 2 },
  derives_from: { stroke: "#22c55e", strokeDasharray: "5 5", strokeWidth: 2 },
  contradicts: { stroke: "#ef4444", strokeWidth: 2 },
  related: { stroke: "#9ca3af", strokeDasharray: "2 4", strokeWidth: 1 },
  mentions: { stroke: "#60a5fa", strokeDasharray: "1 3", strokeWidth: 1 },
}

// 参照タイプのラベル
const edgeLabels: Record<ReferenceType, string> = {
  depends_on: "依存",
  derives_from: "派生元",
  contradicts: "矛盾",
  related: "関連",
  mentions: "言及",
}

// グラフデータを変換するフック
export function useGraphData(
  data: GraphDataResult | null,
  projectId: string
) {
  const nodes = useMemo<Node<CardNodeData>[]>(() => {
    if (!data) return []

    // グリッドレイアウトで配置
    const cols = Math.max(Math.ceil(Math.sqrt(data.cards.length)), 1)
    return data.cards.map((card: GraphCardData, index: number) => ({
      id: card.id,
      type: "cardNode",
      position: {
        x: (index % cols) * 280,
        y: Math.floor(index / cols) * 160,
      },
      data: {
        label: card.title,
        tags: card.tags,
        projectId,
        cardId: card.id,
      },
    }))
  }, [data, projectId])

  const edges = useMemo<Edge[]>(() => {
    if (!data) return []
    return data.references.map((ref) => {
      const style = edgeStyles[ref.referenceType]
      return {
        id: ref.id,
        source: ref.sourceCardId,
        target: ref.targetCardId,
        label: edgeLabels[ref.referenceType],
        style: {
          stroke: style.stroke,
          strokeWidth: style.strokeWidth,
          ...(style.strokeDasharray
            ? { strokeDasharray: style.strokeDasharray }
            : {}),
        },
        labelStyle: { fontSize: 11, fill: style.stroke },
        animated: ref.referenceType === "contradicts",
      }
    })
  }, [data])

  return { nodes, edges }
}
