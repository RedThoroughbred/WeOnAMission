# React Migration - Setup Instructions

The homepage has been successfully migrated to React with Vite! Follow these steps to get everything working:

## Step 1: Run the Database Migration (One-time setup)

If you haven't already, you need to run the multi-tenant migration to add `church_id` support:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Open your project's SQL Editor
3. Copy and paste the contents of `database/migration-to-multitenant.sql`
4. Run the migration

## Step 1b: Fix RLS Policies for Public Access (CRITICAL!)

⚠️ **IMPORTANT**: The multi-tenant migration has overly restrictive RLS policies that BREAK the homepage. You MUST run this fix:

1. In Supabase SQL Editor, copy and paste `database/fix-rls-public-access.sql`
2. Run it
3. This allows unauthenticated users to see events, resources, and FAQs

**Why this matters:** The migration's RLS policies require users to be authenticated AND belong to the church. But the public homepage works WITHOUT authentication. This fix allows public read access while keeping admin protections intact.

## Step 2: Populate Test Data

After running the migration, populate the test data:

1. In the Supabase SQL Editor, paste the contents of `database/populate-test-data.sql`
2. Run the script

This will create:
- Trinity Church (slug: "trinity")
- 7 sample events
- 6 sample resources
- 6 sample FAQs

## Step 3: Access the Homepage

The React app is running on `http://localhost:3000`

Access the homepage with:
```
http://localhost:3000/home?church=trinity
```

The URL parameter `?church=trinity` tells the app which church to load data for.

## What You Should See

After setup, the homepage should display:
- ✅ Hamburger menu with navigation links and portal access
- ✅ Question mark icon to ask questions
- ✅ Countdown timer
- ✅ All upcoming events (7 sample events)
- ✅ All resources (6 sample resources)
- ✅ All FAQs (6 sample FAQs)
- ✅ Memory Book modal (currently empty until memories are added)
- ✅ Dark/light theme toggle

## Debug Bar

At the top of the page, there's a yellow debug info bar showing:
- Which church is detected
- How many items of each type are loaded

Once everything is working, you can remove the debug bar by finding and deleting the "Debug Info Bar" section in `src/pages/Home.jsx`.

## Architecture

- **Frontend**: React 18 with Vite + Tailwind CSS
- **Routing**: React Router v6 (`/home?church=trinity`)
- **State Management**: React Context API (Auth, Tenant, Theme)
- **Database**: Supabase (PostgreSQL with RLS)
- **Multi-Tenant**: All data filtered by `church_id`

## File Structure

```
src/
├── pages/Home.jsx           # Main homepage with all sections
├── contexts/
│   ├── AuthContext.jsx      # User authentication
│   ├── TenantContext.jsx    # Church detection (slug-based)
│   └── ThemeContext.jsx     # Dark mode
├── hooks/
│   ├── useAuth.js
│   ├── useTenant.js
│   └── useTheme.js
├── lib/
│   ├── config.js            # Supabase client
│   └── supabaseConfig.ts    # Hardcoded API keys
└── App.jsx                  # Router + Providers
```

## Next Steps

1. ✅ Homepage complete with all features
2. ⏳ Connect question submission to Supabase
3. ⏳ Build other portal pages (Parent, Student, Admin)
4. ⏳ Add file upload support for documents and memories
5. ⏳ Deploy to Vercel

## Troubleshooting

### "No church detected" or "Church: Not detected"
- Make sure you're using the correct URL: `http://localhost:3000/home?church=trinity`
- Check the Supabase SQL Editor to verify the churches table exists and has a "trinity" slug

### "Events: 0 | Resources: 0 | FAQs: 0"
- **First**: Make sure you ran `fix-rls-public-access.sql` (this is the most common cause!)
- Then run the `populate-test-data.sql` script in Supabase
- Check the browser console (F12) for error messages (red text)
- Verify `church_id` column exists on all tables by running:
  ```sql
  SELECT * FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'church_id';
  ```

### Data not showing up
- Check browser console (F12) for error messages
- Look at the debug info bar at the top - does it show the church name?
- Run this SQL to check Trinity Church exists:
  ```sql
  SELECT * FROM churches WHERE slug = 'trinity';
  SELECT COUNT(*) FROM events WHERE church_id = '00000000-0000-0000-0000-000000000001';
  ```

## Questions?

All the code is self-documented. Check:
- `src/pages/Home.jsx` - Component code with comments
- `src/contexts/TenantContext.jsx` - Church detection logic
- `database/migration-to-multitenant.sql` - Database schema
