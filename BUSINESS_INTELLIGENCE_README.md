# Business Intelligence System - Complete Guide

## 🎯 Overview

The Business Intelligence system allows you to:
1. **Import leads** from CSV files
2. **Analyze businesses** using AI (Google Places + OpenAI)
3. **Generate insights** (automation opportunities, pain points, outreach angles)
4. **Push leads** to the Cold Caller app with pre-call intelligence

This replaces the Notion-based workflow with a fully integrated CRM solution.

---

## 🚀 Quick Start

### Step 1: Set Up Environment Variables

Add these to your `.env.local` file:

```env
# Existing Supabase variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Business Intelligence (same keys as MCP server)
GOOGLE_PLACES_API_KEY=your_google_places_api_key
OPENAI_API_KEY=sk-your_openai_key
```

### Step 2: Run Database Migration

```bash
cd cold-solutions-crm

# Install dependencies
npm install

# Run the migration (if using Supabase CLI)
# Or copy the SQL from supabase/migrations/20250109_business_intelligence_system.sql
# and run it in your Supabase SQL editor
```

### Step 3: Install Playwright Browsers

```bash
npx playwright install chromium
```

### Step 4: Start the Application

```bash
npm run dev
```

Navigate to: `http://localhost:3000/leads/intelligence`

---

## 📋 How to Use

### 1. Import Leads from CSV

**Download Template:**
- Sample CSV: `/public/sample-leads-template.csv`

**Required Columns:**
- `business_name` - Name of the business (required)
- `city` - City location (required)
- `country` - Country (required)

**Optional Columns:**
- `industry` - Business industry/category
- `website` - Business website URL
- `state` - State/Province
- `address` - Street address
- `zip_code` - Postal code
- `phone` - Phone number
- `google_maps_url` - Google Maps URL (for direct Place ID extraction)

**Steps:**
1. Click "📥 Import CSV" button
2. Select your CSV file
3. Review import results:
   - ✅ Imported: Successfully added
   - ⏭️ Duplicates: Skipped (already exist)
   - ❌ Errors: Invalid data

### 2. Analyze Leads

**Analyze All Unanalyzed:**
1. Click "🤖 Analyze All" button
2. Confirm cost estimate (approximately $0.07 per lead)
3. Wait for batch processing to complete

**Analyze Selected:**
1. Check boxes next to specific leads
2. Click "🔍 Analyze Selected"
3. Processing happens in batches of 5 leads

**What Happens During Analysis:**
- Google Places search (business data, rating, reviews)
- Website scraping (technology stack, services, contact info)
- Competitor discovery (finds 5 competitors in same area)
- AI analysis (generates insights using GPT-4)

**Processing Time:**
- 10 leads: ~5-7 minutes
- 50 leads: ~20-25 minutes
- 100 leads: ~40-45 minutes

**Cost Estimate:**
- Per lead: ~$0.07 (Google Places + OpenAI)
- 10 leads: ~$0.70
- 50 leads: ~$3.50
- 100 leads: ~$7.00

### 3. Review Analysis Results

**List View:**
- See all leads with status indicators
- Filter by: Status, Pushed to Caller
- Sort and search capabilities

**Detail View:**
- Click "View Details →" on any completed lead
- See comprehensive analysis:
  - Executive summary
  - Outreach angle (with copy button)
  - Pain points
  - Automation opportunities
  - Recommended services
  - Competitive insights
  - Review sentiment analysis
  - Detected technologies

### 4. Push to Cold Caller

**Single Lead:**
1. Open lead detail page
2. Click "📤 Push to Caller" button
3. Lead is added to today's auto-created list

**Multiple Leads:**
1. Select leads using checkboxes
2. Click "📤 Push to Caller" button
3. All selected leads pushed to same list

**What Gets Pushed:**
- All analysis data in `custom_fields.preCallNotes`
- Priority automatically assigned based on:
  - High: Many competitors + low rating
  - Medium: Default
  - Low: High rating (happy customers)

### 5. Access in Cold Caller

**View Pre-Call Intelligence:**
1. Go to Cold Caller app
2. Open lead from list
3. See "Pre-Call Notes" section with:
   - Summary
   - Pain points
   - Automation opportunities
   - Outreach angle
   - Competitor insights
   - And more!

---

## 🔧 Advanced Features

### Re-Analysis

**When to Re-Analyze:**
- Initial analysis failed
- Business updated their website
- Want fresh data after 3+ months

**How to Re-Analyze:**
1. Open lead detail page
2. Click "🔄 Re-analyze" button
3. Confirm cost ($0.07)
4. Wait for completion

### Filtering & Search

