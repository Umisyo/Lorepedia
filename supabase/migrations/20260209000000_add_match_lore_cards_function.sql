-- extensionsスキーマを検索パスに追加（vector型を解決するため）
SET search_path TO public, extensions;

-- ベクトル類似度検索用のRPC関数
CREATE OR REPLACE FUNCTION match_lore_cards(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_project_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT
    lc.id,
    lc.title,
    lc.content,
    1 - (lc.embedding <=> query_embedding) AS similarity
  FROM public.lore_cards lc
  WHERE
    lc.embedding IS NOT NULL
    AND (filter_project_id IS NULL OR lc.project_id = filter_project_id)
    AND 1 - (lc.embedding <=> query_embedding) > match_threshold
  ORDER BY lc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
