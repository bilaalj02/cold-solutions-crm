# Business Intelligence Setup Checklist

Use this checklist to get your Business Intelligence system up and running.

## ☐ Step 1: Install Dependencies (2 minutes)

```bash
cd cold-solutions-crm
npm install
```

**Verify:**
- [ ] No errors during installation
- [ ] Package.json shows: `csv-parse`, `playwright`, `openai`, `cheerio`

---

## ☐ Step 2: Install Playwright Browser (2 minutes)

```bash
npx playwright install chromium
```

**Verify:**
- [ ] Chromium browser downloaded successfully
- [ ] No error messages

---

## ☐ Step 3: Configure API Keys (1 minute)

Edit `.env.local` in the project root:

```env
# Add these lines:
GOOGLE_PLACES_API_KEY=your_key_here
OPENAI_API_KEY=sk-your_key_here
```

**Verify:**
- [ ] Google Places API key added
- [ ] OpenAI API key added (starts with `sk-`)
- [ ] No extra spaces or quotes around keys

---

## ☐ Step 4: Run Database Migration (3 minutes)

**Option A: Supabase Dashboard**
1. [ ] Open Supabase project → SQL Editor
2. [ ] Copy contents of `supabase/migrations/20250109_business_intelligence_system.sql`
3. [ ] Paste and click "Run"
4. [ ] Check for "Success" message

**Verify:**
- [ ] Tables created: `business_intelligence_leads`, `business_analysis`
- [ ] View created: `business_intelligence_complete`
- [ ] No SQL errors

---

## ☐ Step 5: Start Application (1 minute)

```bash
npm run dev
```

**Verify:**
- [ ] Server starts on port 3000
- [ ] No compilation errors
- [ ] Can access http://localhost:3000

---

## ☐ Step 6: Access BI Dashboard (30 seconds)

Navigate to: `http://localhost:3000/leads/intelligence`

**Verify:**
- [ ] Page loads successfully
- [ ] See stats: "Total Leads: 0"
- [ ] See buttons: Import CSV, Analyze All, etc.

---

## ☐ Step 7: Test CSV Import (2 minutes)

1. [ ] Download sample CSV: `public/sample-leads-template.csv`
2. [ ] Click "📥 Import CSV" button
3. [ ] Select the sample file
4. [ ] See "Imported: 3 leads"

**Verify:**
- [ ] 3 leads appear in table
- [ ] Status shows "Not Started"
- [ ] No error messages

---

## ☐ Step 8: Test Analysis (5 minutes)

1. [ ] Click "🤖 Analyze All (3)"
2. [ ] Confirm cost estimate (~$0.21)
3. [ ] Wait for completion (3-5 minutes)

**Verify:**
- [ ] Progress bar shows
- [ ] All 3 leads show "Complete" status
- [ ] Green rating badges appear

---

## ☐ Step 9: View Analysis Results (1 minute)

1. [ ] Click "View Details →" on any lead
2. [ ] Review the analysis page

**Verify:**
- [ ] Executive Summary shows
- [ ] Outreach Angle shows
- [ ] Pain Points list shows
- [ ] Automation Opportunities show
- [ ] Can click "Copy to clipboard"

---

## ☐ Step 10: Test Push to Caller (1 minute)

1. [ ] Go back to leads list
2. [ ] Select one completed lead
3. [ ] Click "📤 Push to Caller"
4. [ ] Confirm the action

**Verify:**
- [ ] Success message shows
- [ ] Lead shows "✓ Pushed" badge
- [ ] Lead appears in Cold Caller app
- [ ] Pre-call notes visible in Cold Caller

---

## ✅ Setup Complete!

If all boxes are checked, your Business Intelligence system is ready to use!

## 🎯 Next Steps

Now you can:
- [ ] Create your own lead CSV (use template format)
- [ ] Import real business leads
- [ ] Analyze and review insights
- [ ] Push to Cold Caller for outreach

---

## 🆘 Troubleshooting

### If Step 1 fails:
```bash
rm -rf node_modules package-lock.json
npm install
```

### If Step 3 fails:
- Check API keys are valid
- Verify no extra spaces
- Restart dev server after adding keys

### If Step 4 fails:
- Check Supabase connection
- Verify service role key in .env.local
- Try running SQL manually in dashboard

### If Step 8 fails:
- Check API key quotas
- Verify internet connection
- Check browser console for errors
- Review error message in lead detail

---

## 📊 Success Criteria

✅ **System is working if:**
1. CSV imports successfully
2. Analysis completes without errors
3. Results display with all sections
4. Push to Caller succeeds
5. Pre-call notes appear in Cold Caller

---

## 📞 Need Help?

**Check these documents:**
- `BUSINESS_INTELLIGENCE_SETUP.md` - Detailed setup guide
- `BUSINESS_INTELLIGENCE_README.md` - Full user guide
- `BUSINESS_INTELLIGENCE_IMPLEMENTATION_SUMMARY.md` - Technical details

**Common Issues:**
- API keys → Verify in Google Cloud / OpenAI dashboard
- Database → Check Supabase logs
- Analysis → Check browser console
- Integration → Verify Cold Caller tables exist

---

**Time to Complete Setup: ~15-20 minutes**

Good luck! 🚀
