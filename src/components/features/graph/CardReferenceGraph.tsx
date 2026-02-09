"use client"

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type NodeTypes,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { CardNode } from "./CardNode"
import { useGraphData } from "./useGraphData"
import type { GraphDataResult } from "@/app/actions/cardReference"

const nodeTypes: NodeTypes = {
  cardNode: CardNode,
}

type CardReferenceGraphProps = {
  data: GraphDataResult
  projectId: string
}

export function CardReferenceGraph({
  data,
  projectId,
}: CardReferenceGraphProps) {
  const { nodes: initialNodes, edges: initialEdges } = useGraphData(
    data,
    projectId
  )
  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  const proOptions = { hideAttribution: true }

  return (
    <div className="h-[calc(100vh-12rem)] w-full rounded-lg border">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        fitView
        minZoom={0.1}
        maxZoom={2}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          className="!bg-background !border-border"
        />
      </ReactFlow>
    </div>
  )
}
