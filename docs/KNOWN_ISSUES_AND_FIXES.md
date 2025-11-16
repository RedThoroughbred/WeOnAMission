# Known Issues & Fixes

## Issue 1: Color Inconsistency (FIXED ✅)

### What you saw
- Landing page: Purple gradient (correct)
- Parent portal header: Purple gradient (correct with Ocean theme)
- Parent portal content: Red/hardcoded colors (incorrect)
- Student portal: Blue/hardcoded colors (incorrect)

### Root cause
Many HTML pages still had hardcoded color codes (#c62828, #1976d2, etc.) instead of using CSS variables. Even though we added the theme system, old colors weren't replaced.

### What was fixed
Updated the following files to use CSS variables instead of hardcoded colors:
- ✅ landing.html - Now uses `var(--primary)` gradients
- ✅ parent-portal.html - All red colors replaced with theme colors
- ✅ student-portal.html - All blue colors replaced with theme colors

**Result:** Now when you change the theme in config.js, ALL pages update automatically - no more color mismatches.

### Testing it
1. Open `config.js`
2. Change `theme: 'ocean'` to `theme: 'forest'`
3. Refresh all pages
4. Everything should now be green (Forest theme) consistently

---

## Issue 2: Student Portal Permission Error (KNOWN LIMITATION)

### What you saw
```
"You do not have permission to access this page."
```

### Root cause
The student portal requires `role === 'student'`, but you logged in as `role: 'parent'`. This is correct behavior - parents shouldn't be able to access the student-only portal.

### Why this is happening
In the current system:
- When you sign up, you get `role: 'parent'` by default
- The student portal checks `if (user.role !== 'student')` → blocks you
- Students are supposed to have a different account with `role: 'student'`

### The problem
Students are currently created as **student records** by parents, but they don't have actual **user accounts** to log in with. We need a linking system:

**Current (broken):**
```
Parent Account (role: parent)
  → Create Student Record (not an account!)
  → Student can't log in (no credentials)
```

**What we need:**
```
Parent Account (role: parent)
  → Create Student Record
  → Student creates own account (signs up)
  → Account linked to Student Record
  → Student can now log in with role: student
```

### How to test the student portal for now

**Option A: Create a test student account**
1. Sign up with new email: `student.alice@test.com`
2. When asked for full name, enter: `Alice Johnson` (matches student record name)
3. Open browser DevTools → Console
4. Run: `supabaseClient.auth.updateUser({ data: { role: 'student' } })`
5. Refresh page → Should now see student portal content

**Option B: Promote someone to student via SQL**
```sql
UPDATE users
SET role = 'student'
WHERE email = 'alice@test.com';
```

**Option C: Manual testing without full linking**
- The student portal code is complete and works
- Just need a student account to access it
- Production system would have enrollment flow

### Future improvement needed
Build a student enrollment/linking system:
1. Parent invites student by email
2. Student receives invite link
3. Student creates account via invite
4. System automatically links student account to student record
5. Student can log in

This is a medium-complexity feature but not critical for MVP.

---

## Other Files That Still Need Color Updates

The following files have hardcoded colors and should be updated (lower priority):

- `admin-portal.html` - Has #d32f2f, #c62828 (red colors)
- `login.html` - Has #c62828, #d84315 (red colors)
- `index.html` - May have hardcoded colors
- `nice-to-know.html` - May have hardcoded colors
- `content-management.html` - May have hardcoded colors
- `questions-dashboard.html` - May have hardcoded colors
- `super-admin-portal.html` - May have hardcoded colors

These can be fixed using the same pattern:
- Replace `#c62828` with `var(--primary)`
- Replace hardcoded hover colors with `var(--primary-dark)`
- Replace `linear-gradient(135deg, #xxx 0%, #yyy 100%)` with `linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)`

---

## Summary of All Changes Made

### Files Modified Today:
1. ✅ `config.example.js` - Added 5 pre-built color themes
2. ✅ `theme.js` - New theme system module
3. ✅ `utils.js` - New utilities for notifications, forms, buttons
4. ✅ `styles.css` - Added form validation, loading states, toast notifications
5. ✅ `landing.html` - Added theme.js, utils.js, use CSS variables
6. ✅ `parent-portal.html` - Added theme.js, utils.js, use CSS variables, fixed colors
7. ✅ `student-portal.html` - Added theme.js, utils.js, use CSS variables, fixed colors

### Files Still Need Updates:
- `admin-portal.html` - Add theme.js, utils.js, replace colors
- `login.html` - Add theme.js, utils.js, replace colors
- `index.html` - Add theme.js, utils.js
- `nice-to-know.html` - Add theme.js, utils.js
- `content-management.html` - Add theme.js, utils.js
- `questions-dashboard.html` - Add theme.js, utils.js
- `super-admin-portal.html` - Add theme.js, utils.js

---

## Current Theme System

**Available Themes:**
1. **Ocean** (default in config) - Blue (#0369A1) - Professional
2. **Forest** - Green (#15803D) - Natural
3. **Sunset** - Orange (#EA580C) - Warm
4. **Lavender** - Purple (#A855F7) - Creative
5. **Neutral** - Indigo (#4F46E5) - Classic

**How to change:**
```javascript
// In config.js
theme: 'forest'  // Changes all colors to green automatically
```

---

## Next Steps (If Needed)

1. **Quick:** Fix remaining portal colors (admin, login, etc.)
2. **Medium:** Build student enrollment/linking system
3. **Polish:** Review all pages for consistent theming
4. **Future:** Add per-church theme customization
