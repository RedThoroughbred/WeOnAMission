# React UI Migration Plan

**Status**: Planning Phase
**Current State**: Vanilla JS homepage working with all data loading correctly
**Goal**: Migrate to React while maintaining data integrity and keeping fallback to vanilla JS always working

## Core Strategy

**No Big Bang Rewrite** - We will:
1. Keep vanilla JS working 100% during entire migration
2. Migrate ONE page at a time, testing thoroughly
3. Build a reusable API layer that works for BOTH vanilla and React
4. Establish correct RLS policies that work for public homepage access
5. Create a component library that mirrors vanilla functionality exactly

This way, if React breaks anything, we roll back that page to vanilla. No risk of losing the working platform.

## Architecture: Three-Tier System

```
UI Layer (Vanilla JS / React)
   ↓
Data Access Layer (UNIFIED - same functions for both)
   ↓
Database Layer (Supabase with correct RLS)
```

The key insight: **The middle layer must be IDENTICAL for vanilla and React**

## Phase 1: Audit & Document (Week 1)

### 1.1 API Function Inventory
- Document every function in api.js
- Which pages use each function?
- What parameters? What returns?
- Which are used for homepage (public data)?

### 1.2 Homepage Data Flow
Trace exactly: localhost:3000/?church=trinity → Data displayed
- How does tenant detection work?
- How does API.getEvents() work?
- What RLS policy controls it?
- Why does it work in vanilla but fail in React?

### 1.3 RLS Policy Audit
Check current RLS policies for:
- events table
- resources table
- faqs table
- trip_memories table

Document what they currently require and what they SHOULD require.

## Phase 2: Establish Correct RLS Policies (Week 1-2)

Create: `database/01-rls-policies-correct.sql`

Requirements:
- Events: Anyone can read (no auth required) if display_on_calendar = true
- Resources: Anyone can read (no auth required)
- FAQs: Anyone can read (no auth required) if display = true
- Memories: Anyone can read (no auth required) if status = 'approved'

For write operations:
- Only authenticated admins of the church can create/update/delete

## Phase 3: Build Shared Data Layer (Week 2)

Create: `src/lib/data-api.js`

This is the SINGLE SOURCE OF TRUTH for all data access:
- Same functions used by vanilla JS
- Same functions used by React
- All data queries go through this layer

Example:
```javascript
export const DataAPI = {
  getEvents: (churchId) => API.getEvents(churchId),
  getResources: (churchId) => API.getResources(churchId),
  getFAQs: (churchId) => API.getFAQs(churchId),
  getMemories: (churchId) => API.getApprovedMemories(churchId),
  submitQuestion: (email, q, type, churchId) => API.submitQuestion(...)
}
```

## Phase 4: Create React Custom Hooks (Week 3)

Create: `src/hooks/useHomepageData.js`

Wraps DataAPI for React:
```javascript
export const useHomepageData = (churchId) => {
  const [events, setEvents] = useState([])
  // ... load all homepage data using DataAPI
  return { events, resources, faqs, memories, loading }
}
```

**Key**: Hooks use exact same DataAPI as vanilla version

## Phase 5: Create React Components (Week 3)

Create components matching vanilla HTML:
- EventCard.jsx
- ResourceCard.jsx
- FAQCard.jsx
- MemoryCard.jsx
- SideMenu.jsx
- etc.

Each component:
- Matches vanilla styling exactly
- Supports dark mode
- Is fully responsive
- Has no hardcoded text

## Phase 6: Migrate Homepage (Week 4)

Create: `src/pages/Home.jsx`

Use the hooks and components:
```javascript
export default function Home() {
  const { churchId } = useChurch()
  const { events, resources, faqs, memories } = useHomepageData(churchId)

  return (
    <>
      {events.map(e => <EventCard event={e} />)}
      {resources.map(r => <ResourceCard resource={r} />)}
      {/* etc */}
    </>
  )
}
```

**Side-by-side testing**:
- Vanilla version at `/index.html`
- React version at `/` or `/home`
- Load same church
- Verify identical data and styling
- Test all features

## Phase 7: Other Pages (Week 5+)

Repeat process for:
- Parent Portal
- Student Portal
- Admin Portal
- Questions
- Content Management
- etc.

Each page uses same DataAPI + hooks pattern.

## Key Principles

1. **Vanilla Never Breaks**: Always has fallback
2. **Same Data Layer**: Both UI versions query same way
3. **One Page at a Time**: Full testing before moving on
4. **RLS First**: Get policies right BEFORE migrating UI
5. **Component Reusability**: Build components once, use everywhere
6. **Documentation**: API spec + design system = easy to build with

## Success Criteria

For each page migrated:
- Vanilla version still works
- React version shows identical data
- All features work (expandable cards, modals, dark mode, responsive)
- No console errors
- RLS policies working correctly
- Easy rollback if needed

## Timeline

- Week 1: Audit + RLS policies
- Week 2: Data layer + hooks
- Week 3: Components + design system
- Week 4: Homepage migration + testing
- Week 5+: Other pages (one per week)

Total: ~6 weeks for full migration with zero risk.

## Why This Plan Works

✅ No risk - vanilla always works
✅ Incremental - one page at a time
✅ Testable - side-by-side comparison
✅ Reusable - same data layer for any UI
✅ Maintainable - clear separation of concerns
✅ Future-proof - can migrate to any framework later
