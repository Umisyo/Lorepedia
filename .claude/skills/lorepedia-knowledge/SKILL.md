---
name: lorepedia-knowledge
description: バグ修正・エラー解消・技術的知見を自動記録するスキル。デバッグで発見したインサイト、実装上のハマりポイント、設定の回避策などをExocortexに保存し、将来の同様の問題解決を効率化する。プロジェクト固有でなくても、汎用的な技術知見も記録対象。
---

# Knowledge Auto-Record

バグ修正・エラー解消・技術的知見をExocortexに自動記録するスキル。

## 自動トリガー条件

**以下の状況では、ユーザーへの確認なしに自動的に記録する：**

### 必ず記録する（自動実行）
- バグを修正した時
- エラーを解消した時
- ビルドエラー・型エラーを解決した時
- 設定ミスを発見・修正した時
- 原因不明だった問題の原因を特定した時
- 試行錯誤の末に解決策を見つけた時

### 記録を検討する
- 「これは覚えておくべき」と感じるインサイトを得た時
- 同じミスを繰り返したくない失敗を経験した時
- 複雑な実装パターンを発見した時

### 検索すべき時
- 以前見たことがありそうなエラーに遭遇した時
- 過去に解決した類似の問題に取り組む時
- 設定方法を確認したい時

## 記録手順

### 1. 既存ナレッジの確認（省略可）
```
exo_recall_memories(query="問題の概要")
```

### 2. ナレッジの保存
```
exo_store_memory(
  content="問題の詳細、原因、解決策をMarkdownで記述",
  context_name="lorepedia",  # 現在のプロジェクト名
  tags=["関連タグ", "技術名", "問題カテゴリ"],
  memory_type="適切なタイプ",
  is_painful=true/false,  # 苦労した問題の場合true
  time_cost_hours=N  # 解決にかかった時間（任意）
)
```

**注意**: バグ修正・エラー解消時は、確認なしで即座に記録する。

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

### 問題カテゴリ（必須）
- `bugfix`, `error-fix`, `config-fix`
- `type-error`, `runtime-error`, `build-error`, `lint-error`
- `performance`, `security`

### 技術スタック（該当するもの）
- **フレームワーク**: `nextjs`, `react`, `vue`, `node`
- **言語**: `typescript`, `javascript`, `python`
- **DB/Backend**: `supabase`, `postgresql`, `prisma`
- **スタイル**: `tailwind`, `css`, `shadcn`
- **ツール**: `eslint`, `vite`, `webpack`
- **AI**: `claude-api`, `openai-api`, `embedding`

### 問題領域
- `database`, `api`, `ui`, `auth`, `routing`
- `async`, `state-management`, `validation`

## 検索手順

### シンプルな検索
```
exo_recall_memories(query="検索キーワード")
```

### フィルター付き検索
```
exo_recall_memories(
  query="検索キーワード",
  tag_filter=["bugfix", "typescript"],
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

### 例1: 型エラーを解決した時（自動記録）
```
exo_store_memory(
  content="""
## 問題
TypeScriptで `Property 'X' does not exist on type 'Y'` エラー

## 原因
型定義が古く、実際のオブジェクト構造と不一致

## 解決策
1. 型定義ファイルを再生成
2. エディタをリロード

## 再発防止
スキーマ変更後は必ず型を再生成する
""",
  context_name="lorepedia",
  tags=["type-error", "typescript", "bugfix"],
  memory_type="success"
)
```

### 例2: ビルドエラーを解決した時（自動記録）
```
exo_store_memory(
  content="""
## 問題
`Module not found: Can't resolve 'xxx'`

## 原因
依存パッケージのバージョン不整合

## 解決策
node_modules削除後、再インストール
```bash
rm -rf node_modules package-lock.json
npm install
```

## 再発防止
パッケージ追加時はバージョン互換性を確認
""",
  context_name="lorepedia",
  tags=["build-error", "npm", "bugfix"],
  memory_type="success"
)
```

### 例3: 過去の類似問題を検索
```
exo_recall_memories(
  query="build error module not found",
  tag_filter=["build-error"]
)
```
