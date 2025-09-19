-- Enable Row Level Security on all email tables
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Email Templates Policies
-- Allow all operations for authenticated users (since this is a single-tenant CRM)
CREATE POLICY "Allow all operations on email_templates for authenticated users" ON email_templates
    FOR ALL USING (auth.role() = 'authenticated');

-- Email Campaigns Policies
CREATE POLICY "Allow all operations on email_campaigns for authenticated users" ON email_campaigns
    FOR ALL USING (auth.role() = 'authenticated');

-- Email Sequences Policies
CREATE POLICY "Allow all operations on email_sequences for authenticated users" ON email_sequences
    FOR ALL USING (auth.role() = 'authenticated');

-- Email Logs Policies
CREATE POLICY "Allow all operations on email_logs for authenticated users" ON email_logs
    FOR ALL USING (auth.role() = 'authenticated');

-- Alternative: More restrictive policies if you want user-based access control
-- Uncomment these and comment out the above if you want user-specific access

/*
-- Get the current user's email/ID helper function
CREATE OR REPLACE FUNCTION auth.email() RETURNS TEXT AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::json->>'email',
    (current_setting('request.jwt.claims', true)::json->'user_metadata')::json->>'email'
  )::text;
$$ LANGUAGE sql STABLE;

-- Email Templates - User can only access their own templates
CREATE POLICY "Users can view their own email templates" ON email_templates
    FOR SELECT USING (created_by = auth.email() OR created_by = 'system');

CREATE POLICY "Users can insert their own email templates" ON email_templates
    FOR INSERT WITH CHECK (created_by = auth.email());

CREATE POLICY "Users can update their own email templates" ON email_templates
    FOR UPDATE USING (created_by = auth.email()) WITH CHECK (created_by = auth.email());

CREATE POLICY "Users can delete their own email templates" ON email_templates
    FOR DELETE USING (created_by = auth.email());

-- Email Campaigns - User can only access their own campaigns
CREATE POLICY "Users can view their own email campaigns" ON email_campaigns
    FOR SELECT USING (created_by = auth.email());

CREATE POLICY "Users can insert their own email campaigns" ON email_campaigns
    FOR INSERT WITH CHECK (created_by = auth.email());

CREATE POLICY "Users can update their own email campaigns" ON email_campaigns
    FOR UPDATE USING (created_by = auth.email()) WITH CHECK (created_by = auth.email());

CREATE POLICY "Users can delete their own email campaigns" ON email_campaigns
    FOR DELETE USING (created_by = auth.email());

-- Email Sequences - User can only access their own sequences
CREATE POLICY "Users can view their own email sequences" ON email_sequences
    FOR SELECT USING (true); -- Allow viewing all sequences for now

CREATE POLICY "Users can insert email sequences" ON email_sequences
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update email sequences" ON email_sequences
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete email sequences" ON email_sequences
    FOR DELETE USING (true);

-- Email Logs - User can view all logs (for analytics) but only system can insert
CREATE POLICY "Users can view email logs" ON email_logs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert email logs" ON email_logs
    FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update email logs" ON email_logs
    FOR UPDATE USING (true);
*/

-- Grant usage on sequences to authenticated users
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;

-- Refresh the schema cache
NOTIFY pgrst, 'reload schema';