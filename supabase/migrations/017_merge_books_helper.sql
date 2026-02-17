-- 合并书籍用的辅助函数：将源书的翻译合并到目标书（按章节号匹配）
-- Migration 017
-- 用法：SELECT merge_book_translations('源书UUID', '目标书UUID');

CREATE OR REPLACE FUNCTION merge_book_translations(
  source_book_id UUID,
  target_book_id UUID
) RETURNS INTEGER AS $$
DECLARE
  merged_count INTEGER := 0;
BEGIN
  INSERT INTO translations (
    chapter_id, target_lang, translated_title, translated_content,
    translated_ar, translated_es, translated_en, book_id,
    original_zh, chapter_key
  )
  SELECT 
    t.id, s.target_lang, s.translated_title, s.translated_content,
    s.translated_ar, s.translated_es, s.translated_en, target_book_id,
    s.original_zh, s.chapter_key
  FROM translations s
  JOIN chapters sc ON s.chapter_id = sc.id AND sc.book_id = source_book_id
  JOIN chapters t ON t.book_id = target_book_id AND t.chapter_number = sc.chapter_number
  WHERE NOT EXISTS (
    SELECT 1 FROM translations t2 
    WHERE t2.chapter_id = t.id AND t2.target_lang = s.target_lang
  );
  
  GET DIAGNOSTICS merged_count = ROW_COUNT;
  RETURN merged_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
