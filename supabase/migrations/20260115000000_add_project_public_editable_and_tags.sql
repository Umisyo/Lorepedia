-- プロジェクト新規作成機能のためのマイグレーション
-- 1. projectsテーブルにis_public_editableカラム追加
-- 2. project_tagsテーブル新規作成

-- ============================================================
-- 1. projectsテーブルにis_public_editableカラム追加
-- ============================================================
ALTER TABLE projects
ADD COLUMN is_public_editable BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN projects.is_public_editable IS '有効にすると、ログインしているすべてのユーザーがこのプロジェクトの設定カードを編集できます';

-- ============================================================
-- 2. project_tagsテーブル新規作成
-- ============================================================
CREATE TABLE project_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- 同一プロジェクト内でタグ名は一意
  UNIQUE(project_id, name)
);

COMMENT ON TABLE project_tags IS 'プロジェクトに付与されるタグ（分類用）';
COMMENT ON COLUMN project_tags.name IS 'タグ名（最大20文字）';

-- ============================================================
-- 3. インデックス作成
-- ============================================================
CREATE INDEX idx_project_tags_project ON project_tags(project_id);

-- ============================================================
-- 4. RLSポリシー設定
-- ============================================================
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;

-- SELECT: 全員閲覧可能（プロジェクト一覧でタグを表示するため）
CREATE POLICY "project_tags_select" ON project_tags
  FOR SELECT USING (true);

-- INSERT: プロジェクトのEditor以上のみ
CREATE POLICY "project_tags_insert" ON project_tags
  FOR INSERT WITH CHECK (is_project_editor(project_id));

-- UPDATE: プロジェクトのEditor以上のみ
CREATE POLICY "project_tags_update" ON project_tags
  FOR UPDATE USING (is_project_editor(project_id));

-- DELETE: プロジェクトのEditor以上のみ
CREATE POLICY "project_tags_delete" ON project_tags
  FOR DELETE USING (is_project_editor(project_id));
