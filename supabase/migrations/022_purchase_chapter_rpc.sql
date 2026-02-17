-- AtoB: 购买章节原子化（扣书豆 + 写入 chapter_purchases 在同一事务内）
-- Migration 022（依赖 021 books.free_chapters_override）

CREATE OR REPLACE FUNCTION purchase_chapter(
  p_user_id UUID,
  p_chapter_id UUID,
  p_book_id UUID,
  p_credits_price INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_chapter_number INT;
  v_free_count INT;
  v_credits INT;
  v_already BOOLEAN;
  v_override INT;
BEGIN
  IF p_credits_price IS NULL OR p_credits_price <= 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_price', 'code', 'BAD_REQUEST');
  END IF;

  -- 是否已购买
  SELECT EXISTS(SELECT 1 FROM chapter_purchases WHERE user_id = p_user_id AND chapter_id = p_chapter_id) INTO v_already;
  IF v_already THEN
    RETURN jsonb_build_object('ok', true, 'message', 'already_purchased');
  END IF;

  -- 章节是否存在且属于该书
  SELECT chapter_number INTO v_chapter_number FROM chapters WHERE id = p_chapter_id AND book_id = p_book_id;
  IF v_chapter_number IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'chapter_not_found', 'code', 'NOT_FOUND');
  END IF;

  -- 免费章数：本书 free_chapters_override 优先，否则全局 site_settings
  SELECT free_chapters_override INTO v_override FROM books WHERE id = p_book_id LIMIT 1;
  IF v_override IS NOT NULL AND v_override >= 0 THEN
    v_free_count := v_override;
  ELSE
    SELECT COALESCE((value#>>'{}')::int, 3) INTO v_free_count FROM site_settings WHERE key = 'free_chapters_count' LIMIT 1;
    IF v_free_count IS NULL THEN v_free_count := 3; END IF;
  END IF;

  IF v_chapter_number <= v_free_count THEN
    RETURN jsonb_build_object('ok', true, 'message', 'free_chapter');
  END IF;

  -- 当前书豆
  SELECT COALESCE(credits, 0) INTO v_credits FROM reader_profiles WHERE user_id = p_user_id LIMIT 1;
  IF v_credits IS NULL THEN v_credits := 0; END IF;
  IF v_credits < p_credits_price THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_credits', 'code', 'INSUFFICIENT_CREDITS', 'need_credits', p_credits_price - v_credits);
  END IF;

  -- 扣款 + 写入购买记录（同一事务）
  INSERT INTO chapter_purchases (user_id, chapter_id, book_id, credits_spent)
  VALUES (p_user_id, p_chapter_id, p_book_id, p_credits_price);

  UPDATE reader_profiles
  SET credits = credits - p_credits_price, updated_at = now()
  WHERE user_id = p_user_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

COMMENT ON FUNCTION purchase_chapter(UUID, UUID, UUID, INT) IS 'Atomically deduct credits and record chapter purchase. Call from backend only.';
