# WeOnAMission System Overview

## The Big Picture

WeOnAMission is a **multi-tenant SaaS platform** where:
- Each **church** is a separate tenant with completely isolated data
- Each church has its own **admin team** managing the trip
- Parents sign up and manage their students
- Students can view and interact with trip info

Think of it like Slack:
- Slack = one company selling to many organizations
- WeOnAMission = one company selling to many churches
- Each church is like a "Slack workspace" - separate, isolated, independent

---

## The Architecture

```
                          weonamission.org
                                 |
                    _______________+_______________
                   /                               \
            LANDING PAGE                    SUPER ADMIN PORTAL
         (List all churches)            (Add/manage all churches)
                   |
        ___________|___________
       /         /       \      \
   Trinity   Crossroads  Hope   etc.
   /trinity  /crossroads /hope
      |          |         |
   (Each church has the same app structure, but isolated data)
      |
      +-- HOME PAGE (index.html)
      |
      +-- AUTHENTICATION (login.html)
      |   ├── Sign In
      |   └── Sign Up
      |
      +-- THREE TYPES OF USERS
          |
          ├── ADMIN (admin-portal.html, questions-dashboard.html, content-management.html)
          |
          ├── PARENT (parent-portal.html)
          |
          └── STUDENT (student-portal.html)
```

---

## Core Concepts

### 1. Tenant = Church

Each church is a **tenant** - completely separate database records with `church_id` column.

Example:
```
Trinity Church (church_id = 00000000-0000-0000-0000-000000000001)
  ├── Students: Sarah, John, Emily
  ├── Parents: Tom, Lisa, Mike
  ├── Admins: Pastor Dave
  └── Events, Payments, Questions (all belong to Trinity)

Crossroads Church (church_id = some-other-uuid)
  ├── Students: Jake, Alex, Jordan
  ├── Parents: Karen, David
  ├── Admins: Pastor Mark
  └── Events, Payments, Questions (all belong to Crossroads)

Trinity's parent Tom CANNOT see Crossroads' students or events
Crossroads' admin Pastor Mark CANNOT see Trinity's data
```

### 2. Users & Roles

There are **3 user roles**:

#### ADMIN Role
- **Who**: Church admin/staff (usually 1-3 per church)
- **Sets up**: Trip details, events, content, FAQs
- **Manages**: Document approvals, question responses, payment tracking
- **Portal**: `/admin-portal.html`
- **Church-specific**: Each church has its own admin(s)
- **Example**: Pastor Dave at Trinity, Pastor Mark at Crossroads
- **Can access**:
  - Admin Portal - Dashboard with all students, payments, documents
  - Questions Dashboard - Answer parent questions
  - Content Management - Create FAQs and content

#### PARENT Role
- **Who**: Adults signing up to manage students on the trip
- **Does**: Adds students, uploads documents, tracks payments, asks questions
- **Portal**: `/parent-portal.html`
- **Church-specific**: Only sees their church's data
- **Example**: Tom (Trinity parent), Karen (Crossroads parent)
- **Can access**:
  - Parent Portal - See their students, payments, documents
  - Home page - View events, FAQs, resources (read-only)
  - Nice to Know - View FAQs and helpful content

#### STUDENT Role
- **Who**: Young people going on the trip
- **Does**: View trip info, submit trip memories (with photos), see events
- **Portal**: `/student-portal.html`
- **Church-specific**: Only sees their church's trip info
- **Example**: Sarah (Trinity student, added by parent Tom), Jake (Crossroads student, added by parent Karen)
- **Can access**:
  - Student Portal - View upcoming events, submit trip memories
  - Home page - View events, FAQs, resources (read-only)
  - Nice to Know - View FAQs and helpful content

---

## How Users Flow Through the System

### USER 1: Parent Signs Up (First Time)

```
1. Parent visits: weonamission.org/ or weonamission.org/trinity/
   (Landing page)

2. Landing page shows all churches:
   - Trinity Church (Peru 2026)
   - Crossroads Church (Jamaica 2026)
   - Hope Church (Mexico 2026)

3. Parent clicks "Sign Up" on Trinity card
   → Goes to: /login.html?church=trinity&signup=true

4. Parent fills signup form:
   - Name: "Tom"
   - Email: "tom@email.com"
   - Password: "password123"

5. System creates:
   - Supabase auth user (global auth)
   - Database user record in `users` table:
     {
       id: uuid,
       email: "tom@email.com",
       full_name: "Tom",
       role: "parent",           ← Automatically set to parent
       church_id: trinity_uuid   ← Set to Trinity's ID
     }

6. System redirects to: /parent-portal.html?church=trinity
   (or /trinity/parent-portal.html after Vercel deployment)

7. Parent sees their portal - empty because no students added yet
```

