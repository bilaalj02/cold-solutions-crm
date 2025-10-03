-- Create email_sends table to track individual email sends
CREATE TABLE IF NOT EXISTS email_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  template_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  subject TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT NOT NULL CHECK (status IN ('delivered', 'failed', 'bounced')),
  industry TEXT DEFAULT 'general',
  lead_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_email_sends_template_id ON email_sends(template_id);
CREATE INDEX IF NOT EXISTS idx_email_sends_recipient_email ON email_sends(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_sends_sent_at ON email_sends(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_sends_status ON email_sends(status);
CREATE INDEX IF NOT EXISTS idx_email_sends_industry ON email_sends(industry);

-- Add RLS (Row Level Security) policies
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users"
  ON email_sends
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Allow insert for anon users (for API tracking endpoint)
CREATE POLICY "Allow insert for anon users"
  ON email_sends
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy: Allow select for anon users
CREATE POLICY "Allow select for anon users"
  ON email_sends
  FOR SELECT
  TO anon
  USING (true);

-- Function to update email_templates stats when email is sent
CREATE OR REPLACE FUNCTION update_template_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the template stats
  UPDATE email_templates
  SET stats = COALESCE(stats, '{}'::jsonb) ||
    jsonb_build_object(
      'total_sent', COALESCE((stats->>'total_sent')::int, 0) + 1,
      'total_delivered', COALESCE((stats->>'total_delivered')::int, 0) +
        CASE WHEN NEW.status = 'delivered' THEN 1 ELSE 0 END,
      'total_failed', COALESCE((stats->>'total_failed')::int, 0) +
        CASE WHEN NEW.status IN ('failed', 'bounced') THEN 1 ELSE 0 END,
      'last_sent', NOW(),
      'by_industry', COALESCE(stats->'by_industry', '{}'::jsonb) ||
        jsonb_build_object(
          NEW.industry,
          jsonb_build_object(
            'sent', COALESCE((stats->'by_industry'->NEW.industry->>'sent')::int, 0) + 1,
            'delivered', COALESCE((stats->'by_industry'->NEW.industry->>'delivered')::int, 0) +
              CASE WHEN NEW.status = 'delivered' THEN 1 ELSE 0 END
          )
        )
    ),
    updated_at = NOW()
  WHERE id = NEW.template_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update stats
CREATE TRIGGER trigger_update_template_stats
  AFTER INSERT ON email_sends
  FOR EACH ROW
  EXECUTE FUNCTION update_template_stats();

-- Add comment for documentation
COMMENT ON TABLE email_sends IS 'Tracks individual email sends for analytics and performance monitoring';
