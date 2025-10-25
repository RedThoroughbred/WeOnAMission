# WeOnAMission Multi-Tenant Architecture Guide

## Overview

WeOnAMission is a **SaaS (Software-as-a-Service) platform** for managing mission trips across multiple churches. Each church has a completely isolated, branded instance of the platform.

## Architecture

### URL Structure

The platform uses **subdirectory-based routing** for multi-tenancy:

```
weonamission.org/                          → Landing page (list all churches)
weonamission.org/trinity/                  → Trinity Church home
weonamission.org/trinity/login.html        → Trinity Church login
weonamission.org/trinity/parent-portal.html → Trinity Church parent portal
weonamission.org/crossroads/               → Crossroads Church home (when added)
```

**Temporary Query Parameter Support** (for local development):
```
localhost:8000/login.html?church=trinity
localhost:8000/parent-portal.html?church=trinity
```

### Database Design

Each table has a `church_id` column for tenant isolation:

```sql
-- Churches table (one row per church)
churches
├── id (UUID)
├── name (text)
├── slug (text - used in URLs)
├── settings (JSONB - church-specific config)
└── created_at

-- User data tables (church_id isolates data)
users
├── church_id
├── role (admin, parent, student)
└── ...

students
├── church_id
├── parent_id
└── ...

trip_memories
├── church_id
├── student_id
└── ...

(and 10+ more tables with church_id)
```

**Row-Level Security (RLS)**: Each table has RLS policies ensuring users can only see their church's data.

## User Flows

### 1. Landing Page Flow

```
User visits: weonamission.org/
↓
landing.html loads all churches from database
↓
Shows church cards with:
  - Church name
  - Trip name & location
  - "Login" button → login.html?church=slug
  - "Sign Up" button → login.html?church=slug&signup=true
↓
Admin link at bottom → super-admin-portal.html
```

### 2. New Church Signup (Admin)

```
Admin visits: super-admin-portal.html
↓
Logs in with any admin account
↓
Fills "Add New Church" form:
  - Church Name: "Crossroads Church"
  - Church Slug: "crossroads"
  - Trip Name: "Peru 2026"
  - Country: "Peru"
  - Trip Year: 2026
↓
Creates church record in database
↓
Church immediately available at:
  - weonamission.org/crossroads/
  - Users can signup via weonamission.org/crossroads/login.html
```

### 3. User Signup (Parent/Student)

```
User visits: weonamission.org/trinity/login.html
          OR: weonamission.org/login.html?church=trinity
↓
Header shows: "Trinity Church" (dynamically loaded)
↓
Clicks "Sign Up" tab
↓
Fills form:
  - Full Name
  - Email
  - Password
↓
System creates:
  1. Supabase auth user (auth.users table)
  2. Database user record with:
     - role = 'parent' (default for new signups)
     - church_id = Trinity's UUID
↓
Auto-signs in user
↓
Redirects to: /trinity/parent-portal.html
↓
User sees only Trinity's data:
  - Trinity's students
  - Trinity's events
  - Trinity's FAQs
  - Trinity's questions
```

### 4. User Login (Existing User)

```
User visits: weonamission.org/trinity/login.html
↓
Enters email & password
↓
System:
  1. Authenticates against Supabase
  2. Gets user record from database
  3. Detects user.church_id = Trinity UUID
  4. Detects user.role = 'parent'
↓
Redirects to: /trinity/parent-portal.html
↓
parent-portal.html:
  1. Loads church context (tenant.js)
  2. Gets church ID for URL
  3. Fetches data: API.getMyStudents(churchId)
  4. Displays only Trinity's students
```

## Church Context Detection (tenant.js)

The `tenant.js` file is the core of multi-tenancy. It detects which church is being accessed:

```javascript
// Priority order for detecting church:
1. Query parameter:    ?church=trinity
2. URL path:           /trinity/parent-portal.html
3. localStorage:       selectedChurch (persisted between pages)

// Returns church context:
{
  slug: 'trinity',
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Trinity Church'
}

// Then all API calls use this ID:
API.getMyStudents(churchId)
API.submitQuestion(email, question, type, churchId)
API.getContentItems(section, churchId)
```

## Complete Page Architecture

### Public Pages (No Auth Required)

