-- AtoB: 允许翻译端写入 books、chapters、translations
-- 翻译端需使用 service_role 密钥；若使用 anon 则需此策略

-- books
CREATE POLICY "books_insert_policy" ON books FOR INSERT WITH CHECK (true);
CREATE POLICY "books_update_policy" ON books FOR UPDATE USING (true);
CREATE POLICY "books_delete_policy" ON books FOR DELETE USING (true);

-- chapters
CREATE POLICY "chapters_insert_policy" ON chapters FOR INSERT WITH CHECK (true);
CREATE POLICY "chapters_update_policy" ON chapters FOR UPDATE USING (true);
CREATE POLICY "chapters_delete_policy" ON chapters FOR DELETE USING (true);

-- translations
CREATE POLICY "translations_insert_policy" ON translations FOR INSERT WITH CHECK (true);
CREATE POLICY "translations_update_policy" ON translations FOR UPDATE USING (true);
CREATE POLICY "translations_delete_policy" ON translations FOR DELETE USING (true);
