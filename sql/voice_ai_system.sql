-- ============================================================================
-- VOICE AI COLD CALLING SYSTEM - DATABASE SCHEMA
-- ============================================================================
-- Cold Solutions CRM - Voice AI Module
-- Supports: BC, Alberta, Ontario, Quebec
-- Industries: Plumbing, HVAC, Home Services
-- Target: 50 calls/day (scalable)
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE 1: voice_ai_leads
-- Core leads table for voice AI cold calling
-- ============================================================================
CREATE TABLE IF NOT EXISTS voice_ai_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Business Information
  business_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  website VARCHAR(500),
  industry VARCHAR(100) CHECK (industry IN ('Plumbing', 'HVAC', 'Home Services', 'Other')),

  -- Address Information
  address TEXT,
  city VARCHAR(100),
  province VARCHAR(2) CHECK (province IN ('BC', 'AB', 'ON', 'QC')),
  postal_code VARCHAR(10),
  timezone VARCHAR(50) DEFAULT 'America/Toronto',

  -- Lead Status & Priority
  status VARCHAR(50) DEFAULT 'New' CHECK (status IN (
    'New',
    'Research Pending',
    'Research Complete',
    'Queued for Calling',
    'Calling',
    'Call Completed',
    'Interested',
    'Not Interested',
    'Do Not Call',
    'Invalid Number'
  )),
  priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),

  -- Call Scheduling
  best_time_to_call VARCHAR(100),
  do_not_call_before TIME,
  do_not_call_after TIME,
  next_call_attempt TIMESTAMP WITH TIME ZONE,
  call_attempts INT DEFAULT 0,
  max_call_attempts INT DEFAULT 3,

  -- Research Data (from MCP server business-analyzer)
  research_status VARCHAR(50) DEFAULT 'Pending' CHECK (research_status IN (
    'Pending',
    'In Progress',
    'Complete',
    'Failed'
  )),
  research_completed_at TIMESTAMP WITH TIME ZONE,
  research_data JSONB DEFAULT '{}',

  -- Call Configuration
  retell_agent_id VARCHAR(255),
  custom_prompt TEXT,
  call_script_notes TEXT,

  -- Source & Campaign Tracking
  source VARCHAR(100) DEFAULT 'CSV Import',
  campaign_id UUID,
  list_id UUID,

  -- Metadata
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for voice_ai_leads
CREATE INDEX IF NOT EXISTS idx_voice_ai_leads_status ON voice_ai_leads(status);
CREATE INDEX IF NOT EXISTS idx_voice_ai_leads_province ON voice_ai_leads(province);
CREATE INDEX IF NOT EXISTS idx_voice_ai_leads_industry ON voice_ai_leads(industry);
CREATE INDEX IF NOT EXISTS idx_voice_ai_leads_research_status ON voice_ai_leads(research_status);
CREATE INDEX IF NOT EXISTS idx_voice_ai_leads_campaign_id ON voice_ai_leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_voice_ai_leads_phone ON voice_ai_leads(phone);
CREATE INDEX IF NOT EXISTS idx_voice_ai_leads_next_call ON voice_ai_leads(next_call_attempt);

-- ============================================================================
-- TABLE 2: voice_ai_campaigns
-- Organize calling campaigns
-- ============================================================================
CREATE TABLE IF NOT EXISTS voice_ai_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Campaign Details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  industry VARCHAR(100) CHECK (industry IN ('Plumbing', 'HVAC', 'Home Services', 'All')),

  -- Target Provinces
  provinces TEXT[] DEFAULT '{}',

  -- Campaign Configuration
  retell_agent_id VARCHAR(255),
  call_script TEXT,
  calling_hours_start TIME DEFAULT '09:00',
  calling_hours_end TIME DEFAULT '17:00',

  -- Campaign Status
  status VARCHAR(50) DEFAULT 'Draft' CHECK (status IN (
    'Draft',
    'Active',
    'Paused',
    'Completed',
    'Archived'
  )),

  -- Scheduling
  start_date DATE,
  end_date DATE,
  daily_call_limit INT DEFAULT 50,
  concurrent_calls INT DEFAULT 1,

  -- Campaign Stats (calculated from call_logs)
  total_leads INT DEFAULT 0,
  calls_made INT DEFAULT 0,
  calls_completed INT DEFAULT 0,
  demos_booked INT DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for voice_ai_campaigns
CREATE INDEX IF NOT EXISTS idx_voice_ai_campaigns_status ON voice_ai_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_voice_ai_campaigns_industry ON voice_ai_campaigns(industry);

