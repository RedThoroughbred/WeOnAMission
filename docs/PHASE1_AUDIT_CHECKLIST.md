# Phase 1: Audit & Document Checklist

This is the first step before ANY migration work. Complete this fully to understand our system.

## 1.1 API Function Audit

For each function in `api.js`, document:

### Template
```
## API.functionName(params)
- **Line**: XXX
- **Used By**: (which HTML files?)
- **Requires Auth**: Yes/No
- **Purpose**: (one line)
- **Parameters**:
  - param1: type - description
- **Returns**: type - description
- **RLS Policy**: (what controls access?)
- **Public?**: (can unauthenticated users call it?)
```

### Functions to Document

Homepage uses these API functions:
- [ ] getEvents(churchId)
- [ ] getResources(churchId)
- [ ] getFAQs(churchId)
- [ ] getApprovedMemories(churchId)
- [ ] getPhotoUrl(photoPath)
- [ ] submitQuestion(email, question, type, churchId)
- [ ] getCurrentChurchContext() [in tenant.js, not api.js]

Admin Portal uses these:
- [ ] getAllEvents(churchId)
- [ ] getAllStudents(churchId)
- [ ] getAllDocuments(churchId)
- [ ] getAllMemories(churchId)
- [ ] etc. (complete the list)

Parent Portal uses these:
- [ ] getMyStudents(churchId)
- [ ] etc. (complete the list)

## 1.2 RLS Policy Audit

For each table used on homepage, document current RLS:

### Template
```
## Table: table_name

**Current RLS Policies**:
- Policy Name: "..."
  - Action: SELECT/INSERT/UPDATE/DELETE
  - Condition: USING (...)
  - What it does: (plain English)

**Can unauthenticated users read?**: Yes/No
**Evidence**: (query this to verify)

**Should it be fixed?**: Yes/No
**Reason**: (if yes, why?)
```

### Tables to Audit
- [ ] events
- [ ] resources
- [ ] faqs
- [ ] trip_memories
- [ ] churches
- [ ] users

**For each table, run this in Supabase SQL Editor**:
```sql
-- Check which policies exist
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'events';

-- Test unauthenticated access (without logging in)
SELECT COUNT(*) FROM events;

-- Test what data comes back
SELECT * FROM events LIMIT 1;
```

## 1.3 Data Flow Tracing

### Homepage: Load Events

**User Action**: Visit localhost:3000/?church=trinity

**Question 1: How is church detected?**
- [ ] Check tenant.js - how does it parse URL?
- [ ] What does `getChurchIdFromSlug('trinity')` return?
- [ ] Where is this called from? (HTML file or JS file?)

**Question 2: How are events loaded?**
- [ ] Search index.html for "loadEvents"
- [ ] What does that function do?
- [ ] Does it call API.getEvents() or API.getAllEvents()?
- [ ] What churchId is passed?

**Question 3: What RLS policy controls this?**
- [ ] Run above SQL audit to find policy
- [ ] Does it check `auth.uid()`? (would break unauthenticated)
- [ ] Does it check `display_on_calendar`?
- [ ] Can unauthenticated user SELECT from events?

**Complete Flow Diagram**:
```
URL: localhost:3000/?church=trinity
  └─ tenant.js: getChurchSlugFromUrl()
     └─ Returns: "trinity"
  └─ tenant.js: getChurchIdFromSlug("trinity")
     └─ Queries: SELECT id FROM churches WHERE slug = 'trinity'
     └─ Returns: UUID (e.g., "00000000-0000-0000-0000-000000000001")
  └─ index.html: loadEvents(churchId)
     └─ api.js: API.getEvents(churchId)
     └─ Supabase Query: SELECT * FROM events WHERE church_id = ?
     └─ RLS Policy: Evaluates USING (...)
     └─ Returns: Event data
  └─ index.html: renderEvents(events)
     └─ Renders HTML
```

Do this for:
- [ ] Events loading
- [ ] Resources loading
- [ ] FAQs loading
- [ ] Memories loading

## 1.4 Homepage Feature Inventory

For homepage, list every feature:

- [ ] Header (church name, icons)
- [ ] Side menu (navigation)
- [ ] Hero section (countdown timer)
- [ ] About section (expandable cards)
- [ ] Events section (list, expandable, filters?)
- [ ] Resources section (links)
- [ ] Trip Memories section (grid, modal?)
- [ ] FAQ section (expandable answers)
- [ ] Dark mode toggle
- [ ] Footer

For each feature, document:
- What JS functions does it use?
- What API calls does it make?
- Does it require authentication?
- What RLS policies control it?

## 1.5 Bug/Issue Investigation

**The Big Question**: Why did React fail but vanilla works?

Theories to test:

### Theory 1: RLS policies are actually different
- [ ] Vanilla JS might make authenticated requests (is there a login that happens silently?)
- [ ] Or vanilla JS might not use Supabase at all (checks config.js)
- Check: Does vanilla version require login? Test with no login.

### Theory 2: RLS policies are actually correct
- [ ] Maybe the migration WAS run and policies ARE public
- [ ] React code just had a bug
- Check: Run SQL audit above. If USING (true), then policies are public.

### Theory 3: React was making different queries
- [ ] React might have been filtering wrong
- [ ] Or using different column names
- Check: Console logs show exact query? (getEvents() function)

**Test Steps**:
1. Open vanilla homepage in incognito (no login): events show? Yes/No
2. Open admin portal in incognito (no login): shows error? Yes/No
3. Run SQL audit to check current RLS policies
4. Check browser console for any RLS errors
5. Check Supabase logs for query rejections

Document findings in `AUDIT_FINDINGS.md`

## 1.6 Documentation Summary

Create file: `API_AND_RLS_AUDIT.md`

Contents:
1. API functions table (which functions, which pages use them)
2. RLS policies table (which tables, current policies, needed fixes)
3. Data flow diagrams (events, resources, FAQs, memories)
4. Bug investigation findings
5. Recommendations for Phase 2

## Estimated Time

- Reading code: 1 hour
- Running SQL queries: 30 minutes
- Documenting findings: 1 hour
- Creating diagrams: 1 hour
- Total: 3.5 hours

## Deliverables

After Phase 1, you should have:
1. Complete API function inventory
2. Complete RLS policy audit with SQL queries
3. Data flow diagrams for each homepage section
4. Understanding of why vanilla works and React didn't
5. List of RLS policies that need to be fixed
6. List of API functions that are shared (can be reused in React)

These become inputs for Phase 2 (RLS Policy fixes).

## How to Start

1. Open `api.js` in VS Code
2. Go through each function
3. Fill out the template above for each
4. Open Supabase SQL Editor
5. Run the RLS audit queries
6. Compare findings
7. Document in `API_AND_RLS_AUDIT.md`

This might seem like a lot of documentation, but it's **essential** for a successful migration. Without understanding EXACTLY how the current system works, we'll repeat the same mistakes.
