# WeOnAMission - Visual Guide

## 1. The Platform Architecture

```
                          ┌─────────────────────────────────┐
                          │    WeOnAMission.org (Vercel)    │
                          └─────────────────────────────────┘
                                         │
                        ┌────────────────┴────────────────┐
                        │                                 │
                   ┌────▼──────────┐            ┌─────────▼────┐
                   │  Landing Page │            │ Super Admin  │
                   │  (Public)     │            │ Portal       │
                   └───────────────┘            └──────────────┘
                        │
                        │ Choose church
                        │
            ┌───────────┼────────────┐
            │           │            │
      ┌─────▼──┐  ┌────▼───┐  ┌────▼───┐
      │ Trinity│  │Cross-  │  │ Hope   │
      │ Church │  │ roads  │  │ Church │
      │/trinity│  │/cross- │  │/hope   │
      │        │  │roads   │  │        │
      └────┬───┘  └──┬─────┘  └────────┘
           │         │
           └────┬────┘
                │
         [Same App on each church]
```

## 2. User Flows Within One Church (Trinity)

```
TRINITY CHURCH FULL USER FLOW
════════════════════════════════════════════════════════════

Start: weonamission.org/trinity/ or weonamission.org/login.html?church=trinity

                    ┌─────────────────┐
                    │  Trinity Login  │
                    │   Page (login)  │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    Sign In            Sign Up              (Or as admin)
    (existing)         (new parent)
          │                  │                  │
    ┌─────▼──────┐    ┌─────▼──────┐    ┌──────▼──────┐
    │ Parent Tom │    │ Parent Jan │    │ Pastor Dave │
    │ (existing) │    │ (new)      │    │ (admin)     │
    └─────┬──────┘    └─────┬──────┘    └──────┬──────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
       ┌─────────────────────┼─────────────────────┐
       │                     │                     │
  ┌────▼─────────┐    ┌─────▼──────────┐   ┌─────▼──────────┐
  │ Parent       │    │ Student Portal │   │ Admin Portal   │
  │ Portal       │    │                │   │                │
  │              │    │ - View events  │   │ - Manage all   │
  │ - Add        │    │ - Submit      │   │   students     │
  │   students   │    │   memories    │   │ - Approve      │
  │ - Upload     │    │ - View FAQs   │   │   documents    │
  │   docs       │    │ - Ask         │   │ - Answer       │
  │ - Track      │    │   questions   │   │   questions    │
  │   payments   │    │               │   │ - Manage       │
  │ - Ask        │    │ Sarah logged  │   │   events       │
  │   questions  │    │ in as student │   │ - Manage       │
  │              │    │ (added by     │   │   resources    │
  │ Tom logged   │    │ Tom)          │   │ - Track        │
  │ in as parent │    │               │   │   payments     │
  └──────────────┘    └───────────────┘   │                │
                                          │ Pastor Dave    │
                                          │ logged in as   │
                                          │ admin          │
                                          └────────────────┘
```

## 3. Data Isolation - Why They Can't See Each Other

```
                        Supabase Database
                  (Single project, multiple churches)

┌──────────────────────────────────────────────────────────────┐
│                          STUDENTS TABLE                      │
├──────────────────────────────────────────────────────────────┤
│ ID    │ Name      │ Church_ID  │ Parent_ID   │ Email         │
├───────┼───────────┼────────────┼─────────────┼───────────────┤
│ 001   │ Sarah     │ trinity_id │ tom_id      │ sarah@...     │
│ 002   │ John      │ trinity_id │ tom_id      │ john@...      │
│ 003   │ Emily     │ trinity_id │ lisa_id     │ emily@...     │
├───────┼───────────┼────────────┼─────────────┼───────────────┤
│ 004   │ Jake      │ cross_id   │ karen_id    │ jake@...      │
│ 005   │ Alex      │ cross_id   │ karen_id    │ alex@...      │
└───────┴───────────┴────────────┴─────────────┴───────────────┘

TRINITY ADMIN QUERY:
  SELECT * FROM students WHERE church_id = 'trinity_id'
  RESULT: Sarah, John, Emily only ✓

TRINITY PARENT QUERY:
  SELECT * FROM students WHERE church_id = 'trinity_id' AND parent_id = 'tom_id'
  RESULT: Sarah, John only ✓

CROSSROADS ADMIN QUERY:
  SELECT * FROM students WHERE church_id = 'cross_id'
  RESULT: Jake, Alex only ✓

CROSSROADS ADMIN TRYING TRINITY QUERY:
  SELECT * FROM students WHERE church_id = 'trinity_id'
  RESULT: ACCESS DENIED (RLS policy blocks) ✗
```

