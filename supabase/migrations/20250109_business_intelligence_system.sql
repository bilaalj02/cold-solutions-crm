-- Business Intelligence System Migration
-- Creates tables for lead import, analysis, and management

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Business intelligence leads table
CREATE TABLE IF NOT EXISTS business_intelligence_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  city TEXT NOT NULL,
  state TEXT,
  country TEXT NOT NULL,
  address TEXT,
  zip_code TEXT,
  phone TEXT,
  google_maps_url TEXT,
  analysis_status TEXT DEFAULT 'Not Started' CHECK (analysis_status IN ('Not Started', 'In Progress', 'Complete', 'Failed')),
  pushed_to_caller BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business analysis results table
CREATE TABLE IF NOT EXISTS business_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID REFERENCES business_intelligence_leads(id) ON DELETE CASCADE,

  -- Core analysis fields
  summary TEXT,
  outreach_angle TEXT,
  pain_points JSONB DEFAULT '[]'::jsonb, -- array of strings
  automation_opportunities JSONB DEFAULT '[]'::jsonb, -- array of strings
  recommended_services JSONB DEFAULT '[]'::jsonb, -- array of strings
  competitive_advantages JSONB DEFAULT '[]'::jsonb, -- array of strings

  -- Business metrics
  google_rating NUMERIC(2,1),
  total_reviews INTEGER,
  competitors_found INTEGER,

  -- Enhanced analysis data
  detected_technologies JSONB, -- { crm, bookingSystem, liveChat, phoneSystem, emailMarketing, other }
  competitor_insights JSONB, -- { mainCompetitors, competitorWeaknesses, differentiationOpportunities, marketPosition }
  review_sentiment JSONB, -- { commonComplaints, commonPraises, urgentIssues, sentimentScore, reviewThemes }

  -- Raw data storage
  raw_data JSONB, -- full analysis output including Google Places, website data, etc.

  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(lead_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_bi_leads_status ON business_intelligence_leads(analysis_status);
CREATE INDEX IF NOT EXISTS idx_bi_leads_pushed ON business_intelligence_leads(pushed_to_caller);
CREATE INDEX IF NOT EXISTS idx_bi_leads_created ON business_intelligence_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bi_leads_industry ON business_intelligence_leads(industry);
CREATE INDEX IF NOT EXISTS idx_analysis_lead_id ON business_analysis(lead_id);
CREATE INDEX IF NOT EXISTS idx_analysis_analyzed_at ON business_analysis(analyzed_at DESC);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_bi_leads_updated_at
  BEFORE UPDATE ON business_intelligence_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE business_intelligence_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_analysis ENABLE ROW LEVEL SECURITY;

-- Policies: Allow authenticated users full access
CREATE POLICY "Allow authenticated users full access to BI leads"
  ON business_intelligence_leads
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users full access to BI analysis"
  ON business_analysis
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Service role bypass (for API operations)
CREATE POLICY "Service role bypass for BI leads"
  ON business_intelligence_leads
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role bypass for BI analysis"
  ON business_analysis
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- View to combine leads with their analysis
CREATE OR REPLACE VIEW business_intelligence_complete AS
SELECT
  l.id,
  l.business_name,
  l.industry,
  l.website,
  l.city,
  l.state,
  l.country,
  l.address,
  l.zip_code,
  l.phone,
  l.google_maps_url,
  l.analysis_status,
  l.pushed_to_caller,
  l.error_message,
  l.created_at,
  l.updated_at,
  a.summary,
  a.outreach_angle,
  a.pain_points,
  a.automation_opportunities,
  a.recommended_services,
  a.competitive_advantages,
  a.google_rating,
  a.total_reviews,
  a.competitors_found,
  a.detected_technologies,
  a.competitor_insights,
  a.review_sentiment,
  a.analyzed_at
FROM business_intelligence_leads l
LEFT JOIN business_analysis a ON l.id = a.lead_id;

-- Grant access to the view
GRANT SELECT ON business_intelligence_complete TO authenticated, service_role;

-- Comments for documentation
COMMENT ON TABLE business_intelligence_leads IS 'Stores imported business leads for AI analysis';
COMMENT ON TABLE business_analysis IS 'Stores AI-generated analysis results for each business lead';
COMMENT ON COLUMN business_intelligence_leads.analysis_status IS 'Current status: Not Started, In Progress, Complete, or Failed';
COMMENT ON COLUMN business_intelligence_leads.pushed_to_caller IS 'Whether this lead has been pushed to the cold caller app';
COMMENT ON COLUMN business_analysis.raw_data IS 'Full JSON output from analysis including all scraped data';
