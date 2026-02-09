// AI機能の設定不備エラー
export class AINotConfiguredError extends Error {
  public readonly envVarName: string

  constructor(envVarName: string) {
    super(`AI機能を利用するには環境変数 ${envVarName} の設定が必要です`)
    this.name = "AINotConfiguredError"
    this.envVarName = envVarName
  }
}

// 型ガード: AINotConfiguredErrorかどうかを判定
export function isAINotConfiguredError(
  error: unknown
): error is AINotConfiguredError {
  return error instanceof AINotConfiguredError
}
