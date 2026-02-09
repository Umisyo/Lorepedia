import Anthropic from "@anthropic-ai/sdk"
import { AINotConfiguredError } from "./errors"

// APIキーが設定されているかチェック
export function isAIAvailable(): boolean {
  return !!process.env.ANTHROPIC_API_KEY
}

// Anthropicクライアントを遅延初期化（APIキー未設定時のエラーを防ぐ）
function getClient(): Anthropic {
  if (!isAIAvailable()) {
    throw new AINotConfiguredError("ANTHROPIC_API_KEY")
  }
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })
}

// TextBlock型ガード
function isTextBlock(
  block: Anthropic.ContentBlock
): block is Anthropic.TextBlock {
  return block.type === "text"
}

// Claude APIでテキストを生成
export async function generateText(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const client = getClient()

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    ...(systemPrompt ? { system: systemPrompt } : {}),
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  })

  // TextBlockのみ抽出してテキストを結合
  const textBlocks = message.content.filter(isTextBlock)
  if (textBlocks.length === 0) {
    throw new Error("AIからのレスポンスにテキストが含まれていません")
  }

  return textBlocks.map((block) => block.text).join("")
}
