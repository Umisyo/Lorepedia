import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import { CardReferenceSection } from "./CardReferenceSection"
import type { CardReferenceWithTitle } from "@/types/loreCard"

// 子コンポーネントをモック
vi.mock("@/components/features/CardReferenceGroup", () => ({
  CardReferenceGroup: ({
    referenceType,
    references,
  }: {
    referenceType: string
    references: CardReferenceWithTitle[]
  }) => (
    <div data-testid={`reference-group-${referenceType}`}>
      {references.map((r) => (
        <div key={r.id} data-testid={`reference-item-${r.id}`}>
          {r.relatedCard.title}
        </div>
      ))}
    </div>
  ),
}))

vi.mock("@/components/features/AddCardReferenceDialog", () => ({
  AddCardReferenceDialog: () => (
    <button data-testid="add-reference-dialog">参照を追加</button>
  ),
}))

vi.mock("@/app/actions/cardReference", () => ({
  getCardReferencesForCard: vi.fn(),
}))

const mockReferences: CardReferenceWithTitle[] = [
  {
    id: "ref-1",
    sourceCardId: "card-1",
    targetCardId: "card-2",
    referenceType: "depends_on",
    relatedCard: { id: "card-2", title: "依存先カード" },
    direction: "outgoing",
  },
  {
    id: "ref-2",
    sourceCardId: "card-3",
    targetCardId: "card-1",
    referenceType: "related",
    relatedCard: { id: "card-3", title: "関連するカードA" },
    direction: "incoming",
  },
  {
    id: "ref-3",
    sourceCardId: "card-1",
    targetCardId: "card-4",
    referenceType: "depends_on",
    relatedCard: { id: "card-4", title: "もう一つの依存先" },
    direction: "outgoing",
  },
]

describe("CardReferenceSection", () => {
  it("参照タイプごとにグループ化して表示される", () => {
    render(
      <CardReferenceSection
        projectId="proj-1"
        cardId="card-1"
        initialReferences={mockReferences}
        isEditor={false}
      />
    )

    // depends_onグループが表示される
    expect(screen.getByTestId("reference-group-depends_on")).toBeInTheDocument()
    // relatedグループが表示される
    expect(screen.getByTestId("reference-group-related")).toBeInTheDocument()
    // 各参照アイテムが表示される
    expect(screen.getByText("依存先カード")).toBeInTheDocument()
    expect(screen.getByText("関連するカードA")).toBeInTheDocument()
    expect(screen.getByText("もう一つの依存先")).toBeInTheDocument()
  })

  it("セクションタイトル「関連カード」が表示される", () => {
    render(
      <CardReferenceSection
        projectId="proj-1"
        cardId="card-1"
        initialReferences={mockReferences}
        isEditor={false}
      />
    )

    expect(screen.getByText("関連するカードA")).toBeInTheDocument()
  })

  it("editor権限がある場合、追加ダイアログが表示される", () => {
    render(
      <CardReferenceSection
        projectId="proj-1"
        cardId="card-1"
        initialReferences={mockReferences}
        isEditor={true}
      />
    )

    expect(screen.getByTestId("add-reference-dialog")).toBeInTheDocument()
  })

  it("editor権限がない場合、追加ダイアログが表示されない", () => {
    render(
      <CardReferenceSection
        projectId="proj-1"
        cardId="card-1"
        initialReferences={mockReferences}
        isEditor={false}
      />
    )

    expect(screen.queryByTestId("add-reference-dialog")).not.toBeInTheDocument()
  })

  it("参照がなく、editor権限もない場合、セクション全体が表示されない", () => {
    const { container } = render(
      <CardReferenceSection
        projectId="proj-1"
        cardId="card-1"
        initialReferences={[]}
        isEditor={false}
      />
    )

    expect(container.innerHTML).toBe("")
  })

  it("参照がなく、editor権限がある場合、空状態メッセージと追加ボタンが表示される", () => {
    render(
      <CardReferenceSection
        projectId="proj-1"
        cardId="card-1"
        initialReferences={[]}
        isEditor={true}
      />
    )

    expect(screen.getByText("関連カードはまだ設定されていません。")).toBeInTheDocument()
    expect(screen.getByTestId("add-reference-dialog")).toBeInTheDocument()
  })
})
