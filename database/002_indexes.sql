-- ===========================================
-- Splitly
-- Database indexes
-- Version: 002
-- ===========================================

CREATE INDEX idx_expenses_group_id ON expenses(group_id);

CREATE INDEX idx_group_members_group_id ON group_members(group_id);

CREATE INDEX idx_expense_participants_expense_id ON expense_participants(expense_id);

CREATE INDEX idx_expense_participants_member_id ON expense_participants(member_id);

CREATE INDEX idx_payments_group_id ON payments(group_id);

CREATE INDEX idx_activity_log_group_id ON activity_log(group_id);

CREATE UNIQUE INDEX idx_one_owner_per_group ON group_members(group_id) WHERE is_owner = TRUE;