## 4. Role-Based Access Control

```
┌──────────────────────────────────────────────────────────────┐
│                    ROLE PERMISSIONS                          │
└──────────────────────────────────────────────────────────────┘

           PARENT                STUDENT              ADMIN
              │                    │                   │
          ┌───┴─┐            ┌─────┴──┐         ┌──────┴──────┐
          │     │            │        │         │             │
      ┌───▼──┐ ┌▼──────────┐ ┌───────▼┐  ┌────▼───┐ ┌──────▼──┐
      │Add   │ │Home Page  │ │ Student│  │Admin   │ │Questions│
      │      │ │           │ │Portal  │  │Portal  │ │ Dash    │
      │      │ │- View     │ │        │  │        │ │         │
      │      │ │  events   │ │- View  │  │- View  │ │- Answer │
      │      │ │- View     │ │  events│  │  stats │ │ ques.  │
      │      │ │  FAQs     │ │- Submit│  │- Manage│ │         │
      │      │ │- View     │ │  memory│  │students│ │Content  │
      │      │ │  resources│ │- View  │  │- Manage│ │ Manage  │
      │      │ │- Ask      │ │  FAQs  │  │payments│ │         │
      │      │ │  questions│ │- Ask   │  │- Manage│ │- Create │
      │      │ │           │ │  ques. │  │ events │ │  FAQs  │
      │      │ └───────────┘ │        │  │- Manage│ │         │
      │      │               │ NO     │  │  docs  │ │- Manage │
      │      │ Nice to Know  │ Parent │  │- Manage│ │ content │
      │      │               │ Portal │  │ content│ │         │
      │      │- View FAQs    │ View   │  │- Answer│ │Nice to  │
      │      │- View content │        │  │  ques. │ │ Know    │
      │      │               │ NO     │  │        │ │         │
      │      │ Parent Portal │ Admin  │  │- View  │ │- View   │
      │      │               │ Portal │  │ FAQs   │ │ FAQs   │
      │      │- See my       │ View   │  │- View  │ │- View   │
      │      │  students     │        │  │content │ │ content │
      │      │- Upload docs  │ NO     │  │        │ │         │
      │      │- Track        │ Parent │  │ Blocked│ │ Blocked │
      │      │  payments     │ Portal │  │ pages: │ │ pages:  │
      │      │- Ask questions│ Edit   │  │        │ │         │
      │      │               │        │  │ - Parent        │         │
      │      │ BLOCKED:      │        │  │   Portal        │         │
      │      │ - Student     │ Admin  │  │ - Student       │ - None  │
      │      │   Portal      │ Portal │  │   Portal        │         │
      │      │ - Admin       │        │  │                 │         │
      │      │   Portal      │ NO     │  │                 │         │
      │      │ - Questions   │ access │  │                 │         │
      │      │   Dashboard   │ to:    │  │                 │         │
      │      │ - Content     │        │  │                 │         │
      │      │   Management  │ - Admin│  │                 │         │
      │      │               │   areas│  │                 │         │
      └──────┘ └───────────┘ └────────┘  └─────────────────┘ └──────┘
```

## 5. Church Isolation Visually