- **landing.html** - Church selection / homepage
- **super-admin-portal.html** - Platform admin (manage all churches)

### Authenticated Pages (Auth Required)

- **index.html** - Home page (church-specific)
- **login.html** - Sign in / Sign up (church-specific)
- **parent-portal.html** - Parent dashboard (church-specific)
- **student-portal.html** - Student dashboard (church-specific)
- **admin-portal.html** - Admin dashboard (church-specific, role restricted)
- **questions-dashboard.html** - Q&A management (church-specific, admin only)
- **content-management.html** - Content management (church-specific, admin only)
- **nice-to-know.html** - FAQ viewer (church-specific)

### Each page:
1. Loads tenant.js to detect church
2. Calls Auth.initializePage() for authentication
3. Gets churchId from Tenant.getCurrentChurchContext()
4. Passes churchId to all API calls
5. Only displays that church's data

## Deployment to Vercel

### Prerequisites
1. Vercel account
2. GitHub repository with code
3. Environment variables configured in Vercel

### vercel.json Configuration

```json
{
  "rewrites": [
    {
      "source": "/(.*?)/(.*)",
      "destination": "/$2?church=$1"
    },
    {
      "source": "/",
      "dest": "/landing.html"
    }
  ]
}
```

This allows:
- `/trinity/parent-portal.html` → `/parent-portal.html?church=trinity`
- `/crossroads/login.html` → `/login.html?church=crossroads`
- `/` → `/landing.html`

### Deploy Steps

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables (Supabase URL, Supabase key)
4. Vercel auto-deploys on git push

## Adding a New Church

### Method 1: Super Admin Portal (Recommended)

1. Go to `weonamission.org/super-admin-portal.html`
2. Login with any admin account
3. Fill "Add New Church" form
4. Click "Create Church"
5. New church immediately available at `weonamission.org/[slug]/`

### Method 2: Direct Database (Manual)

```sql
INSERT INTO churches (id, name, slug, settings)
VALUES (
  gen_random_uuid(),
  'Crossroads Church',
  'crossroads',
  '{"tripName": "Peru 2026", "country": "Peru", "tripYear": 2026}'::jsonb
);
```

Then users can access:
- `weonamission.org/crossroads/login.html` to sign up
- `weonamission.org/crossroads/` to view home page

## Making an Admin

1. User signs up (creates account as 'parent' by default)
2. Go to Supabase → users table
3. Find the user's row
4. Change their `role` from `'parent'` to `'admin'`
5. User can now access admin portals:
   - `/trinity/admin-portal.html`
   - `/trinity/questions-dashboard.html`
   - `/trinity/content-management.html`

## Data Isolation

### Application Level
- Every API function checks `churchId` parameter
- Example: `API.getMyStudents(churchId)` filters by that church ID

### Database Level
- RLS (Row-Level Security) policies enforce isolation
- Users can only query their own church's data
- Prevents SQL injection or admin bypass

### Example RLS Policy
```sql
CREATE POLICY "Users see only their church's students"
ON students FOR SELECT
USING (
  church_id = (SELECT church_id FROM users WHERE id = auth.uid())
);
```

## Admin Role Enforcement

### Frontend
- `Auth.initializePage('admin')` checks role before page loads
- Non-admins see alert and are redirected

### Backend (API)
- `API.isUserAdmin()` checks role before executing
- Non-admins get error: "Admin role required"
- Protects functions like:
  - `createEvent()`
  - `approveDocument()`
  - `submitQuestionResponse()`
  - `deleteFaq()`

## Feature Checklist

### Core Features (Done ✅)
- [x] Multi-tenant database with church_id isolation
- [x] Subdirectory-based URL routing
- [x] Dynamic church context detection (tenant.js)
- [x] Landing page showing all churches
- [x] Super admin portal for managing churches
- [x] Church signup flow
- [x] User signup/login with church selection
- [x] Admin role enforcement (frontend + backend)
- [x] Data isolation via RLS policies
- [x] Church-specific branding in UI

### Ready for Testing ✅
- [x] Trinity Church fully functional
- [x] Admin features protected
- [x] Question submission system
- [x] Document approval workflow
- [x] Content management
- [x] Payment tracking

