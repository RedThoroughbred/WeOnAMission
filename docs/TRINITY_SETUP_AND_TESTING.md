# Trinity Church - Setup & Testing Guide

## Trinity Church Context

**Church ID:** `00000000-0000-0000-0000-000000000001`
**Church Slug:** `trinity`
**URLs:**
- Landing: `http://localhost:8000/landing.html` or `weonamission.org/`
- Home: `http://localhost:8000/index.html?church=trinity` or `weonamission.org/trinity/`
- Login: `http://localhost:8000/login.html?church=trinity` or `weonamission.org/trinity/login.html`
- Portals: `/parent-portal.html?church=trinity`, `/student-portal.html?church=trinity`, etc.

Trinity Church is pre-configured in the database via the migration script.

## Complete User Journey - Trinity Church

### 1. Visit Landing Page

```
User → weonamission.org/ (or localhost:8000/landing.html)
↓
landing.html loads
↓
Queries: SELECT * FROM churches WHERE ORDER BY name
↓
Trinity Church appears in list with:
  - Name: "Trinity Church"
  - Trip: "Peru Mission Trip 2026"
  - Country: "Peru"
  - Two buttons: "Login" and "Sign Up"
↓
Clicking "Login" → /login.html?church=trinity
Clicking "Sign Up" → /login.html?church=trinity&signup=true
```

### 2. New Parent Signs Up

```
URL: localhost:8000/login.html?church=trinity

Step 1: Login page loads
  - tenant.js detects: church=trinity from query param
  - getCurrentChurchContext() returns:
    {
      slug: 'trinity',
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Trinity Church'
    }
  - Header updates: "Trinity Church - Sign in for Trinity Church"

Step 2: User clicks "Sign Up" tab

Step 3: User fills form:
  - Full Name: "John Smith"
  - Email: "john@example.com"
  - Password: "secure123"
  - Confirm: "secure123"

Step 4: Form submitted (handleSignUp)
  - Calls: API.signUp(email, password, name, 'parent')
  - Supabase creates auth user
  - Database trigger: handle_new_user()
  - Creates users table row:
    {
      id: auth_user_id,
      email: 'john@example.com',
      full_name: 'John Smith',
      role: 'parent',
      church_id: NULL (initially)
    }

Step 5: Auto-signin
  - Calls: API.signIn(email, password)
  - Gets user: { id: xxx, role: 'parent', church_id: NULL }

Step 6: Update church_id
  - Calls: API.updateUserProfile(user.id, { church_id: trinity_id })
  - User now has: { ..., church_id: '00000...001' }

Step 7: Redirect
  - Since currentChurch exists: church.slug = 'trinity'
  - Portal page = 'parent-portal.html'
  - Redirects to: /trinity/parent-portal.html
  - OR (local): /parent-portal.html?church=trinity

Result: Parent can now access Trinity-specific data ✓
```

### 3. Parent Logs In (Return Visit)

```
URL: localhost:8000/login.html?church=trinity

Step 1: Login page loads
  - Church context detected: Trinity Church
  - Header updated

Step 2: Parent fills login form:
  - Email: "john@example.com"
  - Password: "secure123"

Step 3: Form submitted (handleSignIn)
  - Calls: API.signIn(email, password)
  - Supabase authenticates
  - Fetches user record: { role: 'parent', church_id: trinity_id }

Step 4: Redirect
  - currentChurch = Trinity
  - user.role = 'parent'
  - Redirects to: /trinity/parent-portal.html

Step 5: Parent Portal Loads
  - Calls: Auth.initializePage() - checks auth ✓
  - Calls: Tenant.getCurrentChurchContext() - gets Trinity ID
  - Loads student list: API.getMyStudents(trinity_id)
    - Query: SELECT * FROM students WHERE church_id = trinity_id AND parent_id = user_id
    - Returns only parent's Trinity students
  - Displays payments, documents, memories for Trinity students
```

