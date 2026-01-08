# CLAUDE.md - Lorepedia 開発ガイドライン

このファイルはClaude Codeがプロジェクトで作業する際のガイドラインを定義します。

---

## プロジェクト概要

シェアード・ワールド創作支援Webアプリケーション

### 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript (strict mode)
- **スタイリング**: Tailwind CSS + shadcn/ui
- **データベース**: Supabase (PostgreSQL + pgvector)
- **AI**: Claude API (生成) + OpenAI API (Embedding)
- **状態管理**: React Hook Form + Zod
- **ビジュアライゼーション**: React Flow
- **テスト**: Vitest + React Testing Library + MSW

### 情報ソース

**原則: プロジェクト情報はNotionを参照する**

| 情報種別 | 参照先 |
|---------|--------|
| 技術仕様・アーキテクチャ | Notion |
| 機能要件・ユースケース | Notion |
| DB設計・テーブル構造 | Notion |
| 画面設計・UI仕様 | Notion |
| タスク管理 | Notion |

実装時に仕様や要件が不明な場合は、`lorepedia-notion` スキルを使用してNotionから情報を取得すること。

**仕様が見つからない場合のルール:**

1. Notionを検索しても該当する仕様が存在しない場合、その場で判断して実装を進める
2. **判断した内容は必ずNotionの関連ページに追記する**
3. 追記時は以下を明記する：
   - 判断日時
   - 判断内容
   - 判断理由

---

## コーディング規約

### 言語

- コミットメッセージ: **日本語**
- コードコメント: **日本語**
- 変数名・関数名: **英語** (キャメルケース/パスカルケース)

### TypeScript

#### 必須ルール

```typescript
// ❌ 禁止: any型の使用
const data: any = fetchData()

// ✅ 推奨: 明示的な型定義
const data: UserData = fetchData()

// ❌ 禁止: 型アサーションの乱用
const user = response as User

// ✅ 推奨: 型ガードの使用
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj
}
```

#### 型定義の配置

| 種類 | 配置場所 |
|------|----------|
| Supabase生成型 | `src/types/database.ts` |
| 共通型定義 | `src/types/` 配下に用途別ファイル |
| コンポーネント専用型 | 同一ファイル内 |
| Zodスキーマ | `src/schemas/` |

### ファイル命名規則

```
src/
├── components/
│   ├── ui/              # shadcn/uiコンポーネント (小文字)
│   │   └── button.tsx
│   └── features/        # 機能コンポーネント (パスカルケース)
│       └── WorldEditor.tsx
├── app/
│   └── (routes)/        # ルートグループ (小文字・ケバブケース)
│       └── world/
│           └── [id]/
│               └── page.tsx
└── lib/
    └── utils/           # ユーティリティ (キャメルケース)
        └── formatDate.ts
```

### コンポーネント設計

```typescript
// 推奨: 関数コンポーネント + 明示的な型
type Props = {
  title: string
  onSubmit: (data: FormData) => void
  children?: React.ReactNode
}

export function MyComponent({ title, onSubmit, children }: Props) {
  // ...
}

// 推奨: デフォルトエクスポートは避ける（named export優先）
// ❌ export default function MyComponent() {}
// ✅ export function MyComponent() {}
```

---

## 品質基準

### 型安全性

- [ ] `strict: true` を維持
- [ ] `any` 型の使用禁止（`unknown` + 型ガードを使用）
- [ ] 外部APIレスポンスは Zod でバリデーション
- [ ] Supabase型は自動生成を使用 (`npm run supabase:types`)

### テスト

- [ ] 新規コンポーネント: 最低1つのテストケース
- [ ] ユーティリティ関数: 境界値を含むテスト
- [ ] API Route: MSWでモックしたテスト

```typescript
// テストファイルの命名
ComponentName.test.tsx  // コンポーネントテスト
utilName.test.ts        // ユーティリティテスト
```

### パフォーマンス

- [ ] 画像: next/image を使用
- [ ] 動的インポート: 重いコンポーネントは `dynamic()` でコード分割
- [ ] メモ化: 高コストな計算には `useMemo` / `useCallback`
- [ ] リスト: 大量データは仮想化を検討

### コード一貫性

- [ ] ESLint エラー: 0件
- [ ] import順序: 外部 → 内部 → 相対パス
- [ ] 未使用変数・importの削除

---

## Git ワークフロー

### ブランチ命名

```
feature/機能名     # 新機能
fix/バグ内容       # バグ修正
refactor/対象     # リファクタリング
docs/対象         # ドキュメント
```

### コミットメッセージ

