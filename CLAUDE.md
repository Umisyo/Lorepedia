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