### 4. Admin Reviews Questions (Trinity)

```
URL: localhost:8000/questions-dashboard.html?church=trinity

Step 1: Page loads
  - Calls: Auth.initializePage('admin')
  - Checks: user.role === 'admin'
  - NOT 'admin'? Alert + redirect to parent-portal ❌

Step 2: (Assuming user IS admin)
  - Calls: Tenant.getCurrentChurchContext() - gets Trinity ID
  - Loads questions: API.getUserQuestions(trinity_id)
    - Query: SELECT * FROM user_questions WHERE church_id = trinity_id
    - Returns all Trinity questions only
  - Shows pending questions

Step 3: Admin writes response and clicks "Send Response"
  - Calls: API.submitQuestionResponse(questionId, response, false, trinity_id)
  - API checks: isUserAdmin() ✓
  - Inserts to question_responses:
    {
      question_id: xxx,
      admin_id: admin_user_id,
      response: "...",
      church_id: trinity_id
    }
  - User gets notified (if emails implemented)

Result: Question response saved to Trinity only ✓
```

### 5. Admin Adds Event (Trinity)

```
URL: localhost:8000/admin-portal.html?church=trinity
Tab: "Events"

Step 1: Admin portal loads
  - Auth check: role = 'admin' ✓
  - Church context: Trinity detected

Step 2: Admin clicks "+ Add Event"
  - Modal opens
  - Fills form:
    - Title: "Team Training Meeting"
    - Type: "preparation"
    - Date: "2025-11-15"
    - Description: "....."

Step 3: Form submitted
  - Calls: API.createEvent(eventData, trinity_id)
  - API checks: isUserAdmin() ✓
  - Inserts:
    {
      title: 'Team Training Meeting',
      type: 'preparation',
      event_date: '2025-11-15',
      church_id: trinity_id,
      created_by: admin_user_id
    }

Step 4: Reloads events
  - Query: SELECT * FROM events WHERE church_id = trinity_id
  - Shows only Trinity events
  - Parent portals see only Trinity events

Result: Event created and visible only to Trinity ✓
```

## Testing Checklist - Trinity Church

### Prerequisites
- [ ] Server running: `python -m http.server 8000` (or HTTP server)
- [ ] Supabase project configured with correct URL & key in config.js
- [ ] Trinity Church exists in churches table with UUID `00000...001`
- [ ] Migration script has been run

### Test 1: Landing Page
- [ ] Navigate to `http://localhost:8000/landing.html`
- [ ] Trinity Church appears in the list
- [ ] Shows "Trinity Church" name
- [ ] Shows "Peru Mission Trip 2026"
- [ ] Shows "Peru" as country
- [ ] "Login" button works
- [ ] "Sign Up" button works
- [ ] Buttons link to `/login.html?church=trinity`

### Test 2: New Parent Signup
- [ ] Navigate to `http://localhost:8000/login.html?church=trinity`
- [ ] Header shows "Trinity Church"
- [ ] Switch to "Sign Up" tab
- [ ] Fill form with new parent details
- [ ] Sign up succeeds
- [ ] Auto-redirects to parent portal
- [ ] Parent can see empty student list (no students yet)
- [ ] Verify in Supabase: users table has new row with church_id = trinity UUID

### Test 3: Return Login
- [ ] Logout: click logout button
- [ ] Visit `/login.html?church=trinity` again
- [ ] Sign in with same parent email
- [ ] Auto-redirects to parent portal
- [ ] Session properly established

### Test 4: Admin Login
- [ ] Navigate to Supabase console
- [ ] Find the parent user from Test 2
- [ ] Update their role from `'parent'` to `'admin'`
- [ ] Logout from parent account
- [ ] Login with same email as admin
- [ ] Can now access:
  - [ ] `/admin-portal.html?church=trinity` - shows Trinity dashboard
  - [ ] `/questions-dashboard.html?church=trinity` - shows Trinity questions
  - [ ] `/content-management.html?church=trinity` - shows Trinity content

