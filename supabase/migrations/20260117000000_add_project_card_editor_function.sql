-- =============================================================================
-- Fix: カード編集権限のis_public_editable対応（関数分離アプローチ）
-- =============================================================================
-- 問題: 前回のマイグレーション(20260117000000)でis_project_editor()を変更したが、
--       この関数はprojects.UPDATEなどでも使われており、セキュリティ上問題がある
-- 解決:
--   1. is_project_editor()は元のロジックに戻す
--   2. カード編集専用のis_project_card_editor()を新規作成
--   3. カード関連のRLSポリシーのみ新関数を使用
-- =============================================================================

-- 1. is_project_editor()を元のロジックに戻す
-- プロジェクト設定変更、タグ管理はメンバーのowner/editorのみ
CREATE OR REPLACE FUNCTION is_project_editor(p_project_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = p_project_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'editor')
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 2. カード編集専用の新関数を作成
-- is_public_editable = true の場合は認証済みユーザー全員がeditor扱い
CREATE OR REPLACE FUNCTION is_project_card_editor(p_project_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = p_project_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'editor')
  )
  OR (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM projects
      WHERE id = p_project_id
      AND is_public_editable = true
    )
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- 3. lore_cardsのRLSポリシーを更新
DROP POLICY IF EXISTS "lore_cards: owner/editorのみ作成可能" ON lore_cards;
CREATE POLICY "lore_cards: owner/editorのみ作成可能" ON lore_cards
  FOR INSERT WITH CHECK (is_project_card_editor(project_id));

DROP POLICY IF EXISTS "lore_cards: owner/editor/作成者のみ更新可能" ON lore_cards;
CREATE POLICY "lore_cards: owner/editor/作成者のみ更新可能" ON lore_cards
  FOR UPDATE USING (
    is_project_card_editor(project_id) OR author_id = auth.uid()
  );

DROP POLICY IF EXISTS "lore_cards: owner/editorのみ削除可能" ON lore_cards;
CREATE POLICY "lore_cards: owner/editorのみ削除可能" ON lore_cards
  FOR DELETE USING (is_project_card_editor(project_id));

-- 4. card_tagsのRLSポリシーを更新
DROP POLICY IF EXISTS "card_tags: owner/editorのみ作成可能" ON card_tags;
CREATE POLICY "card_tags: owner/editorのみ作成可能" ON card_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lore_cards
      WHERE id = card_id AND is_project_card_editor(project_id)
    )
  );

DROP POLICY IF EXISTS "card_tags: owner/editorのみ削除可能" ON card_tags;
CREATE POLICY "card_tags: owner/editorのみ削除可能" ON card_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lore_cards
      WHERE id = card_id AND is_project_card_editor(project_id)
    )
  );

-- 5. card_referencesのRLSポリシーを更新
DROP POLICY IF EXISTS "card_references: owner/editorのみ作成可能" ON card_references;
CREATE POLICY "card_references: owner/editorのみ作成可能" ON card_references
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lore_cards
      WHERE id = source_card_id AND is_project_card_editor(project_id)
    )
  );

DROP POLICY IF EXISTS "card_references: owner/editorのみ更新可能" ON card_references;
CREATE POLICY "card_references: owner/editorのみ更新可能" ON card_references
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lore_cards
      WHERE id = source_card_id AND is_project_card_editor(project_id)
    )
  );

DROP POLICY IF EXISTS "card_references: owner/editorのみ削除可能" ON card_references;
CREATE POLICY "card_references: owner/editorのみ削除可能" ON card_references
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lore_cards
      WHERE id = source_card_id AND is_project_card_editor(project_id)
    )
  );