-- ============================================================================
-- TABLE 3: voice_ai_call_logs
-- Detailed call tracking with transcripts and analysis
-- ============================================================================
CREATE TABLE IF NOT EXISTS voice_ai_call_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Lead Reference
  lead_id UUID NOT NULL REFERENCES voice_ai_leads(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES voice_ai_campaigns(id) ON DELETE SET NULL,

  -- Retell AI Data
  retell_call_id VARCHAR(255) UNIQUE,
  retell_agent_id VARCHAR(255),

  -- Call Details
  call_status VARCHAR(50) DEFAULT 'initiated' CHECK (call_status IN (
    'initiated',
    'ringing',
    'in-progress',
    'completed',
    'no-answer',
    'busy',
    'failed',
    'voicemail'
  )),
  call_outcome VARCHAR(100) CHECK (call_outcome IN (
    'Booked Demo',
    'Interested - Follow Up',
    'Send Information',
    'Not Interested',
    'Wrong Number',
    'No Answer',
    'Voicemail Left',
    'Callback Requested',
    'Gatekeeper - Transferred',
    'Gatekeeper - Blocked',
    'Do Not Call'
  )),

  -- Call Timing
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INT,

  -- Call Content
  transcript TEXT,
  summary TEXT,
  recording_url VARCHAR(500),

  -- AI Analysis
  sentiment VARCHAR(20) CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  interest_level VARCHAR(20) CHECK (interest_level IN ('Hot', 'Warm', 'Cold', 'None')),
  pain_points_mentioned TEXT[] DEFAULT '{}',
  objections_raised TEXT[] DEFAULT '{}',
  questions_asked TEXT[] DEFAULT '{}',
  next_steps TEXT,

  -- Contact Information Collected During Call
  decision_maker_name VARCHAR(255),
  decision_maker_email VARCHAR(255),
  decision_maker_phone VARCHAR(50),
  best_callback_time VARCHAR(100),

  -- Follow-up Actions
  follow_up_required BOOLEAN DEFAULT false,
  follow_up_type VARCHAR(50),
  follow_up_date TIMESTAMP WITH TIME ZONE,
  follow_up_notes TEXT,

  -- Cost Tracking
  call_cost DECIMAL(10,4),

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for voice_ai_call_logs
CREATE INDEX IF NOT EXISTS idx_voice_ai_call_logs_lead_id ON voice_ai_call_logs(lead_id);
CREATE INDEX IF NOT EXISTS idx_voice_ai_call_logs_campaign_id ON voice_ai_call_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_voice_ai_call_logs_retell_call_id ON voice_ai_call_logs(retell_call_id);
CREATE INDEX IF NOT EXISTS idx_voice_ai_call_logs_call_status ON voice_ai_call_logs(call_status);
CREATE INDEX IF NOT EXISTS idx_voice_ai_call_logs_call_outcome ON voice_ai_call_logs(call_outcome);
CREATE INDEX IF NOT EXISTS idx_voice_ai_call_logs_started_at ON voice_ai_call_logs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_ai_call_logs_interest_level ON voice_ai_call_logs(interest_level);

-- ============================================================================
-- TABLE 4: voice_ai_research_queue
-- Queue for pre-call research processing
-- ============================================================================
CREATE TABLE IF NOT EXISTS voice_ai_research_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  lead_id UUID NOT NULL REFERENCES voice_ai_leads(id) ON DELETE CASCADE,

  status VARCHAR(50) DEFAULT 'Queued' CHECK (status IN (
    'Queued',
    'Processing',
    'Complete',
    'Failed'
  )),

  priority INT DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),

  -- Research Progress
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Error Tracking
  error_message TEXT,
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(lead_id)
);

-- Indexes for voice_ai_research_queue
CREATE INDEX IF NOT EXISTS idx_voice_ai_research_queue_status ON voice_ai_research_queue(status);
CREATE INDEX IF NOT EXISTS idx_voice_ai_research_queue_priority ON voice_ai_research_queue(priority);

-- ============================================================================
-- TABLE 5: voice_ai_call_queue
-- Queue for outbound calls
-- ============================================================================
CREATE TABLE IF NOT EXISTS voice_ai_call_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  lead_id UUID NOT NULL REFERENCES voice_ai_leads(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES voice_ai_campaigns(id) ON DELETE CASCADE,

  status VARCHAR(50) DEFAULT 'Queued' CHECK (status IN (
    'Queued',
    'Calling',
    'Complete',
    'Failed',
    'Skipped'
  )),

  priority INT DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),

  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE,
  attempt_number INT DEFAULT 1,

  -- Call Progress
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- Result
  call_log_id UUID REFERENCES voice_ai_call_logs(id),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for voice_ai_call_queue