### Recommended Next Steps
- [ ] Email notifications (when admin responds to questions)
- [ ] Photo uploads for trip memories
- [ ] Payment processing integration
- [ ] Church white-labeling (custom colors/logos)
- [ ] SMS notifications
- [ ] Mobile app

## Common Scenarios

### Scenario 1: Add Crossroads Church
```
1. Go to weonamission.org/super-admin-portal.html
2. Login as admin
3. Fill form:
   - Name: "Crossroads Church"
   - Slug: "crossroads"
   - Trip: "Jamaica Outreach 2026"
   - Country: "Jamaica"
4. Click "Create Church"
5. Done! Church now accessible at weonamission.org/crossroads/
```

### Scenario 2: New Parent Signs Up for Trinity
```
1. Visit weonamission.org/trinity/
2. Click "Sign Up"
3. Goes to /trinity/login.html?signup=true
4. Fills signup form
5. Account created with:
   - role = 'parent'
   - church_id = Trinity UUID
6. Auto-redirects to /trinity/parent-portal.html
7. See only Trinity's students and data
```

### Scenario 3: Admin Reviews Questions
```
1. Admin visits weonamission.org/trinity/questions-dashboard.html
2. Auth checks: user.role = 'admin' ✓
3. See Trinity's pending questions
4. Write response
5. API calls: submitQuestionResponse(questionId, response, churchId)
6. API checks: isUserAdmin() ✓
7. Response saved to database with church_id = Trinity UUID
8. User gets notified
```

## Architecture Diagram

```
weonamission.org (Vercel)
├── landing.html
│   └── Lists all churches from database
│
├── super-admin-portal.html
│   └── Manage churches & platform settings
│
└── [church-slug]/
    ├── index.html
    ├── login.html
    ├── parent-portal.html
    ├── student-portal.html
    ├── admin-portal.html
    ├── questions-dashboard.html
    ├── content-management.html
    └── nice-to-know.html

    All pages:
    1. Load tenant.js
    2. Detect church from URL
    3. Load church context
    4. Fetch church-specific data
    5. Display isolated data

Database (Supabase)
├── churches (one per church)
├── users (church_id isolates)
├── students (church_id isolates)
├── trip_memories (church_id isolates)
├── questions (church_id isolates)
├── [11+ tables with church_id]
└── RLS policies enforce isolation
```

## Testing the System

### Local Testing (with query params)

```
1. Start server: python -m http.server 8000
2. Visit: http://localhost:8000/landing.html
3. Create test church via super-admin-portal.html
4. Signup: localhost:8000/login.html?church=trinity
5. Test: localhost:8000/parent-portal.html?church=trinity
```

### Live Testing (after Vercel deployment)

```
1. Visit: weonamission.org/
2. See all churches
3. Click "Trinity" → Sign Up
4. Goes to: weonamission.org/trinity/login.html
5. Signup & login
6. Redirects to: weonamission.org/trinity/parent-portal.html
7. See Trinity data only
```

## Troubleshooting

### Issue: "No church context found"
- Check URL - should include church slug or query parameter
- Check localStorage - might have old church cached
- Verify churches table has rows

### Issue: User sees empty data
- Check RLS policies are enabled
- Verify user has correct church_id
- Check API function includes churchId parameter

### Issue: User can access other church's data
- Check RLS policies on all tables
- Verify API functions filter by churchId
- Check admin functions have role validation

### Issue: Admin features accessible to non-admins
- Check Auth.initializePage('admin') called on admin pages
- Verify API functions call isUserAdmin()
- Check database user.role field is correct

## Performance Notes

- Church detection (tenant.js) is lightweight - no database call unless fetching church name
- RLS policies have minimal performance impact
- Each API query automatically filtered by church_id
- Consider indexing (church_id, id) on frequently queried tables

## Security Notes

1. **Row-Level Security** - Database enforces tenant isolation
2. **API Validation** - Church ID checked on every request
3. **Admin Role Check** - Both frontend and backend validation
4. **Auth State** - Supabase handles secure authentication
5. **Environment Variables** - API keys stored securely in Vercel

Never expose service_role key in frontend code.

---

This architecture enables WeOnAMission to scale from Trinity Church to 100+ churches, each with complete data isolation, custom branding, and independent administration.