```
TWO SEPARATE CHURCHES IN SAME APP
═════════════════════════════════

                 WeOnAMission Platform
        ┌──────────────────────────────────┐
        │                                  │
    ┌───▼────────────────┐    ┌───────────▼──────┐
    │  TRINITY CHURCH    │    │ CROSSROADS CHURCH│
    │  /trinity/         │    │ /crossroads/     │
    │                    │    │                  │
    │ Users:             │    │ Users:           │
    │ - Tom (parent)     │    │ - Karen (parent) │
    │ - Sarah (student)  │    │ - Jake (student) │
    │ - Pastor Dave (a)  │    │ - Pastor Mark(a) │
    │                    │    │                  │
    │ Data:              │    │ Data:            │
    │ - 3 students       │    │ - 2 students     │
    │ - 2 payments       │    │ - 1 payment      │
    │ - 5 events         │    │ - 4 events       │
    │ - 10 questions     │    │ - 3 questions    │
    │ - 8 FAQs           │    │ - 6 FAQs         │
    │                    │    │                  │
    │ ✓ Tom can see only │    │ ✓ Karen can see  │
    │   Trinity data     │    │   only Crossroads│
    │ ✓ Sarah can see    │    │   data           │
    │   only Trinity     │    │ ✓ Jake can see   │
    │ ✓ Dave admin can   │    │   only Crossroads│
    │   manage only      │    │ ✓ Mark admin can │
    │   Trinity          │    │   manage only    │
    │                    │    │   Crossroads     │
    │ ✗ CANNOT see       │    │ ✗ CANNOT see     │
    │   Crossroads       │    │   Trinity        │
    └────────────────────┘    └──────────────────┘
         ▲                              ▲
         │                              │
         └──────────┬───────────────────┘
                    │
            [Single Database]
            [All data filtered]
            [by church_id]
```

## 6. Authentication Flow

```
┌─ New User Signup ─┐
│                   │
│  1. Visit Trinity │
│     login page    │
│                   │
│  2. Click Signup  │
│                   │
│  3. Fill form:    │──────────────────────┐
│     - Name        │                      │
│     - Email       │                      │
│     - Password    │                      │
│     - Church:     │                      │
│       Trinity     │                      │
│                   │                      │
│  4. Submit        │                      │
│                   │                      │
└───────────────────┘                      │
                                           │
                          ┌────────────────▼───────────┐
                          │  System Actions            │
                          │                            │
                          │  1. Create Supabase auth   │
                          │     user (global)          │
                          │                            │
                          │  2. Create database user:  │
                          │     - role: "parent"       │
                          │     - church_id: trinity   │
                          │                            │
                          │  3. Auto-sign-in user      │
                          │                            │
                          │  4. Redirect to:           │
                          │     parent-portal.html     │
                          │                            │
                          └────────────────┬───────────┘
                                           │
                          ┌────────────────▼───────────┐
                          │  Parent is now logged in   │
                          │  at Trinity parent portal  │
                          │                            │
                          │  Can now:                  │
                          │  - Add students            │
                          │  - Upload documents        │
                          │  - Track payments          │
                          │  - Ask questions           │
                          │  - View Trinity events     │
                          │                            │
                          │  Cannot see:               │
                          │  - Crossroads data         │
                          │  - Admin areas             │
                          │  - Student portal          │
                          └────────────────────────────┘
```

## 7. Page Navigation Map

```
┌─── LANDING PAGE (/) ───┐
│                        │
│  See all churches      │
│                        │
│  Click Trinity →   ┌─────────────────────────────────────┐
│                    │                                     │
│                    ↓                                     │
│            ┌──────────────────────────────────────┐     │
│            │    TRINITY LOGIN PAGE               │     │
│            │ (login.html?church=trinity)         │     │
│            │                                     │     │
│            │  - Sign In (existing user)         │     │
│            │  - Sign Up (new parent)             │     │
│            │  - "Forgot Password"                │     │
│            └──────────────────────────────────────┘     │
│                    │                                     │
│    ┌───────────────┼───────────────┐                    │
│    │               │               │                    │
│    ▼               ▼               ▼                    │
│  [PARENT]      [STUDENT]        [ADMIN]               │
│    │               │               │                    │
│    ├──────┐        ├────┐          ├────┐             │
│    │      │        │    │          │    │             │
│    ▼      ▼        ▼    ▼          ▼    ▼             │
│ ┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌───────────┐ │
│ │Parent││Home  ││Stud. ││Home  ││Admin ││Questions  │ │
│ │Portal││page  ││Portal││page  ││Portal││Dashboard │ │
│ │      ││      ││      ││      ││      ││           │ │
│ │- Add ││- View││- View││- View││- View││- See all  │ │
│ │  std ││events││events││events││all   ││  questions│
│ │- Doc ││- View││- View││- View││stats ││- Answer   │
│ │upload││FAQs  ││FAQs  ││FAQs  ││      ││  questions│
│ │- Pay ││- View││- View││- View││      │└──────────┘│
│ │track ││res.  ││res.  ││res.  │└──────┘            │
│ │- Ask ││- Ask ││- Ask ││- Ask ││┌──────────────────┐│
│ │q.    ││q.    ││q.    ││q.    │││Content Manage.  ││
│ └──────┘└──────┘└──────┘└──────┘││- Create FAQ      ││
│    │      │        │      │     ││- Create content  ││
│    └──────┼────────┼──────┼─────┤└──────────────────┘│
│           │        │      │     │┌──────────────────┐│
│           │        │      │     ││Admin Portal      ││
│           │        │      │     ││- Manage students ││
│           │        │      │     ││- Approve docs    ││
│           │        │      │     ││- Approve memories││
│           │        │      │     ││- Create events   ││
│           │        │      │     ││- Track payments  ││
│           │        │      │     └──────────────────┘│
│           │        │      │                          │
│           └────────┴──────┴──────────────────────────┘
│                                                       │
│    All can also access: NICE TO KNOW PAGE            │
│    (/nice-to-know.html?church=trinity)              │
│    - View Trinity FAQs and content                   │
└─────────────────────────────────────────────────────────┘
```