### USER 2: Parent Adds Student

```
1. Parent logged in at parent-portal.html

2. Parent clicks "+ Add Student"

3. Parent fills form:
   - Student Name: "Sarah"
   - Grade: "8"
   - Email: "sarah@email.com"
   - Emergency contact: "Jane" / "555-1234"
   - Shirt size: "Medium"

4. System creates in `students` table:
   {
     id: uuid,
     full_name: "Sarah",
     grade: 8,
     email: "sarah@email.com",
     parent_id: tom_user_id,    ← Links to parent
     church_id: trinity_uuid,   ← Same church as parent
     ...other fields...
   }

5. Sarah's data is only visible to:
   - Tom (her parent)
   - Trinity admins
   - Sarah (when she logs in as student)
   - NOT visible to: Crossroads admins, other parents, other students
```

### USER 3: Student Logs In

```
1. Sarah visits: weonamission.org/trinity/login.html
   (or /login.html?church=trinity)

2. Sarah clicks "Sign In" tab (she was pre-created by parent Tom)

3. Sarah enters:
   - Email: "sarah@email.com"
   - Password: (system-generated or parent provides)

4. System:
   - Authenticates against Supabase
   - Finds user in `users` table with:
     role: "student"
     church_id: trinity_uuid
   - Redirects to: /student-portal.html?church=trinity

5. Sarah can now:
   - View upcoming Trinity events (mission trip dates, meetings, etc.)
   - Submit trip memories (stories with optional photos)
   - View FAQs and helpful resources
   - See her profile info

6. Sarah CANNOT:
   - See parent portal (only students go to student portal)
   - See admin features
   - Approve documents
   - See other students' information
```

### USER 4: Admin Manages Everything

```
1. Pastor Dave (Trinity admin) visits: /admin-portal.html?church=trinity

2. Auth checks: role = "admin" ✓

3. Pastor Dave sees dashboard with:
   - Total students at Trinity
   - Payments summary
   - Pending documents to approve
   - Pending trip memories to approve

4. Pastor Dave can:

   a) STUDENTS TAB:
      - See all Trinity students
      - Add new student manually
      - View student details
      - Search students

   b) PAYMENTS TAB:
      - See payment summary for each student
      - Track who has paid / who owes
      - Add payment records
      - See balance due

   c) DOCUMENTS TAB:
      - See submitted documents (waivers, permission slips, etc.)
      - Approve or reject documents
      - Add notes

   d) MEMORIES TAB:
      - See submitted trip memories from students
      - Approve or reject (moderate inappropriate content)

   e) EVENTS TAB:
      - Create events (kick-off meeting, training day, departure, return)
      - Edit or delete events
      - Students and parents see these events in their portals

   f) RESOURCES TAB:
      - Add resources (packing list, preparation guide, etc.)
      - Create/manage which appear on home page

5. Pastor Dave CANNOT:
   - See Crossroads Church data
   - Change his own role to parent
   - Access Crossroads admin features
```

### USER 5: Admin Responds to Questions

```
1. Parent Tom submits question from parent-portal.html:
   - Question: "What is the trip cost?"
   - Type: "question"

2. Question stored in `user_questions` table:
   {
     id: uuid,
     email: "tom@email.com",
     question: "What is the trip cost?",
     question_type: "question",
     status: "submitted",
     church_id: trinity_uuid
   }

3. Pastor Dave (admin) visits: /questions-dashboard.html?church=trinity

4. Pastor Dave sees Trinity questions

5. Pastor Dave clicks "Respond" on Tom's question

6. Pastor Dave types: "The trip costs $2,500 per student"

7. System creates in `question_responses` table:
   {
     id: uuid,
     question_id: xxx,
     admin_id: pastor_dave_id,
     response: "The trip costs $2,500 per student",
     church_id: trinity_uuid
   }

8. Tom (parent) gets notified that his question was answered
   (if email notifications are implemented)

9. Tom can see the response in his question history
```

---

## All The Pages (8 Total)

### 1. **landing.html** - PUBLIC
- **URL**: `/` or `/landing.html` or `weonamission.org/`
- **Who can access**: Anyone (no login needed)
- **What it does**:
  - Shows all churches in database
  - Shows trip info for each church (name, location, year)
  - Provides "Login" and "Sign Up" buttons for each church
  - Provides admin portal link at bottom
