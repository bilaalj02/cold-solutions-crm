# Database Setup Instructions

## Step 1: Run SQL Schema

1. **Open Supabase Dashboard**: https://supabase.com/dashboard/project/ukxmrjmlwjzeapploqjy
2. **Go to SQL Editor**: Click on "SQL Editor" in the left sidebar
3. **Run Schema**: Copy and paste the contents of `sql/schema.sql` and execute it

## Step 2: Verify Tables Created

Check that these tables exist:
- `crm_users`
- `crm_call_logs`
- `crm_settings`

## Step 3: Add Environment Variables to Vercel

In your Vercel dashboard for the CRM project, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://ukxmrjmlwjzeapploqjy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVreG1yam1sd2p6ZWFwcGxvcWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDI5MTMsImV4cCI6MjA3MzYxODkxM30.cqR-YcFkbCOBKfoBp58gx5xC9OxTxMRir9rGNCQJdOg
```

## Step 4: Test Connection

After deployment, the CRM should:
- ✅ Store call logs in Supabase instead of memory
- ✅ Persist data across server restarts
- ✅ Show real-time call statistics
- ✅ Connect to same database as Cold Caller App

## Step 5: Migration from In-Memory Storage

The migration will happen automatically when the new code deploys:
- Old in-memory call logs will be lost (this is expected)
- New calls will be stored in Supabase
- Dashboard will show real persistent data

## Troubleshooting

**Connection Issues:**
- Check environment variables are set correctly
- Verify Supabase project is active
- Check network/firewall settings

**Permission Issues:**
- Ensure RLS policies are created correctly
- Check if tables have proper indexes
- Verify authenticated users can read/write

**Data Issues:**
- Clear browser cache if seeing old data
- Check Supabase logs for errors
- Verify API endpoints are working