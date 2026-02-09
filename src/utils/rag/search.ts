import { createClient } from "@/utils/supabase/server"
import { generateEmbedding, isEmbeddingAvailable } from "@/utils/ai/embedding"

export interface SearchResult {
  id: string
  title: string
  content: string
  similarity: number
}

// RPC関数の戻り値の型ガード
function isMatchLoreCardsRow(
  row: unknown
): row is { id: string; title: string; content: string; similarity: number } {
  if (typeof row !== "object" || row === null) return false
  if (
    !("id" in row) ||
    !("title" in row) ||
    !("content" in row) ||
    !("similarity" in row)
  ) {
    return false
  }
  const { id, title, content, similarity } = row
  return (
    typeof id === "string" &&
    typeof title === "string" &&
    (typeof content === "string" || content === null) &&
    typeof similarity === "number"
  )
}

// 類似度の閾値
const SIMILARITY_THRESHOLD = 0.7
const DEFAULT_LIMIT = 10

// ベクトル類似度検索でプロジェクト内の関連カードを取得
export async function searchSimilar(
  query: string,
  projectId: string,
  limit: number = DEFAULT_LIMIT
): Promise<SearchResult[]> {
  // Embedding APIが未設定の場合は空配列を返却（graceful degradation）
  if (!isEmbeddingAvailable()) {
    return []
  }

  const queryEmbedding = await generateEmbedding(query)
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("match_lore_cards", {
    query_embedding: JSON.stringify(queryEmbedding),
    match_threshold: SIMILARITY_THRESHOLD,
    match_count: limit,
    filter_project_id: projectId,
  })

  if (error) {
    console.error("Vector search failed:", error)
    return []
  }

  if (!Array.isArray(data)) {
    return []
  }

  return data.filter(isMatchLoreCardsRow).map((row) => ({
    id: row.id,
    title: row.title,
    content: row.content ?? "",
    similarity: row.similarity,
  }))
}
