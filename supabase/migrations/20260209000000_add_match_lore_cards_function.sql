-- lore_cardsテーブルからベクトル類似度検索を行うRPC関数
CREATE OR REPLACE FUNCTION match_lore_cards(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_project_id uuid
)
RETURNS TABLE (
  id uuid,
  title text,
  content text,
  similarity float
)
LANGUAGE sql STABLE
SET search_path = ''
AS $$
  SELECT
    lc.id,
    lc.title,
    lc.content,
    1 - (lc.embedding <=> query_embedding) AS similarity
  FROM public.lore_cards lc
  WHERE lc.project_id = filter_project_id
    AND lc.embedding IS NOT NULL
    AND 1 - (lc.embedding <=> query_embedding) > match_threshold
  ORDER BY lc.embedding <=> query_embedding
  LIMIT match_count;
$$;
