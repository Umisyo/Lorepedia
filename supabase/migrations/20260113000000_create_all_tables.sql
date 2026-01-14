-- =============================================================================
-- Lorepedia Database Migration: Create All Tables
-- =============================================================================
-- 作成日: 2026-01-13
-- 概要: シェアード・ワールド創作支援の基盤となる7テーブルを作成
-- 参照: Notion DB設計ドキュメント
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 0. 検索パスの設定
-- -----------------------------------------------------------------------------

-- extensionsスキーマを検索パスに追加（vector型を使用するため）
SET search_path TO public, extensions;

-- -----------------------------------------------------------------------------
-- 1. ENUMタイプの作成
-- -----------------------------------------------------------------------------

-- メンバーロール
CREATE TYPE member_role AS ENUM ('owner', 'editor', 'viewer');

-- カード参照タイプ
CREATE TYPE reference_type AS ENUM ('depends_on', 'derives_from', 'contradicts', 'related', 'mentions');

-- -----------------------------------------------------------------------------
-- 2. テーブル作成
-- -----------------------------------------------------------------------------

-- 2.1 profiles（ユーザープロファイル）
-- auth.usersと連携。トリガーで自動作成される。
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 projects（プロジェクト）
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.3 project_members（プロジェクトメンバー）
CREATE TABLE project_members (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'viewer',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, user_id)
);

-- 2.4 tags（カスタムタグ）
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#808080',
  description TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (project_id, name)
);

-- 2.5 lore_cards（設定カード）
CREATE TABLE lore_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  embedding vector(1536)
);

-- 2.6 card_tags（カード-タグ関連）
CREATE TABLE card_tags (
  card_id UUID NOT NULL REFERENCES lore_cards(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, tag_id)
);

-- 2.7 card_references（参照関係）
CREATE TABLE card_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_card_id UUID NOT NULL REFERENCES lore_cards(id) ON DELETE CASCADE,
  target_card_id UUID NOT NULL REFERENCES lore_cards(id) ON DELETE CASCADE,
  reference_type reference_type NOT NULL DEFAULT 'related',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT no_self_reference CHECK (source_card_id != target_card_id)
);

-- -----------------------------------------------------------------------------
-- 3. インデックス作成
-- -----------------------------------------------------------------------------

-- projects
CREATE INDEX idx_projects_owner ON projects(owner_id);

-- project_members
CREATE INDEX idx_project_members_user ON project_members(user_id);

-- tags
CREATE INDEX idx_tags_project ON tags(project_id);

-- lore_cards
CREATE INDEX idx_lore_cards_project ON lore_cards(project_id);
CREATE INDEX idx_lore_cards_author ON lore_cards(author_id);

-- card_tags
CREATE INDEX idx_card_tags_tag ON card_tags(tag_id);

-- card_references
CREATE INDEX idx_card_references_source ON card_references(source_card_id);
CREATE INDEX idx_card_references_target ON card_references(target_card_id);

-- lore_cards embedding用インデックス（IVFFlat）
-- 注: データが1000件以上になってから作成することを推奨
-- CREATE INDEX idx_lore_cards_embedding ON lore_cards USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- -----------------------------------------------------------------------------
-- 4. RLS（Row Level Security）ポリシー設定
-- -----------------------------------------------------------------------------

-- すべてのテーブルでRLSを有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE lore_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_references ENABLE ROW LEVEL SECURITY;

-- ヘルパー関数: ユーザーのプロジェクト内ロールを取得
CREATE OR REPLACE FUNCTION get_user_role(p_project_id UUID, p_user_id UUID)
RETURNS member_role AS $$
  SELECT role FROM project_members
  WHERE project_id = p_project_id AND user_id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- ヘルパー関数: ユーザーがプロジェクトのowner/editorかどうか
