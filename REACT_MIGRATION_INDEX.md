# React Migration Index

## Overview

This directory contains a comprehensive plan for migrating the Mission Trip Platform from vanilla JavaScript to React, with zero risk and full backward compatibility.

## Status

- **Current**: Vanilla JS (working perfectly)
- **Planned**: React migration over 6 weeks
- **Strategy**: Incremental, one page at a time
- **Risk**: Zero (vanilla always works as fallback)

## Core Documents (Read These)

### 1. SESSION_SUMMARY.md (5 min read)
**What**: Summary of this session's planning work
**Why**: Get context for why these documents exist
**When**: Read first, before anything else
**Contains**: Overview of what we did, why the React attempt failed, the solution

### 2. MIGRATION_QUICK_START.md (10 min read)
**What**: Quick reference guide for the entire migration
**Why**: Understand next steps and stay oriented
**When**: Read second, before diving into details
**Contains**: Quick checklist, timeline breakdown, how to know you're on track

### 3. MIGRATION_PLAN_REACT.md (15 min read)
**What**: Full strategic plan for the React migration
**Why**: Understand the complete approach
**When**: Read third for the full strategy
**Contains**: 6-week timeline, 7 phases, architecture diagrams, success criteria

### 4. PHASE1_AUDIT_CHECKLIST.md (15 min read + 3-4 hours work)
**What**: Detailed audit checklist for understanding the current system
**Why**: You can't migrate what you don't understand
**When**: Read before starting Phase 1, then use as you work
**Contains**: API audit template, RLS policy audit SQL, data flow exercises

## The Four Phases (In Order)

```
Phase 1: Audit & Document (Week 1)
  ├─ Understand API functions
  ├─ Audit RLS policies
  ├─ Trace data flows
  └─ Create AUDIT_FINDINGS.md

Phase 2: Fix RLS Policies (Week 1-2)
  ├─ Create correct RLS policies
  ├─ Test authenticated access
  ├─ Test unauthenticated access
  └─ Create database/01-rls-policies-correct.sql

Phase 3: Build Data Layer (Week 2)
  ├─ Create reusable API wrapper
  ├─ Create React custom hooks
  └─ Verify vanilla & React use identical code paths

Phase 4: Build Components (Week 3)
  ├─ Create React components
  ├─ Match vanilla HTML exactly
  └─ Build component library

Phase 5: Migrate Homepage (Week 4)
  ├─ Create React Home.jsx
  ├─ Test side-by-side with vanilla
  └─ Full feature testing

Phases 6+: Other Pages (Week 5+)
  ├─ Parent Portal
  ├─ Student Portal
  ├─ Admin Portal
  └─ (one page per week)
```

## File Organization

### Planning Documents (You Are Here)
```
REACT_MIGRATION_INDEX.md          ← You are here
SESSION_SUMMARY.md                ← What happened this session
MIGRATION_QUICK_START.md          ← Quick reference guide
MIGRATION_PLAN_REACT.md           ← Full 6-week strategy
PHASE1_AUDIT_CHECKLIST.md         ← Detailed audit tasks
```

### Will Be Created During Migration
```
AUDIT_FINDINGS.md                 ← Phase 1 output
database/01-rls-policies-correct.sql  ← Phase 2 output
src/lib/data-api.js               ← Phase 3 output
src/hooks/useHomepageData.js      ← Phase 3 output
src/components/EventCard.jsx      ← Phase 4 output
src/components/ResourceCard.jsx   ← Phase 4 output
src/components/FAQCard.jsx        ← Phase 4 output
src/components/MemoryCard.jsx     ← Phase 4 output
src/pages/Home.jsx                ← Phase 5 output
```

### Vanilla JS (Unchanged During Migration)
```
index.html                        ← Fallback homepage
api.js                           ← API functions (reused by React)
admin-portal.html                ← Fallback admin portal
tenant.js                        ← Church detection
theme.js                         ← Dark mode
```

## Quick Start (Do This)

1. **Read in order** (30 minutes):
   - SESSION_SUMMARY.md
   - MIGRATION_QUICK_START.md
   - MIGRATION_PLAN_REACT.md

2. **Start Phase 1** (3-4 hours):
   - Follow PHASE1_AUDIT_CHECKLIST.md
   - Open api.js and document functions
   - Run RLS audit SQL queries
   - Create AUDIT_FINDINGS.md

3. **Decide**: Ready to continue with Phase 2?
   - If yes: Fix RLS policies
   - If no: You've still learned the system deeply

## Why This Plan Works

✅ **Zero Risk**: Vanilla always works
✅ **Incremental**: One page at a time
✅ **Reusable**: Data layer for vanilla AND React
✅ **Documented**: Clear at each step
✅ **Testable**: Side-by-side comparison
✅ **Maintainable**: Clear architecture
✅ **Fast**: Incremental = quick feedback

## Timeline

- **Phase 1**: 4 hours (1 day)
- **Phase 2**: 8 hours (1 day)
- **Phase 3**: 16 hours (2 days)
- **Phase 4**: 24 hours (3 days)
- **Phase 5**: 20 hours (2-3 days)
- **Each Additional Page**: 20 hours (2-3 days each)

**Total for React homepage**: ~3 weeks
**Total for all pages**: ~6-8 weeks

## Success Looks Like

After Phase 1:
- [ ] You can explain the entire data flow
- [ ] You know what every API function does
- [ ] You understand the RLS policies
- [ ] You created AUDIT_FINDINGS.md

After Phase 2:
- [ ] RLS policies are correct
- [ ] Both authenticated and unauthenticated access works
- [ ] No permission errors in console

After Phase 3:
- [ ] Vanilla and React use identical data layer
- [ ] Custom hooks work with API
- [ ] Easy to add new components

After Phase 4:
- [ ] React components match vanilla HTML
- [ ] All features work (expandable cards, modals, etc.)
- [ ] Dark mode works
- [ ] Mobile responsive

After Phase 5:
- [ ] React homepage shows identical data to vanilla
- [ ] All features work perfectly
- [ ] Can access /index.html (vanilla) AND /home (React)
- [ ] Both show same data

## Red Flags

If you see these, STOP and review the previous phase:

🚫 Can't explain data flow
🚫 RLS errors in browser console
🚫 Vanilla and React using different APIs
🚫 React components look different from vanilla
🚫 React shows different data than vanilla
🚫 Can't roll back to vanilla

## Next Actions

1. **Read** SESSION_SUMMARY.md (5 minutes)
2. **Read** MIGRATION_QUICK_START.md (10 minutes)
3. **Read** MIGRATION_PLAN_REACT.md (15 minutes)
4. **Decide** if you want to proceed with Phase 1
5. **Plan** when you'll do Phase 1 (3-4 hour block)

## Questions?

All answers are in one of the four documents above. Read them carefully.

**Most common questions**:
- "Why incremental?" → MIGRATION_PLAN_REACT.md (Why This Works section)
- "What do I do first?" → PHASE1_AUDIT_CHECKLIST.md (Step 1)
- "What if it breaks?" → MIGRATION_QUICK_START.md (How to Know section)
- "How long will this take?" → SESSION_SUMMARY.md (Timeline section)

## The Bottom Line

You have a solid plan. The migration will succeed because:

1. **You understand the current system** (Phase 1 audit)
2. **RLS policies are correct** (Phase 2 fix)
3. **Vanilla and React share code** (Phase 3 data layer)
4. **Each page is tested thoroughly** (Phases 4-5)
5. **You can roll back anytime** (Vanilla always works)

Ready to get started? Read SESSION_SUMMARY.md first. 🚀
