CREATE INDEX IF NOT EXISTS idx_results_user_id_created ON results(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mistakes_user_id_subject ON mistakes(user_id, subject);
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_id_date ON daily_activity(user_id, activity_date DESC);