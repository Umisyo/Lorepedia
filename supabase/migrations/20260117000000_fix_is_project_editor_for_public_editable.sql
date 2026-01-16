-- =============================================================================
-- Fix: is_project_editor should consider is_public_editable flag
-- =============================================================================
-- 問題: is_public_editable = true のプロジェクトでも、非メンバーがカード追加できない
-- 解決: is_public_editable = true かつ認証済みユーザーの場合もtrueを返す
-- =============================================================================

CREATE OR REPLACE FUNCTION is_project_editor(p_project_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = p_project_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'editor')
  )
  OR (
    -- is_public_editable = true かつ認証済みユーザーの場合
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM projects
      WHERE id = p_project_id
      AND is_public_editable = true
    )
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;
