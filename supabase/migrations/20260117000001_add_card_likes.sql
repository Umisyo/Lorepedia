-- card_likes テーブル作成
CREATE TABLE card_likes (
  card_id UUID NOT NULL REFERENCES lore_cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (card_id, user_id)
);

-- インデックス
CREATE INDEX idx_card_likes_card ON card_likes(card_id);
CREATE INDEX idx_card_likes_user ON card_likes(user_id);

-- RLS有効化
ALTER TABLE card_likes ENABLE ROW LEVEL SECURITY;

-- RLSポリシー
CREATE POLICY "card_likes: 全員閲覧可能" ON card_likes
  FOR SELECT USING (true);

CREATE POLICY "card_likes: 認証済みユーザーのみ作成可能" ON card_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "card_likes: 本人のみ削除可能" ON card_likes
  FOR DELETE USING (auth.uid() = user_id);
