-- ===========================================
-- Splitly
-- Enable Row Level Security
-- Version: 004
-- ===========================================

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

ALTER TABLE expense_participants ENABLE ROW LEVEL SECURITY;

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;