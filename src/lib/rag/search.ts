// TODO: Implement vector search utilities

export interface SearchResult {
  id: string
  content: string
  similarity: number
}

export async function searchSimilar(
  query: string,
  limit?: number
): Promise<SearchResult[]> {
  // TODO: Implement vector search
  throw new Error('Not implemented')
}
