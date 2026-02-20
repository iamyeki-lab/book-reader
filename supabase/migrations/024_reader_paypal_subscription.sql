-- AtoB: PayPal subscription — reader_profiles.paypal_subscription_id
-- When set, user has active subscription and can read all chapters (no per-chapter purchase).

ALTER TABLE reader_profiles
  ADD COLUMN IF NOT EXISTS paypal_subscription_id TEXT;

COMMENT ON COLUMN reader_profiles.paypal_subscription_id IS 'PayPal subscription ID when user has active subscription; unlocks all chapters beyond free N.';