**Available Filters:**
- Status: Not Started, In Progress, Complete, Failed
- Pushed to Caller: Yes/No

**Stats Dashboard:**
- Total leads
- Not analyzed count
- Complete count
- Failed count
- Pushed to caller count

### Bulk Operations

**Delete Leads:**
1. Select leads with checkboxes
2. Click "🗑️ Delete" button
3. Confirm deletion

---

## 📊 Data Collected

### Google Places Data
- Business rating (out of 5)
- Total review count
- Price level ($-$$$$)
- Phone number
- Address
- Business hours
- Categories/types
- Recent reviews (up to 5)

### Website Data
- Page title and meta description
- Main headings
- Services mentioned
- Technology stack (WordPress, Shopify, etc.)
- Has contact form?
- Has live chat?
- Has booking system?
- Social media links
- Email addresses
- Phone numbers
- Detected tools (Calendly, Intercom, etc.)

### Competitor Data (Up to 5 Competitors)
- Name and rating
- Number of reviews
- Website
- Address
- Price level

### AI-Generated Insights
- **Automation Opportunities** (3-5 specific to their business)
- **Pain Points** (3-5 likely problems they face)
- **Business Summary** (2-3 sentences about digital maturity)
- **Outreach Angle** (personalized pitch)
- **Competitive Advantages** (2-3 advantages over competitors)
- **Recommended Services** (which Cold Solutions services they need)
- **Detected Technologies** (CRM, booking, live chat, etc.)
- **Competitor Insights** (market position, weaknesses, opportunities)
- **Review Sentiment** (complaints, praises, urgent issues, score)

---

## 🛠️ Troubleshooting

### "API keys not configured"
- Check `.env.local` has `GOOGLE_PLACES_API_KEY` and `OPENAI_API_KEY`
- Restart dev server after adding keys

### "No Google Places data found"
- Business may not have Google Business Profile
- Try adding `google_maps_url` to CSV for direct Place ID
- Check business name spelling

### "Analysis failed"
- Check API key quotas (Google Places, OpenAI)
- Check internet connection
- Review error message in lead detail

### "Website scraping failed"
- Website may block automated access
- SSL/certificate issues
- Website may be down
- Analysis will continue without website data

### Import shows all duplicates
- Leads already exist in database
- Check by business name + city combination
- Delete existing leads if you want to re-import

---

## 💰 Cost Management

### Google Places API
- **Free tier:** $200/month credit
- **Place Details:** $0.017 per request
- **Nearby Search:** $0.032 per request
- **Estimated per lead:** $0.05 (with competitors)

### OpenAI API
- **Model:** GPT-4o
- **Cost:** ~$0.01-0.02 per analysis
- **Total per lead:** ~$0.02

### Monthly Budget Example ($100)
- Can process approximately **1,400 leads/month**
- Well within typical usage

---

## 🔒 Security Notes

- RLS (Row Level Security) enabled on all tables
- Only authenticated users can access BI data
- Service role has full access for API operations
- API keys stored in environment variables (never committed)

---

## 📈 Database Schema

### Tables Created
1. **business_intelligence_leads** - Imported leads
2. **business_analysis** - Analysis results
3. **business_intelligence_complete** - View joining both

### Key Fields
- `analysis_status`: Not Started | In Progress | Complete | Failed
- `pushed_to_caller`: Boolean flag
- All analysis data stored in `business_analysis` table

---

## 🔗 Integration with Cold Caller

**Automatic Lead List Creation:**
- Format: "BI Leads - YYYY-MM-DD"
- Auto-created when pushing leads

**Pre-Call Notes Structure:**
```json
{
  "summary": "...",
  "painPoints": [...],
  "automationOpportunities": [...],
  "outreachAngle": "...",
  "recommendedServices": [...],
  "competitiveAdvantages": [...],
  "googleRating": 4.5,
  "totalReviews": 120,
  "competitorsFound": 5,
  "detectedTechnologies": {...},
  "competitorInsights": {...},
  "reviewSentiment": {...}
}
```

---

## 📞 Support

**For Issues:**
1. Check this documentation
2. Review error messages in browser console
3. Check API key quotas and billing
4. Review Supabase logs

**For Questions:**
- Refer to original MCP documentation for analysis details
- Check automation opportunities guide

---

## ✅ Migration from Notion Complete!

You can now:
- ✅ Import CSV directly in CRM
- ✅ Analyze with same AI logic as MCP
- ✅ Review results in custom UI
- ✅ Push to Cold Caller automatically
- ✅ No more Notion dependency!

**MCP Server Backup:**
- Keep MCP running as backup option
- Same API keys work for both
- Can run analyses in parallel if needed