- **Church-specific**: No (shows all churches)
- **User type**: None (public)

### 2. **super-admin-portal.html** - SUPER ADMIN ONLY
- **URL**: `/super-admin-portal.html`
- **Who can access**: Any logged-in user (no role check yet)
- **What it does**:
  - Create new churches
  - Edit existing churches (name, trip details, settings)
  - Delete churches
  - View all churches and users across platform
  - View platform statistics
- **Church-specific**: No (manages ALL churches)
- **User type**: Super Admin (anyone logged in can access right now - TODO: add super admin role)
- **Example**: Your brother managing Trinity, Crossroads, Hope, etc.

### 3. **login.html** - AUTHENTICATION
- **URL**: `/login.html` or `/login.html?church=trinity`
- **Who can access**: Anyone (no login needed)
- **What it does**:
  - Sign In tab - existing users login
  - Sign Up tab - new users create account
  - Detects church from query parameter or URL path
  - Shows church name in header
  - Redirects to appropriate portal based on role
- **Church-specific**: Yes (can be specific to one church or generic)
- **User type**: None (public auth page)

### 4. **index.html** - HOME PAGE
- **URL**: `/` or `/index.html` or `/trinity/index.html` or `/?church=trinity`
- **Who can access**: Everyone (authenticated)
- **What it does**:
  - Shows upcoming events
  - Shows resources (packing list, guides, etc.)
  - Shows FAQs
  - Shows trip memories (photos from previous students)
  - Allows anyone to submit a question