### Test 5: Question Submission
- [ ] Login as Trinity parent
- [ ] Click question button (in any portal)
- [ ] Fill question form:
  - Email: parent's email
  - Question: "When do we depart?"
  - Type: "question"
- [ ] Submit
- [ ] See success message
- [ ] Verify in Supabase: user_questions table has row with church_id = trinity UUID

### Test 6: Admin Responds to Question
- [ ] Login as Trinity admin
- [ ] Visit `/questions-dashboard.html?church=trinity`
- [ ] See the question from Test 5
- [ ] Click "Respond"
- [ ] Type response: "We depart on January 15th"
- [ ] Click "Send Response"
- [ ] Verify in Supabase: question_responses table has row with church_id = trinity UUID

### Test 7: Add Student
- [ ] Login as Trinity admin
- [ ] Visit `/admin-portal.html?church=trinity`
- [ ] Go to "Students" tab
- [ ] Click "+ Add Student"
- [ ] Fill form:
  - Name: "Sarah Johnson"
  - Email: "sarah@example.com"
  - Grade: "8"
  - Parent: (select the parent from Test 2)
  - Emergency contact, etc.
- [ ] Click "Add Student"
- [ ] Student appears in list
- [ ] Verify in Supabase: students table has row with church_id = trinity UUID, parent_id = parent's id

### Test 8: Parent Sees Their Student
- [ ] Logout admin
- [ ] Login as Trinity parent (from Test 2)
- [ ] Visit `/parent-portal.html?church=trinity`
- [ ] See the student just added
- [ ] Can click student to see details
- [ ] Verify: only Trinity students shown, not students from other churches

### Test 9: Create Event
- [ ] Login as Trinity admin
- [ ] Visit `/admin-portal.html?church=trinity`
- [ ] Go to "Events" tab
- [ ] Click "+ Add Event"
- [ ] Fill form:
  - Title: "Orientation Meeting"
  - Type: "meeting"
  - Date: upcoming date
  - Time: "6:00 PM"
  - Location: "Trinity Chapel"
- [ ] Click "Add Event"
- [ ] Event appears in list
- [ ] Parent can see event in their home page

### Test 10: Upload Document
- [ ] Login as Trinity parent
- [ ] Visit `/parent-portal.html?church=trinity`
- [ ] Go to "Documents" section
- [ ] Click "Upload Document"
- [ ] Select file, add title/type
- [ ] Upload succeeds
- [ ] Document appears with "pending" status

### Test 11: Admin Approves Document
- [ ] Login as Trinity admin
- [ ] Visit `/admin-portal.html?church=trinity`
- [ ] Go to "Documents" tab
- [ ] See pending document from Test 10
- [ ] Click "Approve"
- [ ] Document status changes to "approved"
- [ ] Parent sees approved status

### Test 12: Data Isolation Test
**This is critical to verify multi-tenancy works**

Scenario: If another church were added, verify Trinity data isn't visible to them.

- [ ] Navigate to super-admin-portal.html
- [ ] Login as admin
- [ ] Create a new church "Crossroads"
- [ ] Signup a parent at `/login.html?church=crossroads`
- [ ] Have Crossroads parent login
- [ ] Verify they see:
  - [ ] NO Trinity students
  - [ ] NO Trinity events
  - [ ] NO Trinity questions
  - [ ] Only Crossroads data (which will be empty initially)
- [ ] Have Trinity parent login
- [ ] Verify they still see:
  - [ ] Trinity students
  - [ ] Trinity events
  - [ ] Trinity questions
  - [ ] NO Crossroads data

### Test 13: Admin Role Enforcement
- [ ] Login as Trinity parent (not admin)
- [ ] Try to visit `/questions-dashboard.html?church=trinity`
- [ ] Should see alert: "You do not have permission"
- [ ] Redirected to parent portal
- [ ] Cannot access admin features

