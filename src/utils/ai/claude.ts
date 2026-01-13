import Anthropic from '@anthropic-ai/sdk'

// TODO: Implement Claude API client
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function generateText(_prompt: string): Promise<string> {
  // TODO: Implement text generation
  throw new Error('Not implemented')
}
