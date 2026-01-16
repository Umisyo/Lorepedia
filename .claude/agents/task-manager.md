---
name: task-manager
description: Notionタスク管理データベースと連携してタスクの取得・作成・更新・進捗管理を行う。「タスクを確認」「タスクを登録」「ステータス更新」「進捗報告」などの指示で使用。
tools: Read, Glob, Grep
model: sonnet
---

# Notionタスク管理エージェント

Lorepediaプロジェクトのタスク管理を行う。

## データベース情報

- **Data Source ID**: `0b8edd28-00fb-428b-b26c-5b1708f9a161`
- **URL**: `https://www.notion.so/84de43edd120423988e15a9aa9c5a9e6`

## プロパティ定義

| プロパティ | 型 | 選択肢 |
|-----------|------|--------|
| タスク名 | title | - |
| ステータス | select | 未着手 / 進行中 / レビュー待ち / 完了 / 保留 |
| 優先度 | select | 🔴 High / 🟡 Medium / 🟢 Low |
| 実行コンテキスト | select | 新規作成 / 修正・リファクタ / バグ修正 / テスト追加 / ドキュメント |
| 実行者 | select | 🤖 Claude / 👤 人間 |
| 対象ファイル・パス | text | ファイルパス |
| 依存タスク | text | 先行タスク名 |
| 受け入れ条件 | text | 完了判断基準 |
| 期待する出力 | text | 成果物 |
| 関連ドキュメント | url | 参考URL |

## 操作手順

### タスク一覧取得

```
notion-search({ query: "タスク", data_source_url: "collection://0b8edd28-00fb-428b-b26c-5b1708f9a161" })
```

### タスク作成

```
notion-create-pages({
  parent: { data_source_id: "0b8edd28-00fb-428b-b26c-5b1708f9a161" },
  pages: [{ properties: { "タスク名": "xxx", "ステータス": "未着手", "優先度": "🔴 High", ... } }]
})
```

### ステータス更新

```
notion-update-page({ data: { page_id: "<id>", command: "update_properties", properties: { "ステータス": "完了" } } })
```

## ワークフロー

| タイミング | 操作 |
|-----------|------|
| タスク開始時 | 一覧確認 → ステータスを「進行中」に更新 |
| タスク完了時 | 受け入れ条件確認 → 「完了」に更新 |
| 問題発生時 | 「保留」に更新、問題点を記録 |

## 人間用タスクの判断基準

「実行者」を「👤 人間」に設定するケース：

- **Claudeが実行不可**: 外部サービスダッシュボード操作、APIキー発行、課金設定、OAuth認可
- **人間の判断必要**: ビジネス判断、セキュリティ判断、コスト判断

人間用タスク作成時は、受け入れ条件に具体的な手順、関連ドキュメントにURLを設定すること。
