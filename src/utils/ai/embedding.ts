import OpenAI from "openai"
import { AINotConfiguredError } from "./errors"

// APIキーが設定されているかチェック
export function isEmbeddingAvailable(): boolean {
  return !!process.env.OPENAI_API_KEY
}

// OpenAIクライアントを遅延初期化
function getClient(): OpenAI {
  if (!isEmbeddingAvailable()) {
    throw new AINotConfiguredError("OPENAI_API_KEY")
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// テキストからEmbeddingベクトルを生成
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getClient()

  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  })

  const embedding = response.data[0]?.embedding
  if (!embedding) {
    throw new Error("Embeddingの生成に失敗しました")
  }

  return embedding
}
