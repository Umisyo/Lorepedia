-- =============================================================================
-- 公開プロジェクトの探索・自己参加・自己離脱機能
-- =============================================================================
-- is_public_editableプロジェクトへのviewerとしての自己参加と、
-- viewerの自己離脱を許可するRLSポリシー、および検索用インデックスを追加する。
-- =============================================================================

-- 1. is_public_editableプロジェクトへの自己参加ポリシー
CREATE POLICY "project_members: public_editableプロジェクトへの自己参加"
  ON project_members FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() = user_id
    AND role = 'viewer'
    AND EXISTS (
      SELECT 1 FROM projects WHERE id = project_id AND is_public_editable = true
    )
  );

-- 2. viewer自身の離脱ポリシー
CREATE POLICY "project_members: viewer自身の離脱"
  ON project_members FOR DELETE USING (
    auth.uid() = user_id AND role = 'viewer'
  );

-- 3. 検索用部分インデックス
CREATE INDEX idx_projects_public_editable
  ON projects(is_public_editable) WHERE is_public_editable = true;