```
<種類>: <変更内容の要約>

<詳細な説明（必要に応じて）>
```

**種類:**
- `feat`: 新機能
- `fix`: バグ修正
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `docs`: ドキュメント
- `chore`: 設定・依存関係

**例:**
```
feat: ワールド一覧ページを追加

- WorldListコンポーネントを作成
- Supabaseからデータ取得するServer Actionを実装
```

---

## 開発ワークフロー

### ブランチとWorktree管理

| ルール | 説明 |
|--------|------|
| ブランチ作成 | 新規の変更作業を開始する際は、必ず専用ブランチを作成する |
| Worktree使用 | ブランチ作成後は `git worktree` を使用して作業ディレクトリを分離する |
| Worktree削除 | 作業が完全に完了し、マージ後はworktreeを削除する |
| ブランチ-タスク紐付け | 1ブランチ = 1タスクの原則を守る |

### 実装フロー（必須手順）

タスクを実装する際は、以下のフローを**必ず**完了させること：

```
1. Worktree作成 → 2. 実装 → 3. テスト・Lint → 4. Commit → 5. Push → 6. PR作成
```

#### Step 1: Worktree作成

```bash
# mainブランチから新しいworktreeを作成
git worktree add ../Lorepedia-<branch-name> -b <branch-name>

# worktreeディレクトリに移動して作業開始
cd ../Lorepedia-<branch-name>
```

#### Step 2: 実装

- 実装を行う
- 適切な粒度でコミットを分割（1機能1コミットが目安）

#### Step 3: テスト・Lint確認

```bash
npm run lint          # ESLintエラーがないことを確認
npm run test:run      # テストが通ることを確認
npm run build         # ビルドが成功することを確認（必要に応じて）
```

#### Step 4: Commit

```bash
git add .
git commit -m "feat: 機能の説明"
```

#### Step 5: Push

```bash
git push -u origin <branch-name>
```

#### Step 6: PR作成

```bash
gh pr create --title "タイトル" --body "説明"
```

### Worktree操作コマンド

```bash
# worktree作成（ブランチも同時に作成）
git worktree add ../Lorepedia-<branch-name> -b <branch-name>

# 作業完了後のworktree削除
git worktree remove ../Lorepedia-<branch-name>

# worktree一覧確認
git worktree list

# 不要なブランチのクリーンアップ
/clean_gone
```

### 実装完了の定義

以下がすべて完了するまで、タスクは「完了」としない：

- [ ] 実装が完了している
- [ ] Lintエラーがない
- [ ] テストが通る
- [ ] コミットされている
- [ ] リモートにPushされている
- [ ] PRが作成されている（または直接マージの場合はマージ完了）

### タスク管理

**task-managerエージェントによる管理:**

- タスクの作成・更新・進捗管理はすべて `task-manager` エージェントを通じて行う
- Notionタスク管理データベースと自動連携される

**ステータス遷移:**

```
未着手 → 進行中 → レビュー待ち → 完了
              ↘ 保留（問題発生時）
```

**運用ルール:**

| タイミング | アクション |
|-----------|-----------|
| タスク着手時 | ステータスを「進行中」に変更 |
| PR作成時 | ステータスを「レビュー待ち」に変更 |
| マージ完了時 | ステータスを「完了」に変更 |
| ブロッカー発生時 | ステータスを「保留」に変更、問題点を記録 |
| 派生タスク発見時 | 新規タスクを作成（現タスクでは対応しない） |

**派生タスクの扱い:**

作業中に以下のような問題を発見した場合、新規タスクとして登録し、現タスクでは対応しない：

- スコープ外のバグ
- リファクタリングの必要性
- 将来的な改善点
- 技術的負債

---

## 開発コマンド

```bash
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm run lint         # ESLintチェック
npm run test         # テスト実行（watchモード）
npm run test:run     # テスト実行（単発）
npm run storybook    # Storybook起動
npm run supabase:types  # Supabase型生成
```

---

## 拡張セクション

<!--
以下のセクションは必要に応じて追加してください:

### プロンプト管理
AI生成機能のプロンプトテンプレート管理ルール

### セキュリティ
認証・認可、入力バリデーションのルール

### アクセシビリティ
WAI-ARIA対応、キーボードナビゲーション

### 国際化 (i18n)
多言語対応の実装ガイドライン

### デプロイ
本番環境へのデプロイ手順
-->

---

## 参照リンク

- [Next.js App Router](https://nextjs.org/docs/app)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase Docs](https://supabase.com/docs)
- [React Flow](https://reactflow.dev/)
