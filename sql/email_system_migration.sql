-- Email Templates Table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('welcome', 'follow-up', 'nurture', 'proposal', 'closing', 'win', 'lost', 'custom')),
    lead_stage VARCHAR(100),
    industry VARCHAR(100),
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(255) NOT NULL,
    stats JSONB DEFAULT '{"sent": 0, "opened": 0, "clicked": 0, "replied": 0}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Email Campaigns Table
CREATE TABLE IF NOT EXISTS email_campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed')),
    type VARCHAR(50) NOT NULL CHECK (type IN ('one-time', 'sequence', 'drip')),
    template_id UUID REFERENCES email_templates(id),
    sequence_templates JSONB DEFAULT '[]'::jsonb,
    target_segment JSONB DEFAULT '{}'::jsonb,
    schedule JSONB DEFAULT '{}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    stats JSONB DEFAULT '{"totalTargeted": 0, "sent": 0, "delivered": 0, "bounced": 0, "opened": 0, "clicked": 0, "unsubscribed": 0, "replied": 0}'::jsonb,
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Email Sequences Table
CREATE TABLE IF NOT EXISTS email_sequences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger VARCHAR(100) NOT NULL CHECK (trigger IN ('manual', 'lead-stage-change', 'date-based', 'lead-score', 'tag-added')),
    trigger_conditions JSONB DEFAULT '{}'::jsonb,
    steps JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    stats JSONB DEFAULT '{"enrolled": 0, "completed": 0, "dropOffRate": 0}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Email Logs Table
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID,
    campaign_id UUID REFERENCES email_campaigns(id),
    sequence_id UUID REFERENCES email_sequences(id),
    template_id UUID REFERENCES email_templates(id),
    subject TEXT NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('sent', 'delivered', 'bounced', 'opened', 'clicked', 'replied', 'unsubscribed')),
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_templates_type ON email_templates(type);
CREATE INDEX IF NOT EXISTS idx_email_templates_active ON email_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_template_id ON email_logs(template_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent_at ON email_logs(sent_at);

-- Update triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_campaigns_updated_at BEFORE UPDATE ON email_campaigns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_email_sequences_updated_at BEFORE UPDATE ON email_sequences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default templates
INSERT INTO email_templates (name, subject, content, type, lead_stage, variables, created_by) VALUES
(
    'Welcome - New Lead',
    'Welcome {{firstName}} - Let''s Transform Your {{industry}} Business',
    'Hi {{firstName}},

Welcome to Cold Solutions! I noticed your interest in improving your {{industry}} operations.

We''ve helped over 200+ businesses like {{company}} reduce costs by 30% while improving efficiency.

I''d love to schedule a quick 15-minute call to discuss:
• Your current challenges with {{painPoint}}
• How we''ve solved similar issues for {{industry}} companies
• A custom solution tailored to {{company}}

Are you available for a brief call this week?

Best regards,
{{senderName}}
{{senderTitle}}
Cold Solutions

P.S. Check out our recent case study with a similar {{industry}} company: {{caseStudyLink}}',
    'welcome',
    'New',
    '["firstName", "lastName", "company", "industry", "painPoint", "senderName", "senderTitle", "caseStudyLink"]'::jsonb,
    'system'
),
(
    'Follow-up - No Response',
    'Quick follow-up on {{company}}''s {{industry}} optimization',
    'Hi {{firstName}},

I wanted to quickly follow up on my previous email about helping {{company}} optimize your {{industry}} operations.

I understand you''re busy, so I''ll keep this brief.

Many {{industry}} companies are facing:
• Rising operational costs
• Inefficient processes
• Compliance challenges

We''ve developed proven solutions that have saved our clients an average of $50,000+ annually.

Would a 10-minute call work better for you? I have slots available this week.

If you''d like to schedule a time, just reply with your preferred day and time.

Best,
{{senderName}}

P.S. If you''d prefer to see results first, here''s a {{industry}} case study: {{caseStudyLink}}',
    'follow-up',
    'Contacted',
    '["firstName", "company", "industry", "senderName", "caseStudyLink"]'::jsonb,
    'system'
);