## 8. Admin Workflow Example

```
ADMIN DAY IN THE LIFE: Pastor Dave at Trinity
═════════════════════════════════════════════

Morning: Manage Students & Payments
──────────────────────────────────

/admin-portal.html
    │
    ├─→ STUDENTS tab
    │   ├─ See all Trinity students (3 total)
    │   ├─ Parent Tom added Sarah & John
    │   ├─ Parent Lisa added Emily
    │   └─ Can add student manually if needed
    │
    ├─→ PAYMENTS tab
    │   ├─ Sarah (John's sister): Paid $2000, owes $500
    │   ├─ John: Paid $0, owes $2500
    │   ├─ Emily: Paid $1500, owes $1000
    │   └─ Click "+Record Payment" to log payment
    │
    └─→ DOCUMENTS tab
        ├─ Sarah's permission slip: PENDING
        ├─ Sarah's medical form: PENDING
        ├─ John's waiver: APPROVED
        └─ Click to approve/reject documents


Midday: Moderate Content & Events
──────────────────────────────────

/questions-dashboard.html
    │
    ├─→ See questions from parents
    │   ├─ Tom asked: "What time do we depart?"
    │   │   └─ Dave types response: "6 AM on June 26th"
    │   │
    │   ├─ Lisa asked: "What items to pack?"
    │   │   └─ Dave types response
    │   │   └─ Dave marks "Convert to FAQ" (adds to FAQ section)
    │   │
    │   └─ Sarah (student) asked: "Will there be free time?"
    │       └─ Dave responds


Afternoon: Manage Events & Resources
─────────────────────────────────────

/admin-portal.html (EVENTS tab)
    │
    ├─→ Create event: "Pre-trip training meeting"
    │   ├─ Date: June 15
    │   ├─ Time: 6 PM
    │   ├─ Location: Trinity Chapel
    │   └─ Click Save
    │   └─ Now appears on parent & student calendars
    │
    └─→ Parents see the event on /index.html


/content-management.html
    │
    └─→ Create FAQ
        ├─ Question: "What should I pack?"
        ├─ Answer: "See attached packing list..."
        └─ Click Save
        └─ Now appears on /nice-to-know.html


Evening: Manage Documents & Memories
─────────────────────────────────────

/admin-portal.html (DOCUMENTS tab)
    │
    ├─→ See Sarah's pending permission slip
    ├─→ Click "Approve"
    └─→ Tom (parent) sees "APPROVED" status


/admin-portal.html (MEMORIES tab)
    │
    ├─→ See Sarah's submitted trip memory:
    │   "Our first day was amazing! We met local kids
    │    and played soccer. Here's a pic:" [photo]
    │
    ├─→ Review (appropriate content)
    ├─→ Click "Approve"
    └─→ Memory now visible to all Trinity parents


End of Day:
──────────

/admin-portal.html (DASHBOARD)
    │
    ├─ Total Students: 3
    ├─ Payments Complete: 0/3 (0%)
    ├─ Pending Documents: 1
    ├─ Pending Memories: 0
    │
    └─ Dave ready for tomorrow!
```

## 9. Multi-Church Comparison

