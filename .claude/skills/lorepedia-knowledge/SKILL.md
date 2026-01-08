---
name: lorepedia-knowledge
description: Lorepediaプロジェクト固有の問題・解決策・技術的知見を記録・検索するスキル。デバッグで発見したインサイト、実装上のハマりポイント、プロジェクト固有の設定などをExocortexに保存し、将来の同様の問題解決を効率化する。
---

# Lorepedia Knowledge

Lorepediaプロジェクト固有のナレッジをExocortexに記録・検索するスキル。

## 自動トリガー条件

以下の状況で自動的にこのスキルを使用する：

### 記録すべき時
- デバッグで原因を特定した時
- プロジェクト固有の設定や回避策を発見した時
- 複雑な問題を解決した時
- 「これは覚えておくべき」と感じるインサイトを得た時
- 同じミスを繰り返したくない失敗を経験した時

### 検索すべき時
- 以前見たことがありそうなエラーに遭遇した時
- プロジェクト固有の設定方法を確認したい時
- 過去に解決した類似の問題に取り組む時

## 記録手順

### 1. 既存ナレッジの確認
```
exo_recall_memories(query="問題の概要", context_filter="lorepedia")
```

### 2. ナレッジの保存
```
exo_store_memory(
  content="問題の詳細、原因、解決策をMarkdownで記述",
  context_name="lorepedia",
  tags=["関連タグ", "技術名", "問題カテゴリ"],
  memory_type="適切なタイプ",
  is_painful=true/false,  # 苦労した問題の場合true
  time_cost_hours=N  # 解決にかかった時間（任意）
)
```

### 3. 関連ナレッジのリンク
`suggested_links`が返された場合、類似度が高いものをリンク:
```
exo_link_memories(source_id, target_id, relation_type, reason)
```

## memory_type の選択基準

| タイプ | 使用場面 |
|--------|----------|
| `insight` | 技術的な発見、パターン、ベストプラクティス |
| `success` | 成功した解決策、うまくいった実装 |
| `failure` | 失敗の記録、避けるべきアプローチ |
| `decision` | 技術選定の理由、アーキテクチャ上の判断 |
| `note` | 設定値、参照情報、クイックメモ |

## タグ付けガイドライン

### 技術スタック関連
- `nextjs`, `typescript`, `supabase`, `tailwind`, `shadcn`
- `react-flow`, `zod`, `react-hook-form`
- `claude-api`, `openai-api`, `pgvector`

### 問題カテゴリ
- `bugfix`, `performance`, `security`, `config`
- `type-error`, `runtime-error`, `build-error`
- `database`, `api`, `ui`, `auth`

### 機能領域
- `world-management`, `character`, `lore`
- `ai-generation`, `embedding`, `search`

## 検索手順

### シンプルな検索
```
exo_recall_memories(
  query="検索キーワード",
  context_filter="lorepedia"
)
```

### フィルター付き検索
```
exo_recall_memories(
  query="検索キーワード",
  context_filter="lorepedia",
  tag_filter=["bugfix", "supabase"],
  type_filter="success"
)
```

### 関連ナレッジの探索
```
exo_explore_related(memory_id="見つかったメモリID")
```

### 決定の経緯を追跡
```
exo_trace_lineage(memory_id="決定のID", direction="backward")
```

## 記録テンプレート

### バグ修正
```markdown
## 問題
[エラーメッセージや症状]

## 原因
[根本原因の説明]

## 解決策
[具体的な修正内容]

## 関連ファイル
- `path/to/file.ts`

## 再発防止
[同様の問題を防ぐためのポイント]
```

### 設定・回避策
```markdown
## 概要
[何の設定・回避策か]

## 背景
[なぜこの設定が必要か]

## 設定内容
\`\`\`typescript
// コード例
\`\`\`

## 注意点
[変更時の影響、依存関係など]
```

### 技術的インサイト
```markdown
## 発見
[何を学んだか]

## コンテキスト
[どのような状況で発見したか]

## 適用場面
[この知識が役立つシーン]

## 参考
[関連ドキュメント、リンクなど]
```

## セッション管理

### セッション開始時
```
exo_session_briefing(project_context="lorepedia")
```

### セッション終了時（または大きなタスク完了時）
```
exo_sleep()
```

## 使用例

### 例1: Supabaseの型エラーを解決した時
```
exo_store_memory(
  content="""
## 問題
Supabase Clientの型定義で `Tables` 型が見つからないエラー

## 原因
`npm run supabase:types` 実行後に型定義ファイルの再生成が必要

## 解決策
1. `npm run supabase:types` を実行
2. VSCodeをリロード（Cmd+Shift+P → Reload Window）

## 再発防止
DBスキーマ変更後は必ず型を再生成する
""",
  context_name="lorepedia",
  tags=["supabase", "typescript", "type-error", "database"],
  memory_type="success",
  is_painful=false
)
```

### 例2: 過去の類似問題を検索
```
exo_recall_memories(
  query="Supabase 型エラー",
  context_filter="lorepedia",
  tag_filter=["supabase", "type-error"]
)
```
