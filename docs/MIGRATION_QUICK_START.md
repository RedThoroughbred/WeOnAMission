# React Migration - Quick Start Guide

You have reverted to the working vanilla JS version. Now let's plan a proper React migration.

## Current Status ✅

- **Homepage**: Working perfectly (all events, resources, FAQs, memories load)
- **Admin Portal**: Working (same data, different UI)
- **Other Pages**: Working (parent, student, etc.)

## The Goal

**Modernize the UI with React while keeping everything working**

- Keep vanilla JS version as fallback (never breaks)
- Build React UI incrementally (one page at a time)
- Use same data layer (no duplication)
- Eventually migrate all pages to React

## Three Documents You Created

Read these IN ORDER:

1. **MIGRATION_PLAN_REACT.md** (9 minute read)
   - High-level strategy
   - 6-week timeline
   - Why this approach works

2. **PHASE1_AUDIT_CHECKLIST.md** (15 minute read)
   - Detailed checklist for understanding current system
   - How to audit API functions
   - How to audit RLS policies
   - What to document

3. **This file** (what you're reading now)
   - Quick reference
   - How to get started

## Before Starting Phase 1, Answer These Questions

These will help you understand what we're working with:

### About the Current Vanilla System
- [ ] Where is the main homepage code? (index.html)
- [ ] Where are the API functions? (api.js)
- [ ] Where is the database config? (config.js)
- [ ] Where is the church detection code? (tenant.js)

### About Data Loading
- [ ] How do events get from Supabase to the page?
- [ ] Does it require authentication? How do you know?
- [ ] What RLS policy controls this?
- [ ] Could unauthenticated users access events? (Try in incognito window)

### About the Admin Portal
- [ ] Does it show the same data as homepage?
- [ ] Does it require login to work?
- [ ] How is it different from the homepage?

## Next Steps (In Order)

### Step 1: Read the Documents (30 minutes)
- Read MIGRATION_PLAN_REACT.md carefully
- Read PHASE1_AUDIT_CHECKLIST.md carefully
- Understand the strategy

### Step 2: Complete Phase 1 Audit (3-4 hours)
This is critical - we need to understand EXACTLY how the system works.

Specific tasks:
1. **Document every API function** used on the homepage
   - Location in api.js?
   - What parameters?
   - What does it return?
   - What RLS policy controls it?

2. **Audit RLS policies** in Supabase
   - For each table (events, resources, faqs, memories)
   - What is the current policy?
   - Does it allow unauthenticated access?
   - Should it be changed?

3. **Trace data flow** for one feature
   - Events: From URL parameter → Data displayed
   - Document each step
   - Identify potential bottlenecks

4. **Create audit findings document**
   - Save as `AUDIT_FINDINGS.md`
   - Lists what you learned
   - Recommendations for Phase 2

### Step 3: Phase 2 - RLS Policies (1-2 days)
Once you understand the system:
- Create correct RLS policies SQL script
- Test them thoroughly
- Verify both vanilla and React can access data

### Step 4: Phase 3 - Data Layer (2-3 days)
- Create reusable API wrapper
- Works for vanilla AND React
- Document the API surface

### Step 5: Phase 4 - React Components (3-4 days)
- Create React components matching vanilla HTML
- Test in isolation
- Build component library

### Step 6: Phase 5 - Homepage Migration (3-4 days)
- Create React Home.jsx
- Test side-by-side with vanilla
- Verify identical data
- Full testing (mobile, dark mode, accessibility)

### Step 7: Phase 6+ - Other Pages (1 week per page)
- Repeat process for other pages
- Each page independently tested
- Easy rollback if needed

## Why This Approach Works

| Aspect | Why It's Better |
|--------|-----------------|
| **Speed** | Incremental = faster feedback, find bugs early |
| **Safety** | Vanilla always works = zero risk of complete failure |
| **Quality** | Full testing between each page = high quality |
| **Maintenance** | Shared data layer = changes in one place |
| **Knowledge** | Phase 1 audit = you understand the system completely |
| **Reusability** | Same data layer works for vanilla, React, or future frameworks |

## Estimated Total Time

- Phase 1 (Audit): 4 hours
- Phase 2 (RLS): 8 hours
- Phase 3 (Data Layer): 16 hours
- Phase 4 (Components): 24 hours
- Phase 5 (Homepage): 20 hours
- Phase 6+ (Other pages): 20 hours per page

**Total**: ~100 hours (2.5 weeks of full-time work)

But you can do this incrementally without breaking anything.

## How to Know You're Doing It Right

After each phase, check:

✅ **Phase 1**: Can I explain how events load from start to finish?
✅ **Phase 2**: Can I verify both authenticated and unauthenticated access works?
✅ **Phase 3**: Can I call the same API function from vanilla HTML and React code?
✅ **Phase 4**: Do my React components look identical to vanilla HTML?
✅ **Phase 5**: Do vanilla and React homepages show the same data side-by-side?
✅ **Phase 6**: Can I access /index.html (vanilla) and /home (React) and see same content?

## Red Flags (Things That Mean You're Off Track)

🚫 **Phase 1**: You can't explain the data flow
🚫 **Phase 2**: RLS errors in console when you test
🚫 **Phase 3**: React code uses different API than vanilla
🚫 **Phase 4**: React components look different from vanilla
🚫 **Phase 5**: React homepage shows no data or different data than vanilla
🚫 **Phase 6**: Can't easily roll back a page to vanilla

If you hit any red flags, **STOP** and review the previous phase.

## Getting Help

If something isn't working:

1. **Check the audit** - Did Phase 1 audit reveal this issue?
2. **Check RLS** - Is it an RLS policy problem? (check browser console)
3. **Check data flow** - Is data actually being returned from Supabase?
4. **Check vanilla version** - Does vanilla version work with same data?
5. **Check React code** - Is React using same DataAPI as vanilla?

## Key Files to Create During Migration

```
New files you'll create:
- API_AND_RLS_AUDIT.md (Phase 1 findings)
- database/01-rls-policies-correct.sql (Phase 2)
- src/lib/data-api.js (Phase 3)
- src/hooks/useHomepageData.js (Phase 4)
- src/components/EventCard.jsx (Phase 4)
- src/components/ResourceCard.jsx (Phase 4)
- src/components/FAQCard.jsx (Phase 4)
- src/components/MemoryCard.jsx (Phase 4)
- src/pages/Home.jsx (Phase 5)

Modified files:
- package.json (add any new dependencies)
- src/App.jsx (add new routes)

Vanilla files stay unchanged:
- index.html (fallback version)
- api.js (might be wrapped, not changed)
- admin-portal.html (can migrate later)
```

## The Philosophy

This migration plan is based on one principle:

**Never break the working system. Always have a fallback. Always be able to roll back.**

That's why we:
- Keep vanilla version unchanged
- Migrate one page at a time
- Test thoroughly before moving on
- Build a reusable data layer
- Document everything

This might feel slower upfront, but it's actually faster because:
- You don't waste time debugging multiple broken pages at once
- You can deploy incrementally (users see progress)
- You learn the system deeply (no surprises later)
- Changes are easy to maintain (clear architecture)

## Ready to Start?

1. **Read MIGRATION_PLAN_REACT.md** (understand the strategy)
2. **Read PHASE1_AUDIT_CHECKLIST.md** (understand the tasks)
3. **Start Phase 1: Audit** (open api.js and start documenting)

The first 4 hours of Phase 1 are the most important. Once you understand the current system fully, everything else flows naturally.

Good luck! 🚀
