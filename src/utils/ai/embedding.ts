import OpenAI from 'openai'

// TODO: Implement OpenAI Embedding client
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateEmbedding(text: string): Promise<number[]> {
  // TODO: Implement embedding generation
  throw new Error('Not implemented')
}
