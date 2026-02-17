// AtoB: Database types matching Supabase migrations

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      books: {
        Row: BookRow;
        Insert: Omit<BookRow, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<BookRow, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Omit<BookRow, 'id' | 'created_at'>>;
      };
      chapters: {
        Row: ChapterRow;
        Insert: Omit<ChapterRow, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<ChapterRow, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Omit<ChapterRow, 'id' | 'created_at'>>;
      };
      translations: {
        Row: TranslationRow;
        Insert: Omit<TranslationRow, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<TranslationRow, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Omit<TranslationRow, 'id' | 'created_at'>>;
      };
      admin_users: {
        Row: { id: string; email: string; created_at: string };
        Insert: { email: string };
        Update: Partial<{ email: string }>;
      };
      site_settings: {
        Row: { key: string; value: Json; updated_at: string };
        Insert: { key: string; value?: Json };
        Update: Partial<{ value: Json }>;
      };
      glossaries: {
        Row: GlossaryRow;
        Insert: Omit<GlossaryRow, 'id' | 'created_at' | 'updated_at'> & Partial<Pick<GlossaryRow, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Omit<GlossaryRow, 'id' | 'created_at'>>;
      };
      reader_profiles: {
        Row: { user_id: string; credits: number; created_at: string; updated_at: string };
        Insert: { user_id: string; credits?: number };
        Update: Partial<{ credits: number }>;
      };
      chapter_purchases: {
        Row: { id: string; user_id: string; chapter_id: string; book_id: string; credits_spent: number; created_at: string };
        Insert: { user_id: string; chapter_id: string; book_id: string; credits_spent: number };
        Update: never;
      };
      user_progress: {
        Row: { user_id: string; book_id: string; chapter_index: number; scroll_top: number; updated_at: string };
        Insert: { user_id: string; book_id: string; chapter_index?: number; scroll_top?: number };
        Update: Partial<{ chapter_index: number; scroll_top: number }>;
      };
    };
  };
}

export interface GlossaryRow {
  id: string;
  book_id: string;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BookRow {
  id: string;
  title: string;
  author: string;
  lang: string;
  genre: string | null;
  description: string | null;
  cover_url: string | null;
  published?: boolean;
  title_zh: string | null;
  title_en: string | null;
  title_es: string | null;
  title_ar: string | null;
  cover_url_en: string | null;
  cover_url_es: string | null;
  cover_url_ar: string | null;
  description_en: string | null;
  description_es: string | null;
  description_ar: string | null;
  free_chapters_override?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ChapterRow {
  id: string;
  book_id: string;
  chapter_number: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface TranslationRow {
  id: string;
  chapter_id: string;
  target_lang: string;
  translated_title: string;
  translated_content: string;
  chapter_key: string | null;
  target_script: string | null;
  original_zh: string | null;
  quality_score: number | null;
  audit_report_zh: string | null;
  book_id: string | null;
  translated_es: string | null;
  translated_ar: string | null;
  translated_en: string | null;
  created_at: string;
  updated_at: string;
}

export type Locale = 'en' | 'es' | 'ar';
