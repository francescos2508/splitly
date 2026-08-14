-- ===========================================
-- Splitly
-- Database triggers
-- Version: 003
-- ===========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_groups_updated_at
BEFORE UPDATE ON groups
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_expenses_updated_at
BEFORE UPDATE ON expenses
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();