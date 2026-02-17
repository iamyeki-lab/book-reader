-- AtoB: Storage bucket book-covers - public read
-- Migration 009

-- Create public bucket for book covers (JPG/PNG/WEBP, 2MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'book-covers',
  'book-covers',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Policies: anon read, authenticated insert/update/delete
CREATE POLICY "book_covers_anon_select"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'book-covers');

CREATE POLICY "book_covers_auth_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'book-covers');

CREATE POLICY "book_covers_auth_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'book-covers');

CREATE POLICY "book_covers_auth_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'book-covers');
