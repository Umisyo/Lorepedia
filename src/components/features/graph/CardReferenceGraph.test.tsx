import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import type { GraphDataResult } from "@/app/actions/cardReference"

// @xyflow/reactをモック
vi.mock("@xyflow/react", () => ({
  ReactFlow: ({
    children,
    nodes,
    edges,
  }: {
    children: React.ReactNode
    nodes: unknown[]
    edges: unknown[]
  }) => (
    <div
      data-testid="react-flow"
      data-nodes={nodes.length}
      data-edges={edges.length}
    >
      {children}
    </div>
  ),
  Background: () => <div data-testid="background" />,
  Controls: () => <div data-testid="controls" />,
  MiniMap: () => <div data-testid="minimap" />,
  Handle: () => null,
  Position: { Top: "top", Bottom: "bottom" },
  useNodesState: (initial: unknown[]) => [initial, vi.fn(), vi.fn()],
  useEdgesState: (initial: unknown[]) => [initial, vi.fn(), vi.fn()],
}))

// next/navigationをモック
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

import { CardReferenceGraph } from "./CardReferenceGraph"

const mockData: GraphDataResult = {
  cards: [
    {
      id: "card-1",
      title: "エルフの国",
      tags: [
        {
          id: "tag-1",
          name: "種族",
          color: "#22c55e",
          project_id: "proj-1",
          description: null,
          created_at: "",
          updated_at: "",
        },
      ],
    },
    { id: "card-2", title: "ドワーフの国", tags: [] },
  ],
  references: [
    {
      id: "ref-1",
      sourceCardId: "card-1",
      targetCardId: "card-2",
      referenceType: "related",
    },
  ],
}

describe("CardReferenceGraph", () => {
  it("ReactFlowコンポーネントがレンダリングされる", () => {
    render(<CardReferenceGraph data={mockData} projectId="proj-1" />)
    expect(screen.getByTestId("react-flow")).toBeInTheDocument()
  })

  it("正しい数のノードとエッジが渡される", () => {
    render(<CardReferenceGraph data={mockData} projectId="proj-1" />)
    const reactFlow = screen.getByTestId("react-flow")
    expect(reactFlow).toHaveAttribute("data-nodes", "2")
    expect(reactFlow).toHaveAttribute("data-edges", "1")
  })

  it("Background, Controls, MiniMapが表示される", () => {
    render(<CardReferenceGraph data={mockData} projectId="proj-1" />)
    expect(screen.getByTestId("background")).toBeInTheDocument()
    expect(screen.getByTestId("controls")).toBeInTheDocument()
    expect(screen.getByTestId("minimap")).toBeInTheDocument()
  })
})
