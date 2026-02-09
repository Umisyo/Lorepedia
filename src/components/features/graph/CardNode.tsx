"use client"

import { memo } from "react"
import { Handle, Position } from "@xyflow/react"
import type { NodeProps } from "@xyflow/react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import type { CardNodeData } from "@/types/loreCard"

// CardNodeData型ガード
function isCardNodeData(data: unknown): data is CardNodeData {
  return (
    typeof data === "object" &&
    data !== null &&
    "label" in data &&
    typeof (data as CardNodeData).label === "string" &&
    "projectId" in data &&
    typeof (data as CardNodeData).projectId === "string" &&
    "cardId" in data &&
    typeof (data as CardNodeData).cardId === "string" &&
    "tags" in data &&
    Array.isArray((data as CardNodeData).tags)
  )
}

function CardNodeComponent({ data }: NodeProps) {
  const router = useRouter()

  if (!isCardNodeData(data)) {
    return null
  }

  const handleClick = () => {
    router.push(`/projects/${data.projectId}/cards/${data.cardId}`)
  }

  return (
    <div
      className="cursor-pointer rounded-lg border bg-card px-4 py-3 shadow-sm transition-shadow hover:shadow-md"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick()
        }
      }}
      role="button"
      tabIndex={0}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-muted-foreground"
      />
      <div className="mb-1 text-sm font-medium">{data.label}</div>
      {data.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {data.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="text-[10px] px-1.5 py-0"
              style={
                tag.color
                  ? { backgroundColor: `${tag.color}20`, color: tag.color }
                  : undefined
              }
            >
              {tag.name}
            </Badge>
          ))}
          {data.tags.length > 3 && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              +{data.tags.length - 3}
            </Badge>
          )}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-muted-foreground"
      />
    </div>
  )
}

export const CardNode = memo(CardNodeComponent)
