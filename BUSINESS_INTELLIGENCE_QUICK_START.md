# Business Intelligence - Quick Start Guide

## Overview

The Business Intelligence system is now integrated into the Cold Solutions CRM. It allows you to:

1. **Import leads** from CSV in the CRM
2. **Send to MCP server** for AI analysis
3. **View results** in the CRM
4. **Push to Cold Caller** with one click

**Key Point:** The CRM provides the UI, the MCP server does the analysis.

---

## Setup (5 Minutes)

### Step 1: Ensure MCP Server is Running

Your MCP server should already be configured and running:

```bash
cd cold-solutions-mcp-server
npm start
```

The MCP server runs on **http://localhost:3000** and has all the API keys configured.

### Step 2: Run Database Migration in CRM

1. Go to your Supabase dashboard → SQL Editor
2. Copy the contents of: `supabase/migrations/20250109_business_intelligence_system.sql`
3. Paste and click "Run"

This creates:
- `business_intelligence_leads` - Stores imported leads
- `business_analysis` - Stores analysis results from MCP

### Step 3: Install CSV Parser (if not already installed)

```bash
cd cold-solutions-crm
npm install csv-parse
```

### Step 4: Start the CRM

```bash
npm run dev
```

Navigate to: **http://localhost:3001/leads/intelligence**

(CRM runs on port 3001 to avoid conflict with MCP on port 3000)

---

## How It Works

```
CRM (Port 3001)                    MCP Server (Port 3000)
    │                                      │
    │ 1. Import CSV                        │
    ├──────────────────────────────────────┤
    │                                      │
    │ 2. Send leads for analysis           │
    ├─────────────────────────────────────>│
    │                                      │
    │                                      │ 3. Google Places API
    │                                      │ 4. Website Scraping
    │                                      │ 5. Competitor Discovery
    │                                      │ 6. OpenAI Analysis
    │                                      │
    │ 7. Receive results                   │
    │<─────────────────────────────────────┤
    │                                      │
    │ 8. Store in CRM database             │
    │ 9. Display in UI                     │
    │10. Push to Cold Caller               │
    │                                      │
```

---

## Using the System

### 1. Access Business Intelligence

In the CRM sidebar, go to: **Leads → Business Intelligence**

Or navigate directly to: `http://localhost:3001/leads/intelligence`

### 2. Import Leads

1. Click "📥 Import CSV"
2. Use the sample template: `public/sample-leads-template.csv`
3. Required fields: `business_name`, `city`, `country`
4. Optional: `industry`, `website`, `state`, `address`, `zip_code`, `phone`, `google_maps_url`

### 3. Analyze Leads

1. Click "🤖 Analyze All" to analyze all unanalyzed leads
2. Or select specific leads and click "🔍 Analyze Selected"
3. The CRM sends leads to the MCP server
4. MCP server processes them (same logic as before)
5. Results are sent back and stored in CRM database

### 4. View Results

1. Click "View Details →" on any completed lead
2. See comprehensive analysis:
   - Executive summary
   - Outreach angle
   - Pain points
   - Automation opportunities
   - Competitive insights
   - Review sentiment
   - And more!

### 5. Push to Cold Caller

1. Select analyzed leads
2. Click "📤 Push to Caller"
3. Leads are added to today's auto-created list with full pre-call intelligence

---

## What Changed from Notion

### Before (Notion Workflow):
1. Import CSV to Notion
2. Run MCP server script
3. MCP writes back to Notion
4. Manually export/sync to Cold Caller
5. View data in Notion tables

### After (CRM Workflow):
1. Import CSV in CRM ✅
2. Click "Analyze" → CRM calls MCP ✅
3. View results in CRM ✅
4. Click "Push" → Auto-sync to Cold Caller ✅

**Same analysis quality, better UX, no Notion dependency!**

---

## Troubleshooting

### "Failed to connect to MCP server"
- Check MCP server is running on port 3000
- Check `.env.local` has: `MCP_SERVER_URL=http://localhost:3000`

### "No leads found to analyze"
- Make sure you've imported leads via CSV first
- Check leads have status "Not Started"

### CRM and MCP both run on same port
- CRM should run on port 3001 (check `package.json` dev script)
- MCP runs on port 3000
- Update your CRM's `next.config.js` if needed:
  ```js
  module.exports = {
    // ... other config
    serverOptions: {
      port: 3001
    }
  }
  ```

---

## Benefits

✅ **Unified Interface** - All in one CRM
✅ **Uses Existing MCP** - Same analysis quality
✅ **Better UX** - Custom UI vs Notion tables
✅ **Auto-sync** - One-click push to Cold Caller
✅ **No Notion** - Eliminated dependency
✅ **Same Cost** - $0.07 per lead (unchanged)

---

## Next Steps

1. Import your real leads CSV
2. Analyze a small batch (5-10) to test
3. Review the analysis quality
4. Push to Cold Caller
5. Scale up!

**Your Business Intelligence system is now fully integrated into the CRM!** 🎉
