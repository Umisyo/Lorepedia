-- =============================================================================
-- Fix: Function Search Path Security Warning
-- =============================================================================
-- 問題: 関数のsearch_pathが設定されていないため、セキュリティ警告が発生
-- 解決: 各関数にSET search_path = publicを追加
-- =============================================================================

-- get_user_role
CREATE OR REPLACE FUNCTION get_user_role(p_project_id UUID, p_user_id UUID)
RETURNS member_role AS $$
  SELECT role FROM project_members
  WHERE project_id = p_project_id AND user_id = p_user_id;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- is_project_editor
CREATE OR REPLACE FUNCTION is_project_editor(p_project_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = p_project_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'editor')
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- is_project_owner
CREATE OR REPLACE FUNCTION is_project_owner(p_project_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = p_project_id
    AND user_id = auth.uid()
    AND role = 'owner'
  );
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

-- update_updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- handle_new_user
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- handle_new_project
CREATE OR REPLACE FUNCTION handle_new_project()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