### Test 14: Church Context Persistence
- [ ] Login as Trinity parent
- [ ] Navigate between multiple Trinity pages:
  - [ ] `/parent-portal.html`
  - [ ] `/nice-to-know.html`
  - [ ] `/index.html` (home)
  - All should maintain Trinity context (uses localStorage)
- [ ] Close browser and come back
- [ ] Trinity context should still be remembered in localStorage

## Database Verification

After running tests, verify Trinity data in Supabase:

```sql
-- Check Trinity Church exists
SELECT * FROM churches WHERE id = '00000000-0000-0000-0000-000000000001';
-- Expected: 1 row with name='Trinity Church', slug='trinity'

-- Check parent user
SELECT id, email, role, church_id FROM users WHERE email = 'john@example.com';
-- Expected: role='parent', church_id='00000...001'

-- Check admin user
SELECT id, email, role, church_id FROM users WHERE role='admin';
-- Expected: at least 1 row with church_id='00000...001'

-- Check questions for Trinity
SELECT id, email, question, church_id FROM user_questions WHERE church_id = '00000000-0000-0000-0000-000000000001';
-- Expected: questions only with church_id='00000...001'

-- Check students for Trinity
SELECT id, full_name, church_id, parent_id FROM students WHERE church_id = '00000000-0000-0000-0000-000000000001';
-- Expected: students only with church_id='00000...001'

-- Check events for Trinity
SELECT id, title, church_id FROM events WHERE church_id = '00000000-0000-0000-0000-000000000001';
-- Expected: events only with church_id='00000...001'
```

## Expected Behavior Summary

### Trinity Parent User
- ✅ Can sign up via `/login.html?church=trinity`
- ✅ Can login and stay authenticated
- ✅ Sees only Trinity's students
- ✅ Sees only Trinity's events and FAQs
- ✅ Can submit questions to Trinity admins
- ✅ Can upload documents for Trinity
- ✅ Cannot access admin features
- ✅ Cannot see other churches' data

### Trinity Admin User
- ✅ Can login to any portal
- ✅ Can access `admin-portal.html`
- ✅ Can access `questions-dashboard.html`
- ✅ Can access `content-management.html`
- ✅ Can approve/reject documents (Trinity only)
- ✅ Can approve/reject memories (Trinity only)
- ✅ Can respond to questions (Trinity only)
- ✅ Can create events (Trinity only)
- ✅ Can create FAQs (Trinity only)
- ✅ Cannot access other churches' admin features (if they exist)

### Data Isolation
- ✅ Trinity users see only Trinity data
- ✅ Trinity admins manage only Trinity
- ✅ API filters all queries by church_id
- ✅ RLS policies prevent unauthorized access
- ✅ No data leakage between churches

## Troubleshooting Test Failures

### "No church context found" error
- Check: URL includes `?church=trinity` or slug is in path
- Check: churches table has Trinity record
- Check: tenant.js is loaded before other scripts

### Question not appearing
- Check: user_questions table in Supabase
- Check: question has church_id = trinity UUID
- Check: user_questions table has correct RLS policies

### "You do not have permission" appearing for admin
- Check: user.role in database is 'admin' (case sensitive!)
- Check: Auth.initializePage('admin') is being called
- Check: Browser console for JavaScript errors

### Student not showing in parent portal
- Check: students table - record exists with correct church_id and parent_id
- Check: parent's church_id matches student's church_id
- Check: API.getMyStudents(churchId) is being called with correct church ID

### "Object of type Decimal is not JSON serializable"
- This happens when Supabase returns decimal values
- Check: all numeric fields use proper JSON formatting
- Check: payment amounts are formatted as numbers not decimals

---

Use this guide to verify Trinity Church is working correctly before deploying to Vercel or adding additional churches.
