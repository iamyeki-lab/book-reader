-- AtoB: Free chapters and payment settings (site_settings)
-- Migration 014
-- Keys: free_chapters_count, payment_config (PayPal, 书豆, chapter_price)

-- Default values inserted via app, not here. Structure documented:
-- free_chapters_count: number (default 3) - per book free chapters
-- payment_config: { paypal_client_id, chapter_price_credits, currency }
-- chapter_price_credits: 书豆 per paid chapter (default 10)
