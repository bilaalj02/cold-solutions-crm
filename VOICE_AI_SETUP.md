# Voice AI System Setup Guide

## ✅ Step 1: Backend API Routes (COMPLETE)

All API routes have been created in `app/api/voice-ai/`:
- ✅ `/api/voice-ai/leads` - Lead management and CSV import
- ✅ `/api/voice-ai/leads/research` - Trigger pre-call research
- ✅ `/api/voice-ai/campaigns` - Campaign management
- ✅ `/api/voice-ai/campaigns/[id]/start` - Start campaign
- ✅ `/api/voice-ai/campaigns/[id]/pause` - Pause campaign
- ✅ `/api/voice-ai/campaigns/[id]/resume` - Resume campaign
- ✅ `/api/voice-ai/queue` - Queue monitoring
- ✅ `/api/voice-ai/call-logs` - Call history
- ✅ `/api/voice-ai/call-logs/[id]` - Single call details
- ✅ `/api/voice-ai/analytics` - Analytics dashboard
- ✅ `/api/voice-ai/settings` - System settings

## 📋 Step 2: Database Migration (IN PROGRESS)

### Manual Migration Steps (Recommended):

1. **Open Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your Cold Solutions CRM project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Execute SQL**
   - Open the file: `sql/voice_ai_system.sql`
   - Copy ALL contents
   - Paste into the Supabase SQL Editor
   - Click "Run" (or press Ctrl+Enter)

4. **Verify Tables Created**
   After running the SQL, verify these 6 tables exist:
   - ✅ `voice_ai_leads` - Main leads table
   - ✅ `voice_ai_campaigns` - Campaign configurations
   - ✅ `voice_ai_call_logs` - Call history and recordings
   - ✅ `voice_ai_research_queue` - Pre-call research queue
   - ✅ `voice_ai_call_queue` - Active calling queue
   - ✅ `voice_ai_settings` - System settings

5. **Check Row Level Security (RLS)**
   - Go to "Authentication" > "Policies"
   - Verify policies exist for each table
   - All tables should have policies enabled

### Alternative: Node.js Script (Check Only)

Run the migration check script:
```bash
node scripts/run-voice-ai-migration.js
```

This script will check if tables exist and guide you through manual setup.

## 🔑 Step 3: Environment Variables

Add to your `.env.local` file:

```bash
# Existing Supabase credentials (already set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# MCP Server Connection (for Voice AI backend)
MCP_SERVER_URL=http://localhost:3001

# Retell AI Credentials (for voice calling)
RETELL_API_KEY=your_retell_api_key_here
RETELL_DEFAULT_AGENT_ID=your_default_agent_id_here
RETELL_FROM_NUMBER=+1234567890

# Voice AI Limits
VOICE_AI_DAILY_CALL_LIMIT=50
```

## 🧪 Step 4: Test the System

### Test 1: Import Sample Leads

1. Go to `http://localhost:3000/voice-ai/leads`
2. Download the CSV template
3. Add 2-3 sample leads
4. Import the CSV
5. Verify leads appear in the table

### Test 2: Trigger Research

1. Select imported leads
2. Click "Trigger Research"
3. Watch research status change to "Queued"
4. Check MCP server logs for research activity

### Test 3: Create Campaign

1. Go to `http://localhost:3000/voice-ai/campaigns`
2. Click "Create Campaign"
3. Fill in details:
   - Name: "Test Campaign - BC Plumbers"
   - Industry: Plumbing
   - Provinces: BC
   - Daily Limit: 5
4. Create and verify campaign appears

### Test 4: Check Queue

1. Go to `http://localhost:3000/voice-ai/queue`
2. Verify real-time updates work
3. Auto-refresh should update every 5 seconds

### Test 5: View Analytics

1. Go to `http://localhost:3000/voice-ai/analytics`
2. Verify metrics display (will be 0 initially)
3. Test date range filter

### Test 6: Configure Settings

1. Go to `http://localhost:3000/voice-ai/settings`
2. Adjust calling hours
3. Save settings
4. Verify settings persist

## 🔌 Step 5: Connect to MCP Server

The MCP server handles the actual voice AI logic. Make sure it's running:

```bash
cd ../cold-solutions-mcp-server
npm run dev
```

The MCP server should be running on `http://localhost:3001`

## 🎯 Step 6: Production Checklist

Before going live:

- [ ] Database migration completed successfully
- [ ] All 6 tables exist in Supabase
- [ ] RLS policies enabled and tested
- [ ] Environment variables configured
- [ ] MCP server running and accessible
- [ ] Retell AI account set up with credits
- [ ] Test campaign completed successfully
- [ ] Sample CSV import works
- [ ] Pre-call research integration tested
- [ ] Queue monitoring functional
- [ ] Analytics displaying correctly
- [ ] Settings saving properly

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────┐
│           Cold Solutions CRM (Frontend)              │
│         http://localhost:3000/voice-ai/*            │
│                                                      │
│  Pages:                                             │
│  - Leads (Import, Manage, Research)                 │
│  - Campaigns (Create, Start, Monitor)               │
│  - Queue (Real-time Call Monitoring)                │
│  - Call Logs (History, Transcripts)                 │
│  - Analytics (Performance Metrics)                  │
│  - Settings (System Configuration)                  │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ API Routes (/api/voice-ai/*)
                   │
┌──────────────────▼──────────────────────────────────┐
│              Supabase Database                       │
│                                                      │
│  Tables:                                            │
│  - voice_ai_leads                                   │
│  - voice_ai_campaigns                               │
│  - voice_ai_call_logs                               │
│  - voice_ai_research_queue                          │
│  - voice_ai_call_queue                              │
│  - voice_ai_settings                                │
└──────────────────┬──────────────────────────────────┘
                   │
                   │
┌──────────────────▼──────────────────────────────────┐
│        MCP Server (Backend Processing)              │
│         http://localhost:3001/api/voice-ai/*        │
│                                                      │
│  Services:                                          │
│  - Research Orchestration                           │
│  - Call Queue Management                            │
│  - Retell AI Integration                            │
│  - Webhook Handling                                 │
│  - AI Analysis (OpenAI)                             │
└──────────────────┬──────────────────────────────────┘
                   │
                   │
┌──────────────────▼──────────────────────────────────┐
│              Retell AI Platform                      │
│                                                      │
│  - Voice Agent Management                           │
│  - Phone Call Execution                             │
│  - Real-time Transcription                          │
│  - Call Recording                                   │
└─────────────────────────────────────────────────────┘
```

## 🚀 Quick Start Commands

```bash
# Terminal 1: CRM Frontend
cd cold-solutions-crm
npm run dev

# Terminal 2: MCP Server Backend
cd cold-solutions-mcp-server
npm run dev

# Terminal 3: Check Migration Status
cd cold-solutions-crm
node scripts/run-voice-ai-migration.js
```

## 🆘 Troubleshooting

### Issue: Tables not appearing in Supabase
**Solution**: Run the SQL manually in Supabase SQL Editor (see Step 2)

### Issue: API routes returning 500 errors
**Solution**: Check that database tables exist and environment variables are set

### Issue: Research not triggering
**Solution**: Verify MCP server is running on port 3001

### Issue: Queue not updating
**Solution**: Enable auto-refresh on queue page, verify Supabase connection

### Issue: Settings not saving
**Solution**: Check that voice_ai_settings table exists in Supabase

## 📞 Support

For issues or questions:
1. Check this setup guide
2. Review API route error logs in browser console
3. Check MCP server logs for backend errors
4. Verify Supabase table structure matches SQL schema
