-- Add updated_at column to email_logs table if it doesn't exist
-- This migration is safe to run multiple times

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'email_logs' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE email_logs
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL;

        -- Update existing rows to have updated_at = created_at
        UPDATE email_logs SET updated_at = created_at WHERE updated_at IS NULL;

        RAISE NOTICE 'Added updated_at column to email_logs table';
    ELSE
        RAISE NOTICE 'updated_at column already exists in email_logs table';
    END IF;
END
$$;

-- Ensure the trigger exists for email_logs updated_at
DROP TRIGGER IF EXISTS update_email_logs_updated_at ON email_logs;
CREATE TRIGGER update_email_logs_updated_at
    BEFORE UPDATE ON email_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Update template_id to allow NULL values for MCP server emails
-- MCP emails might not have an associated template_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = 'email_logs'
        AND constraint_name LIKE '%template_id%'
        AND constraint_type = 'FOREIGN KEY'
    ) THEN
        -- Drop the NOT NULL constraint if it exists
        ALTER TABLE email_logs ALTER COLUMN template_id DROP NOT NULL;
        RAISE NOTICE 'Made template_id nullable in email_logs table';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'template_id constraint not found or already nullable';
END
$$;