CREATE INDEX IF NOT EXISTS idx_voice_ai_call_queue_status ON voice_ai_call_queue(status);
CREATE INDEX IF NOT EXISTS idx_voice_ai_call_queue_campaign_id ON voice_ai_call_queue(campaign_id);
CREATE INDEX IF NOT EXISTS idx_voice_ai_call_queue_scheduled_for ON voice_ai_call_queue(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_voice_ai_call_queue_priority ON voice_ai_call_queue(priority);

-- ============================================================================
-- TABLE 6: voice_ai_settings
-- System settings for Voice AI module
-- ============================================================================
CREATE TABLE IF NOT EXISTS voice_ai_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Retell AI Configuration
  retell_api_key VARCHAR(500),
  retell_default_agent_id VARCHAR(255),

  -- Industry-Specific Agent IDs
  retell_plumbing_agent_id VARCHAR(255),
  retell_hvac_agent_id VARCHAR(255),
  retell_home_services_agent_id VARCHAR(255),

  -- Calling Limits
  daily_call_limit INT DEFAULT 50,
  concurrent_calls INT DEFAULT 1,
  max_retry_attempts INT DEFAULT 3,
  hours_between_retries INT DEFAULT 4,

  -- Province-Specific Settings (JSON)
  province_settings JSONB DEFAULT '{
    "BC": {"timezone": "America/Vancouver", "calling_hours_start": "09:00", "calling_hours_end": "17:00"},
    "AB": {"timezone": "America/Edmonton", "calling_hours_start": "09:00", "calling_hours_end": "17:00"},
    "ON": {"timezone": "America/Toronto", "calling_hours_start": "09:00", "calling_hours_end": "17:00"},
    "QC": {"timezone": "America/Toronto", "calling_hours_start": "09:00", "calling_hours_end": "17:00", "language": "fr"}
  }'::jsonb,

  -- Compliance Settings
  auto_announce_recording BOOLEAN DEFAULT true,
  quebec_french_enabled BOOLEAN DEFAULT false,

  -- Do Not Call List
  dnc_list TEXT[] DEFAULT '{}',

  -- Industry Templates (JSON)
  industry_prompts JSONB DEFAULT '{
    "Plumbing": {
      "painPoints": ["Emergency calls after hours", "No online booking", "Missed calls"],
      "solutions": ["24/7 AI receptionist", "Online booking system", "Quote automation"]
    },
    "HVAC": {
      "painPoints": ["Seasonal overload", "Maintenance reminders", "Quote follow-ups"],
      "solutions": ["Seasonal campaign automation", "Auto maintenance reminders", "Quote follow-up system"]
    },
    "Home Services": {
      "painPoints": ["Lead response time", "No CRM", "Manual scheduling"],
      "solutions": ["Instant lead response", "CRM integration", "Automated scheduling"]
    }
  }'::jsonb,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO voice_ai_settings (id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_voice_ai_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
DROP TRIGGER IF EXISTS trigger_voice_ai_leads_updated_at ON voice_ai_leads;
CREATE TRIGGER trigger_voice_ai_leads_updated_at
  BEFORE UPDATE ON voice_ai_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_ai_updated_at();

DROP TRIGGER IF EXISTS trigger_voice_ai_campaigns_updated_at ON voice_ai_campaigns;
CREATE TRIGGER trigger_voice_ai_campaigns_updated_at
  BEFORE UPDATE ON voice_ai_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_ai_updated_at();

DROP TRIGGER IF EXISTS trigger_voice_ai_call_logs_updated_at ON voice_ai_call_logs;
CREATE TRIGGER trigger_voice_ai_call_logs_updated_at
  BEFORE UPDATE ON voice_ai_call_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_ai_updated_at();

DROP TRIGGER IF EXISTS trigger_voice_ai_research_queue_updated_at ON voice_ai_research_queue;
CREATE TRIGGER trigger_voice_ai_research_queue_updated_at
  BEFORE UPDATE ON voice_ai_research_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_ai_updated_at();

DROP TRIGGER IF EXISTS trigger_voice_ai_call_queue_updated_at ON voice_ai_call_queue;
CREATE TRIGGER trigger_voice_ai_call_queue_updated_at
  BEFORE UPDATE ON voice_ai_call_queue
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_ai_updated_at();

DROP TRIGGER IF EXISTS trigger_voice_ai_settings_updated_at ON voice_ai_settings;
CREATE TRIGGER trigger_voice_ai_settings_updated_at
  BEFORE UPDATE ON voice_ai_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_voice_ai_updated_at();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to auto-set timezone based on province
CREATE OR REPLACE FUNCTION set_lead_timezone()
RETURNS TRIGGER AS $$
BEGIN
  NEW.timezone := CASE NEW.province
    WHEN 'BC' THEN 'America/Vancouver'
    WHEN 'AB' THEN 'America/Edmonton'
    WHEN 'ON' THEN 'America/Toronto'
    WHEN 'QC' THEN 'America/Toronto'
    ELSE 'America/Toronto'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_lead_timezone ON voice_ai_leads;