- **Church-specific**: Yes (shows only that church's events, FAQs, etc.)
- **User type**: Parent, Student, Admin (all can view)
- **Read-only**: Yes (just displays info)

### 5. **parent-portal.html** - PARENT ONLY
- **URL**: `/parent-portal.html?church=trinity`
- **Who can access**: Users with role = "parent"
- **What it does**:
  - Shows list of parent's students
  - For each student:
    - Payment status (total cost, amount paid, balance due)
    - Documents to upload (waivers, permission slips, etc.)
    - Approve/reject status for submitted documents
    - Trip memory submissions
  - Parent can:
    - Add new student
    - Upload documents
    - Track payments
    - Submit questions to admins
- **Church-specific**: Yes (only sees their church's students)
- **User type**: Parent
- **Important**: Parent Tom only sees students they added

### 6. **student-portal.html** - STUDENT ONLY
- **URL**: `/student-portal.html?church=trinity`
- **Who can access**: Users with role = "student"
- **What it does**:
  - Shows student's approved trip memories
  - Allows student to submit trip memory (with optional photo)
  - Shows upcoming events
  - Shows resources and FAQs
  - Submit questions to admins
- **Church-specific**: Yes (only sees their church's data)
- **User type**: Student
- **Important**: Sarah only sees Trinity data, not other churches
- **Connection to parent**: Sarah was added by parent Tom
  - Tom can see Sarah's submitted documents/payments
  - Sarah can see her profile and events
  - BUT: Sarah and Tom don't directly communicate in the system

### 7. **admin-portal.html** - ADMIN ONLY
- **URL**: `/admin-portal.html?church=trinity`
- **Who can access**: Users with role = "admin"
- **What it does**:
  - Dashboard showing stats (total students, payments, pending docs, memories)
  - STUDENTS tab - manage all students, add new ones
  - PAYMENTS tab - track payment status for all students
  - DOCUMENTS tab - approve/reject submitted documents
  - MEMORIES tab - approve/reject trip memories
  - EVENTS tab - create/manage calendar events
  - RESOURCES tab - create/manage resources
- **Church-specific**: Yes (only manages their church)
- **User type**: Admin (role = "admin")
- **Important**: Trinity admin Pastor Dave only manages Trinity
  - Cannot see Crossroads data
  - Only Trinity events appear on Trinity parents' portals
  - Trinity questions only appear in Trinity questions dashboard

### 8. **questions-dashboard.html** - ADMIN ONLY
- **URL**: `/questions-dashboard.html?church=trinity`
- **Who can access**: Users with role = "admin"
- **What it does**:
  - Shows all questions submitted by parents/students for that church
  - Admin can respond to questions
  - Questions can be marked as completed
  - Admin can mark responses as FAQs (convert to FAQ)
- **Church-specific**: Yes (only questions for that church)
- **User type**: Admin
- **Connection**: Responses appear in question history (via index.html or elsewhere)

### 9. **content-management.html** - ADMIN ONLY
- **URL**: `/content-management.html?church=trinity`
- **Who can access**: Users with role = "admin"
- **What it does**:
  - Create/edit/delete FAQs
  - Create/edit/delete content items (packing lists, preparation guides, etc.)
  - Manage which content appears in "Nice to Know" page
- **Church-specific**: Yes (only manages their church's FAQs)
- **User type**: Admin

### 10. **nice-to-know.html** - PUBLIC
- **URL**: `/nice-to-know.html?church=trinity` or `/trinity/nice-to-know.html`
- **Who can access**: Everyone (no login needed usually, but can be)
- **What it does**:
  - Shows FAQs for that church
  - Shows content items (packing lists, guides, etc.)
  - Read-only display of admin-created content
- **Church-specific**: Yes
- **User type**: Parent, Student, Admin (all can read)
- **Read-only**: Yes

---

## Adding a New Church (Step by Step)

### Scenario: Adding Crossroads Church

**Step 1: Go to Super Admin Portal**
- URL: `weonamission.org/super-admin-portal.html`
- Login as any admin user (or create one)

**Step 2: Fill "Add New Church" Form**
```
Church Name:     "Crossroads Church"
Church Slug:     "crossroads"
Trip Name:       "Jamaica Outreach 2026"
Country:         "Jamaica"
Trip Year:       2026
```

**Step 3: Click "Create Church"**
- System creates churches table row:
  ```
  id: uuid (auto-generated)
  name: "Crossroads Church"
  slug: "crossroads"
  settings: {
    tripName: "Jamaica Outreach 2026",
    country: "Jamaica",
    tripYear: 2026
  }
  ```

**Step 4: Crossroads is Now Live**
- Parent can visit: `weonamission.org/crossroads/`
- Parent can signup at: `weonamission.org/crossroads/login.html`
- Crossroads admin can create an account and setup trip

---

## Understanding the Data Isolation

### Same Database, Different Tables

```
All churches in ONE Supabase project:

students table (1 table for all churches)
├── Trinity students (church_id = trinity_uuid)
├── Crossroads students (church_id = crossroads_uuid)
└── Hope students (church_id = hope_uuid)

events table (1 table for all churches)
├── Trinity events (church_id = trinity_uuid)
├── Crossroads events (church_id = crossroads_uuid)
└── Hope events (church_id = hope_uuid)

[Same for payments, documents, questions, etc.]
```

### Query Examples

**Get Trinity students:**
```sql
SELECT * FROM students WHERE church_id = trinity_uuid
```

**Get Crossroads payments:**
```sql
SELECT * FROM payments WHERE church_id = crossroads_uuid
```

**Get Trinity questions:**
```sql
SELECT * FROM user_questions WHERE church_id = trinity_uuid
```

### RLS (Row-Level Security) Enforces Isolation

Database rules prevent:
- Trinity admin from querying `SELECT * FROM students` without church_id filter
- A user from seeing data outside their church
- Cross-church data access

Plus, all our API functions add `.eq('church_id', churchId)` to ensure isolation.

---

## How Admins Work (By Church)

### Trinity Admin: Pastor Dave
- Can only manage Trinity data
- Can create Trinity events
- Can see Trinity questions
- Can approve Trinity documents
- Cannot see or access Crossroads data

### Crossroads Admin: Pastor Mark
- Can only manage Crossroads data
- Can create Crossroads events
- Can see Crossroads questions
- Can approve Crossroads documents
- Cannot see or access Trinity data

### Super Admin (you / your brother)
- Can create new churches
- Can manage/edit churches
- Can see all churches and users
- Currently: Anyone logged in (TODO: need super admin role)

### How Many Admins Per Church?

**Unlimited** - each church can have multiple admins:
- Pastor Dave (Trinity)
- Linda (Trinity staff, also admin)
- Mike (Trinity volunteer, also admin)

All three would have:
```
role: "admin"
church_id: trinity_uuid
```

They all see the same Trinity data and can manage Trinity independently.

---

## The Complete User Journey Example

### Tom (Parent) at Trinity Church

**Day 1:**
1. Tom visits `weonamission.org/`
2. Sees Trinity, Crossroads, Hope listed
3. Clicks "Sign Up" on Trinity
4. Goes to login page
5. Creates account (email: tom@trinity.com, password: xxx)
6. System creates user: role="parent", church_id=trinity_uuid
7. Redirected to parent-portal.html
8. Sees empty portal (no students yet)

**Day 2:**
1. Tom logs in again
2. Adds student "Sarah" (his daughter)
3. Adds student "John" (his son)
4. System creates two student records with church_id=trinity_uuid, parent_id=tom_id
5. Tom can now see Sarah and John in his portal
6. Tom uploads permission slip for Sarah
7. Tom tracks payments for John

**Day 7:**
1. Pastor Dave (Trinity admin) approves Sarah's permission slip
2. Tom sees "Approved" status on Sarah's document

**Trip day:**
1. Sarah (Tom's daughter) logs in as student
2. Sees Trinity events (departure time, meetings, activities)
3. Submits trip memory with photo from first day
4. Sees "Pending" status until Pastor Dave approves it
5. After approval, Tom and other parents can see Sarah's trip memory

---

## Key Takeaways

1. **Each church is completely separate** - Trinity admin cannot see Crossroads
2. **Three user types**: Admin (manage), Parent (track), Student (participate)
3. **Admin role is church-specific** - Pastor Dave is Trinity admin, Pastor Mark is Crossroads admin
4. **Unlimited admins per church** - as many as needed
5. **Admins manage everything** - students, payments, documents, events, content
6. **Parents add students** - student is linked to parent and church
7. **Students submit content** - memories, ask questions, view info
8. **Super admin adds churches** - anyone with access to super-admin-portal (should add role check)
9. **10 pages total** - landing, login, 7 portals, nice-to-know
10. **Same database, isolated by church_id** - RLS + API filtering ensures separation

---

## How Admins Get Their Permissions

### USER 5b: Super Admin Promotes New Admin

This is the workflow for getting a new church admin set up:

```
SCENARIO: Trinity Church needs an admin (Pastor Dave)

Step 1: Pastor Dave signs up like a normal parent
└─ Goes to: /login.html?church=trinity
└─ Fills signup: Name, email, password
└─ System makes him a parent (role = 'parent')

Step 2: Super Admin promotes Pastor Dave to admin
└─ Super admin goes to: /super-admin-portal.html
└─ Scrolls to: "Manage Church Users" section
└─ Selects: "Trinity Church" from dropdown
└─ Sees table of Trinity users
└─ Finds: Pastor Dave (currently showing role = "Parent")
└─ Clicks: "Promote to Admin" button
└─ Confirms: "Promote this user to admin?"
└─ DONE! Pastor Dave is now admin ✓

Step 3: Pastor Dave logs back in
└─ Can now access: /admin-portal.html
└─ Sees: Admin dashboard
└─ Can manage: Events, FAQs, resources, documents, payments
└─ Can approve: Documents, memories, questions
└─ Can see: ALL Trinity data

TIME TO PROMOTE: < 30 seconds
(Previously: 5-10 minutes using SQL commands)

COMPLETE WORKFLOW:
User signup (2 min) → Super admin promotion (< 1 min) → Admin ready! ✓
```

**Key Points:**
- Any user starts as "parent" when they sign up
- Super admin can promote them to "admin" via UI button in Super Admin Portal
- Promotion is instant and per-church (same person can be admin in Trinity, parent in Crossroads)
- See **ADMIN_PROMOTION_GUIDE.md** for complete documentation

---

## What's Built vs. What's Missing

### ✅ BUILT
- Multi-tenant database with church_id isolation
- Role-based access control (admin, parent, student)
- **Admin promotion system** - One-click UI buttons to promote/demote users
- Super Admin Portal to create churches and manage users
- Admin portals to manage everything
- Parent portal to track students and payments
- Student portal to submit memories and view events
- Questions/answers system with admin dashboard
- Content management (FAQs, resources) with UI
- Document upload and approval workflow
- Payment tracking and management
- Event management
- Public FAQ and content viewer
- All 10 pages created and multi-tenant enabled

### ❌ MISSING / TODO
- Super admin role enforcement (currently anyone logged in can access super-admin-portal)
- Email notifications (questions answered, documents approved, etc.)
- Photo uploads for trip memories (UI exists, backend not connected)
- Student auto-creation from parent signup
- Church branding customization (colors, logos)
- Payment processing integration
- Vercel deployment
- Production RLS policies (currently RLS disabled, using application-level filtering)

---

## Next Steps to Show Your Brother

1. **Test Trinity Church completely**:
   - Signup as parent
   - Add students
   - Upload documents
   - Track payments
   - Ask questions
   - Approve as admin
   - Login as student
   - Submit memory

2. **Test Adding Crossroads Church**:
   - Go to super-admin-portal.html
   - Add Crossroads Church
   - Signup as Crossroads parent
   - Verify Crossroads data is separate from Trinity

3. **Show multi-tenancy working**:
   - Have Trinity parent login
   - Have Crossroads parent login
   - Show they each see only their own data

This will demonstrate the entire system is working.
