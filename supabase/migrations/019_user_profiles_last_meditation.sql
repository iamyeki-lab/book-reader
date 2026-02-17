-- Add last_meditation_at to user_profiles for Daily Meditation check-in
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_meditation_at TIMESTAMPTZ;