CREATE TRIGGER trigger_set_lead_timezone
  BEFORE INSERT OR UPDATE OF province ON voice_ai_leads
  FOR EACH ROW
  EXECUTE FUNCTION set_lead_timezone();

-- Function to update campaign stats when call is logged
CREATE OR REPLACE FUNCTION update_campaign_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.campaign_id IS NOT NULL THEN
    UPDATE voice_ai_campaigns
    SET
      calls_made = calls_made + 1,
      calls_completed = calls_completed +
        CASE WHEN NEW.call_status = 'completed' THEN 1 ELSE 0 END,
      demos_booked = demos_booked +
        CASE WHEN NEW.call_outcome = 'Booked Demo' THEN 1 ELSE 0 END,
      conversion_rate =
        CASE
          WHEN calls_made + 1 > 0
          THEN ROUND((demos_booked + CASE WHEN NEW.call_outcome = 'Booked Demo' THEN 1 ELSE 0 END)::numeric / (calls_made + 1)::numeric * 100, 2)
          ELSE 0
        END,
      updated_at = NOW()
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_campaign_stats ON voice_ai_call_logs;
CREATE TRIGGER trigger_update_campaign_stats
  AFTER INSERT ON voice_ai_call_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_stats();

-- Function to update lead status after call
CREATE OR REPLACE FUNCTION update_lead_after_call()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE voice_ai_leads
  SET
    status = CASE
      WHEN NEW.call_outcome = 'Booked Demo' THEN 'Interested'
      WHEN NEW.call_outcome = 'Interested - Follow Up' THEN 'Interested'
      WHEN NEW.call_outcome = 'Not Interested' THEN 'Not Interested'
      WHEN NEW.call_outcome = 'Do Not Call' THEN 'Do Not Call'
      WHEN NEW.call_outcome = 'Wrong Number' THEN 'Invalid Number'
      ELSE 'Call Completed'
    END,
    call_attempts = call_attempts + 1,
    updated_at = NOW()
  WHERE id = NEW.lead_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_lead_after_call ON voice_ai_call_logs;
CREATE TRIGGER trigger_update_lead_after_call
  AFTER INSERT ON voice_ai_call_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_after_call();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE voice_ai_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_ai_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_ai_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_ai_research_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_ai_call_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_ai_settings ENABLE ROW LEVEL SECURITY;

-- Policies: Allow all operations for authenticated users
CREATE POLICY "Allow all for authenticated users" ON voice_ai_leads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON voice_ai_campaigns
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON voice_ai_call_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON voice_ai_research_queue
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON voice_ai_call_queue
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for authenticated users" ON voice_ai_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Policies: Allow service role (for API/MCP server)
CREATE POLICY "Allow all for service role" ON voice_ai_leads
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON voice_ai_campaigns
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON voice_ai_call_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON voice_ai_research_queue
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON voice_ai_call_queue
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow all for service role" ON voice_ai_settings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View: Active call queue with lead details
CREATE OR REPLACE VIEW voice_ai_active_queue AS
SELECT
  q.id,
  q.status,
  q.scheduled_for,
  q.attempt_number,
  l.business_name,
  l.phone,
  l.province,
  l.industry,
  c.name AS campaign_name
FROM voice_ai_call_queue q
JOIN voice_ai_leads l ON q.lead_id = l.id
LEFT JOIN voice_ai_campaigns c ON q.campaign_id = c.id
WHERE q.status IN ('Queued', 'Calling')
ORDER BY q.priority ASC, q.scheduled_for ASC;

-- View: Campaign performance summary
CREATE OR REPLACE VIEW voice_ai_campaign_performance AS
SELECT
  c.id,
  c.name,
  c.status,
  c.industry,
  c.total_leads,
  c.calls_made,
  c.calls_completed,
  c.demos_booked,
  c.conversion_rate,
  COALESCE(SUM(cl.call_cost), 0) AS total_cost,
  COALESCE(AVG(cl.duration_seconds), 0) AS avg_duration_seconds
FROM voice_ai_campaigns c
LEFT JOIN voice_ai_call_logs cl ON c.id = cl.campaign_id
GROUP BY c.id;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE voice_ai_leads IS 'Voice AI leads for cold calling in BC, AB, ON, QC';
COMMENT ON TABLE voice_ai_campaigns IS 'Voice AI calling campaigns with daily limit of 50 calls';
COMMENT ON TABLE voice_ai_call_logs IS 'Detailed call logs with transcripts and Retell AI data';
COMMENT ON TABLE voice_ai_research_queue IS 'Queue for pre-call business research';
COMMENT ON TABLE voice_ai_call_queue IS 'Queue for outbound voice AI calls';
COMMENT ON TABLE voice_ai_settings IS 'System settings for Voice AI module';

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