CREATE OR REPLACE FUNCTION is_project_editor(p_project_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = p_project_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'editor')
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ヘルパー関数: ユーザーがプロジェクトのownerかどうか
CREATE OR REPLACE FUNCTION is_project_owner(p_project_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = p_project_id
    AND user_id = auth.uid()
    AND role = 'owner'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 4.1 profiles ポリシー
CREATE POLICY "profiles: 全員閲覧可能" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles: 本人のみ更新可能" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 4.2 projects ポリシー
CREATE POLICY "projects: 全員閲覧可能" ON projects
  FOR SELECT USING (true);

CREATE POLICY "projects: 認証済みユーザーのみ作成可能" ON projects
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "projects: owner/editorのみ更新可能" ON projects
  FOR UPDATE USING (is_project_editor(id));

CREATE POLICY "projects: ownerのみ削除可能" ON projects
  FOR DELETE USING (is_project_owner(id));

-- 4.3 project_members ポリシー
CREATE POLICY "project_members: 全員閲覧可能" ON project_members
  FOR SELECT USING (true);

CREATE POLICY "project_members: ownerのみ追加可能" ON project_members
  FOR INSERT WITH CHECK (is_project_owner(project_id));

CREATE POLICY "project_members: ownerのみ更新可能" ON project_members
  FOR UPDATE USING (is_project_owner(project_id));

CREATE POLICY "project_members: ownerのみ削除可能" ON project_members
  FOR DELETE USING (is_project_owner(project_id));

-- 4.4 tags ポリシー
CREATE POLICY "tags: 全員閲覧可能" ON tags
  FOR SELECT USING (true);

CREATE POLICY "tags: owner/editorのみ作成可能" ON tags
  FOR INSERT WITH CHECK (is_project_editor(project_id));

CREATE POLICY "tags: owner/editorのみ更新可能" ON tags
  FOR UPDATE USING (is_project_editor(project_id));

CREATE POLICY "tags: owner/editorのみ削除可能" ON tags
  FOR DELETE USING (is_project_editor(project_id));

-- 4.5 lore_cards ポリシー
CREATE POLICY "lore_cards: 全員閲覧可能" ON lore_cards
  FOR SELECT USING (true);

CREATE POLICY "lore_cards: owner/editorのみ作成可能" ON lore_cards
  FOR INSERT WITH CHECK (is_project_editor(project_id));

CREATE POLICY "lore_cards: owner/editor/作成者のみ更新可能" ON lore_cards
  FOR UPDATE USING (
    is_project_editor(project_id) OR author_id = auth.uid()
  );

CREATE POLICY "lore_cards: owner/editorのみ削除可能" ON lore_cards
  FOR DELETE USING (is_project_editor(project_id));

-- 4.6 card_tags ポリシー
CREATE POLICY "card_tags: 全員閲覧可能" ON card_tags
  FOR SELECT USING (true);

CREATE POLICY "card_tags: owner/editorのみ作成可能" ON card_tags
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lore_cards
      WHERE id = card_id AND is_project_editor(project_id)
    )
  );

CREATE POLICY "card_tags: owner/editorのみ削除可能" ON card_tags
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lore_cards
      WHERE id = card_id AND is_project_editor(project_id)
    )
  );

-- 4.7 card_references ポリシー
CREATE POLICY "card_references: 全員閲覧可能" ON card_references
  FOR SELECT USING (true);

CREATE POLICY "card_references: owner/editorのみ作成可能" ON card_references
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM lore_cards
      WHERE id = source_card_id AND is_project_editor(project_id)
    )
  );

CREATE POLICY "card_references: owner/editorのみ更新可能" ON card_references
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM lore_cards
      WHERE id = source_card_id AND is_project_editor(project_id)
    )
  );

CREATE POLICY "card_references: owner/editorのみ削除可能" ON card_references
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM lore_cards
      WHERE id = source_card_id AND is_project_editor(project_id)
    )
  );

-- -----------------------------------------------------------------------------
-- 5. トリガー作成
-- -----------------------------------------------------------------------------

-- 5.1 updated_at自動更新関数
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_atトリガー（profiles）
CREATE TRIGGER trigger_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- updated_atトリガー（projects）
CREATE TRIGGER trigger_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- updated_atトリガー（lore_cards）
CREATE TRIGGER trigger_lore_cards_updated_at
  BEFORE UPDATE ON lore_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- 5.2 プロファイル自動作成関数
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.usersにトリガーを設定
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 5.3 プロジェクト作成時にownerをmembersに追加
CREATE OR REPLACE FUNCTION handle_new_project()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_project();

-- -----------------------------------------------------------------------------
-- 完了
-- -----------------------------------------------------------------------------
