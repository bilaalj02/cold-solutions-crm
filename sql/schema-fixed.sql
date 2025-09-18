-- Cold Solutions CRM Database Schema (Fixed Version)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CRM Users table
CREATE TABLE IF NOT EXISTS crm_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'sales_rep' CHECK (role IN ('admin', 'manager', 'sales_rep')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRM Call Logs table (replaces in-memory storage)
CREATE TABLE IF NOT EXISTS crm_call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id VARCHAR(255) UNIQUE NOT NULL,
  lead_id VARCHAR(255) NOT NULL,
  lead_name VARCHAR(255) NOT NULL,
  lead_email VARCHAR(255),
  lead_phone VARCHAR(50) NOT NULL,
  lead_company VARCHAR(255),
  lead_position VARCHAR(255),
  call_outcome VARCHAR(100) NOT NULL CHECK (call_outcome IN (
    'Booked Demo',
    'Interested',
    'Not Interested',
    'Requested More Info',
    'No Answer',
    'Callback Requested',
    'Follow Up Required'
  )),
  call_notes TEXT,
  caller_name VARCHAR(255) NOT NULL,
  caller_role VARCHAR(100),
  call_duration INTEGER, -- in seconds
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  lead_source VARCHAR(255),
  lead_industry VARCHAR(255),
  lead_territory VARCHAR(255),
  collected_email VARCHAR(255),
  preferred_phone VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRM Settings table
CREATE TABLE IF NOT EXISTS crm_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES crm_users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crm_call_logs_timestamp ON crm_call_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_crm_call_logs_caller_name ON crm_call_logs(caller_name);
CREATE INDEX IF NOT EXISTS idx_crm_call_logs_call_outcome ON crm_call_logs(call_outcome);
CREATE INDEX IF NOT EXISTS idx_crm_call_logs_lead_id ON crm_call_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_call_logs_call_id ON crm_call_logs(call_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_crm_users_updated_at ON crm_users;
CREATE TRIGGER update_crm_users_updated_at
    BEFORE UPDATE ON crm_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crm_call_logs_updated_at ON crm_call_logs;
CREATE TRIGGER update_crm_call_logs_updated_at
    BEFORE UPDATE ON crm_call_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crm_settings_updated_at ON crm_settings;
CREATE TRIGGER update_crm_settings_updated_at
    BEFORE UPDATE ON crm_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE crm_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_settings ENABLE ROW LEVEL SECURITY;

-- Policies for crm_users (fixed UUID comparison)
CREATE POLICY "Users can view own profile" ON crm_users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON crm_users
  FOR UPDATE USING (auth.uid() = id);

-- Policies for crm_call_logs (allow all authenticated users to read/write)
CREATE POLICY "Authenticated users can view call logs" ON crm_call_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert call logs" ON crm_call_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update call logs" ON crm_call_logs
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policies for crm_settings (fixed UUID comparison)
CREATE POLICY "Users can view own settings" ON crm_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own settings" ON crm_settings
  FOR ALL USING (auth.uid() = user_id);