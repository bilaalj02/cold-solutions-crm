-- Fix RLS policies to allow anonymous access for call logs
-- Run this in Supabase SQL Editor to fix the connection issue

-- Disable RLS for call logs table (simplest fix for now)
ALTER TABLE crm_call_logs DISABLE ROW LEVEL SECURITY;

-- Alternative: Keep RLS but allow anonymous access
-- DROP POLICY IF EXISTS "Authenticated users can view call logs" ON crm_call_logs;
-- DROP POLICY IF EXISTS "Authenticated users can insert call logs" ON crm_call_logs;
-- DROP POLICY IF EXISTS "Authenticated users can update call logs" ON crm_call_logs;

-- CREATE POLICY "Allow anonymous read call logs" ON crm_call_logs
--   FOR SELECT USING (true);

-- CREATE POLICY "Allow anonymous insert call logs" ON crm_call_logs
--   FOR INSERT WITH CHECK (true);

-- CREATE POLICY "Allow anonymous update call logs" ON crm_call_logs
--   FOR UPDATE USING (true);