```
IF TRINITY ADMIN PASTOR DAVE TRIES TO ACCESS CROSSROADS DATA:

┌─────────────────────────────────────────────────────────┐
│  Pastor Dave is logged in                               │
│  church_id: trinity_uuid                                │
│  role: admin                                            │
└────────────┬────────────────────────────────────────────┘
             │
             │ Dave tries to visit:
             │ /admin-portal.html?church=crossroads
             │
             ▼
    ┌─────────────────────────────┐
    │  Page loads but...          │
    │                             │
    │  tenant.js tries to get:    │
    │  getChurchContext()         │
    │  church = crossroads        │
    │                             │
    │  ✓ Detects Crossroads       │
    │  ✓ Page loads               │
    │                             │
    │  But then...                │
    │                             │
    │  Admin Portal tries:        │
    │  API.getAllStudents(        │
    │    churchId: crossroads_id  │
    │  )                          │
    │                             │
    │  ✗ RLS blocks query:        │
    │    "Your church_id doesn't  │
    │     match this data"        │
    │                             │
    │  ✗ Returns empty or error   │
    │  ✗ Dave sees nothing        │
    │                             │
    │  CANNOT access Crossroads   │
    │  data even with URL change  │
    │                             │
    └─────────────────────────────┘
```

## 10. Complete System Diagram

```
                          END USER
                             │
            ┌────────────────┼────────────────┐
            │                │                │
         ADMIN            PARENT           STUDENT
         (1-3 per       (unlimited        (unlimited
         church)        per church)       per church)
            │                │                │
            │                │                │
      ┌─────▼────────────────▼────────────────▼──┐
      │                                          │
      │         WeOnAMission App                 │
      │      (Frontend - HTML/CSS/JS)            │
      │                                          │
      │  ┌──────────────────────────────────┐  │
      │  │ 10 Pages                         │  │
      │  │ - Landing (public)               │  │
      │  │ - Login (public)                 │  │
      │  │ - Home (for all roles)           │  │
      │  │ - Parent Portal (parents only)   │  │
      │  │ - Student Portal (students only) │  │
      │  │ - Admin Portal (admins only)     │  │
      │  │ - Questions Dashboard (admins)   │  │
      │  │ - Content Management (admins)    │  │
      │  │ - Nice to Know (all)             │  │
      │  │ - Super Admin (create churches)  │  │
      │  └──────────────────────────────────┘  │
      │                │                        │
      │                ▼                        │
      │  ┌──────────────────────────────────┐  │
      │  │ API Layer (JavaScript)           │  │
      │  │ - auth.js (authentication)       │  │
      │  │ - api.js (database queries)      │  │
      │  │ - tenant.js (church context)     │  │
      │  │ - config.js (settings)           │  │
      │  │                                  │  │
      │  │ Every API call includes:         │  │
      │  │ - churchId filter                │  │
      │  │ - Role check                     │  │
      │  │ - Authentication check           │  │
      │  └──────────────────────────────────┘  │
      └──────────────────┬───────────────────────┘
                         │
                         ▼
                ┌─────────────────────┐
                │  Supabase Backend   │
                │                     │
                │ ┌─────────────────┐ │
                │ │ Authentication  │ │
                │ │ (Supabase Auth) │ │
                │ └─────────────────┘ │
                │                     │
                │ ┌─────────────────┐ │
                │ │ PostgreSQL DB   │ │
                │ │ (12+ tables)    │ │
                │ │                 │ │
                │ │ churches        │ │
                │ │ users           │ │
                │ │ students        │ │
                │ │ payments        │ │
                │ │ documents       │ │
                │ │ trip_memories   │ │
                │ │ events          │ │
                │ │ resources       │ │
                │ │ questions       │ │
                │ │ responses       │ │
                │ │ faqs            │ │
                │ │ content_items   │ │
                │ │ [more...]       │ │
                │ │                 │ │
                │ │ RLS Policies:   │ │
                │ │ - Church        │ │
                │ │   isolation     │ │
                │ └─────────────────┘ │
                │                     │
                │ ┌─────────────────┐ │
                │ │ Storage         │ │
                │ │ - documents/    │ │
                │ │ - trip-photos/  │ │
                │ └─────────────────┘ │
                │                     │
                └─────────────────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
         TRINITY              CROSSROADS
         CHURCH               CHURCH
         Data:                Data:
         - 3 users            - 2 users
         - 3 students         - 2 students
         - 1 admin            - 1 admin
         - 5 events           - 4 events
         - [isolated]         - [isolated]
```

These diagrams should help visualize how everything connects!
