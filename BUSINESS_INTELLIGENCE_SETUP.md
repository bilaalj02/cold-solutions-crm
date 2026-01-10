# Business Intelligence System - Setup Instructions

## 🚀 Quick Setup (5 Minutes)

Follow these steps to get the Business Intelligence system running:

### Step 1: Install Dependencies

```bash
cd cold-solutions-crm
npm install
```

This will install:
- `csv-parse` - CSV file parsing
- `cheerio` - Website scraping
- `playwright` - Headless browser for web scraping
- `openai` - OpenAI API client

### Step 2: Install Playwright Browsers

```bash
npx playwright install chromium
```

This downloads the Chromium browser for website scraping.

### Step 3: Configure Environment Variables

Create or update `.env.local` in the root directory:

```env
# Existing Supabase variables (you already have these)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Business Intelligence - ADD THESE
GOOGLE_PLACES_API_KEY=your_google_places_api_key_here
OPENAI_API_KEY=sk-your_openai_key_here
```

**Where to get API keys:**

**Google Places API:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable "Places API" and "Geocoding API"
3. Create API key
4. Copy to `.env.local`

**OpenAI API:**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create API key
3. Copy to `.env.local` (starts with `sk-`)

### Step 4: Run Database Migration

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to your Supabase project dashboard
2. Click "SQL Editor"
3. Open the file: `supabase/migrations/20250109_business_intelligence_system.sql`
4. Copy all SQL content
5. Paste into Supabase SQL Editor
6. Click "Run"

**Option B: Using Supabase CLI**
```bash
supabase db push
```

### Step 5: Start the Application

```bash
npm run dev
```

Navigate to: `http://localhost:3000/leads/intelligence`

---

## ✅ Verify Setup

### Test 1: Access the Page
- Go to `http://localhost:3000/leads/intelligence`
- You should see the Business Intelligence dashboard
- Should show 0 leads initially

### Test 2: Import Sample CSV
1. Download sample template from `/public/sample-leads-template.csv`
2. Click "📥 Import CSV"
3. Select the sample CSV
4. Should import 3 sample leads successfully

### Test 3: Run Analysis
1. Click "🤖 Analyze All (3)"
2. Confirm the cost estimate
3. Wait 3-5 minutes for analysis to complete
4. Check that leads show "Complete" status

### Test 4: View Results
1. Click "View Details →" on any completed lead
2. Should see:
   - Executive summary
   - Outreach angle
   - Pain points
   - Automation opportunities
   - And more!

### Test 5: Push to Caller
1. Select a completed lead
2. Click "📤 Push to Caller"
3. Go to Cold Caller app
4. Check that lead appears with pre-call notes

---

## 🔧 Troubleshooting Setup

### "Cannot find module 'csv-parse'"
```bash
npm install csv-parse
```

### "Playwright chromium not installed"
```bash
npx playwright install chromium
```

### "API keys not configured"
- Check `.env.local` exists in project root
- Check keys are correctly copied (no extra spaces)
- Restart dev server: `npm run dev`

### "Database table does not exist"
- Run the SQL migration in Supabase
- Check Supabase connection in `.env.local`

### Website scraping errors
- Playwright browsers may take a minute to install
- Some websites may block scraping (analysis continues)
- Check console for specific errors

---

## 💡 Next Steps

1. **Create your own lead CSV**
   - Use the template format
   - Include Google Maps URLs for better accuracy

2. **Start analyzing**
   - Begin with 5-10 leads to test
   - Review results before scaling up

3. **Configure Cold Caller**
   - Ensure pre-call notes display correctly
   - Train team on using the intelligence

4. **Monitor costs**
   - Check Google Cloud billing
   - Check OpenAI usage dashboard
   - Average cost: $0.07 per lead

---

## 📊 System Architecture

```
CSV Import
    ↓
Business Intelligence Leads Table (Supabase)
    ↓
Analysis Service (Google Places + Website Scraping + AI)
    ↓
Business Analysis Table (Supabase)
    ↓
Push to Caller
    ↓
Cold Caller Leads Table with Pre-Call Notes
```

---

## 🎯 Ready to Use!

Once setup is complete, you can:
- ✅ Import unlimited leads via CSV
- ✅ Analyze businesses automatically
- ✅ Review detailed insights
- ✅ Push to Cold Caller with one click
- ✅ No more Notion dependency!

**Questions?** Refer to `BUSINESS_INTELLIGENCE_README.md` for detailed usage guide.
