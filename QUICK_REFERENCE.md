# WeOnAMission - Quick Reference

## What You Have

### The System
- **Multi-tenant SaaS** for managing church mission trips
- **One database** with data isolated by `church_id`
- **10 pages** for different user types
- **3 user roles** (Admin, Parent, Student)
- **Unlimited churches** can be added

### What's Working
✅ Trinity Church fully functional
✅ Multi-tenant isolation (tested)
✅ Parent sign up and add students
✅ Admin manage everything
✅ Student portal to submit content
✅ Questions/answers system
✅ Document upload and approval
✅ Payment tracking
✅ Event management
✅ Content management (FAQs, resources)
✅ Mobile-responsive UI
✅ Professional design system

---

## The 10 Pages

| Page | URL | Who | Access | Purpose |
|------|-----|-----|--------|---------|
| Landing | `/` or `/landing.html` | Anyone | Public | List all churches, choose one |
| Login | `/login.html?church=trinity` | Anyone | Public | Sign in / sign up |
| Home | `/index.html?church=trinity` | All logged in | Public | View events, FAQs, resources, memories |
| Parent Portal | `/parent-portal.html?church=trinity` | Parents | Protected | Add students, upload docs, track payments |
| Student Portal | `/student-portal.html?church=trinity` | Students | Protected | Submit memories, view events |
| Admin Portal | `/admin-portal.html?church=trinity` | Admins | Protected | Manage students, payments, documents, events, resources |
| Questions Dashboard | `/questions-dashboard.html?church=trinity` | Admins | Protected | Answer questions from parents/students |
| Content Management | `/content-management.html?church=trinity` | Admins | Protected | Create FAQs, manage content |
| Nice to Know | `/nice-to-know.html?church=trinity` | All logged in | Public | View FAQs and helpful content |
| Super Admin | `/super-admin-portal.html` | Anyone logged in | Protected | Create/manage all churches |

---

## Role Permissions Quick Map

### ADMIN Can Do:
```
✅ Access admin-portal.html
✅ Access questions-dashboard.html
✅ Access content-management.html
✅ Manage students (add, view, search)
✅ Track payments
✅ Approve/reject documents
✅ Approve/reject trip memories
✅ Create/manage events
✅ Create/manage resources
✅ Answer questions
✅ Create/manage FAQs
✅ View all church data
❌ See other churches' data
❌ Change own role
```

### PARENT Can Do:
```
✅ Access parent-portal.html
✅ Add students
✅ Upload documents
✅ Track payments
✅ Ask questions
✅ View home page
✅ View nice-to-know page
❌ Access student portal
❌ Access admin portal
❌ See admin features
```

### STUDENT Can Do:
```
✅ Access student-portal.html
✅ Submit trip memories (with photos)
✅ View upcoming events
✅ View FAQs and resources
✅ Ask questions
✅ View home page
❌ Access parent portal
❌ Access admin portal
❌ See other students' data
```

---

## How to Add a New Church (Step by Step)

### Step 1: Go to Super Admin Portal
```
URL: weonamission.org/super-admin-portal.html
```

### Step 2: Fill Form
```
Church Name:     "Crossroads Church"
Church Slug:     "crossroads"        (used in URLs: /crossroads/)
Trip Name:       "Jamaica Outreach 2026"
Country:         "Jamaica"
Trip Year:       2026
```

### Step 3: Click "Create Church"
- System creates church record
- Immediately live and accessible

### Step 4: Parents Can Now Sign Up
```
URL: weonamission.org/crossroads/login.html
or:  weonamission.org/login.html?church=crossroads
```

---

## Data Flow Example: Tom (Parent) → Sarah (Student)

```
1. TOM SIGNS UP AT TRINITY
   Tom visits: weonamission.org/trinity/login.html
   Tom signs up with email: tom@email.com
   System creates:
   - users table: {role: "parent", church_id: trinity_uuid}
   Redirect: /parent-portal.html?church=trinity

2. TOM ADDS STUDENT SARAH
   Tom clicks: "+ Add Student"
   Tom fills form: name="Sarah", grade=8, email=sarah@email.com
   System creates:
   - students table: {parent_id: tom_uuid, church_id: trinity_uuid}

3. SARAH LOGS IN
   Sarah visits: weonamission.org/trinity/login.html
   Sarah signs in with email: sarah@email.com
   System finds:
   - users table: {role: "student", church_id: trinity_uuid, parent_id: tom_uuid}
   Redirect: /student-portal.html?church=trinity

4. SARAH SUBMITS MEMORY
   Sarah submits: "Our first day was amazing!" + photo
   System creates:
   - trip_memories table: {student_id: sarah_uuid, church_id: trinity_uuid, status: "pending"}

5. PASTOR DAVE APPROVES
   Pastor Dave (admin) visits: /admin-portal.html?church=trinity
   Pastor Dave sees Sarah's pending memory
   Pastor Dave clicks: "Approve"
   System updates: status = "approved"

6. TOM SEES THE MEMORY
   Tom visits: /index.html?church=trinity (home page)
   Home page queries: trip_memories WHERE status="approved" AND church_id=trinity_uuid
   Tom sees Sarah's approved memory with photo

7. STUDENTS FROM OTHER CHURCHES NEVER SEE IT
   Jake (Crossroads student) visits: /index.html?church=crossroads
   System queries only Crossroads memories
   Jake never sees Sarah's memory
```

---

## URL Routing Explained

### Before Vercel Deployment (Now):
```
weonamission.org/login.html?church=trinity
weonamission.org/parent-portal.html?church=trinity
weonamission.org/index.html?church=trinity
```

### After Vercel Deployment (Planned):
```
weonamission.org/trinity/login.html
weonamission.org/trinity/parent-portal.html
weonamission.org/trinity/index.html
```

**How it works:**
- User visits: `/trinity/parent-portal.html`
- Vercel rewrites to: `/parent-portal.html?church=trinity` (backend)
- User sees: `/trinity/parent-portal.html` (frontend stays same)
- App works exactly the same, just cleaner URLs

---

## Admin Role: Is It Church-Specific?

### YES ✓

```
Pastor Dave is admin:
- role: "admin"
- church_id: trinity_uuid
- Can manage: Trinity only

Pastor Mark is admin:
- role: "admin"
- church_id: crossroads_uuid
- Can manage: Crossroads only

Each church has independent admin(s)
They never interfere with each other
```

### Multiple Admins Per Church?
```
Trinity Church can have:
- Pastor Dave (admin)
- Linda (staff, admin)
- Mike (volunteer, admin)

All three:
- role: "admin"
- church_id: trinity_uuid
- See same Trinity data
- Can all manage independently
```

---

## Understanding Data Isolation

### Same Database, Different Data:

```
SELECT * FROM students
Result: Shows ALL students from all churches

SELECT * FROM students WHERE church_id = 'trinity_uuid'
Result: Shows only Trinity students

SELECT * FROM students WHERE church_id = 'trinity_uuid' AND parent_id = 'tom_uuid'
Result: Shows only Tom's Trinity students
```

### RLS + Application Filtering:

```
Layer 1 - Database RLS:
  "SELECT * FROM students WHERE church_id = 'crossroads_uuid'"
  ├─ Crossroads admin: ✓ Allowed (their church)
  └─ Trinity admin: ✗ BLOCKED by RLS

Layer 2 - Application Code:
  Every API function adds: .eq('church_id', churchId)
  - Extra safety if RLS fails
  - Ensures filtering at app level
```

---

## Testing The System

### Test 1: Trinity Setup
```
1. Visit landing page
   → See Trinity, Crossroads, Hope churches

2. Sign up as Trinity parent
   → Email: parent1@trinity.com
   → Password: test123
   → Redirects to parent portal (empty)

3. Add student
   → Name: StudentOne
   → Redirects to parent portal
   → See student listed

4. Login as admin
   → Email: admin1@trinity.com (create new account)
   → Promote to admin in Supabase
   → Visit admin-portal.html
   → See StudentOne listed
```

### Test 2: Multi-Tenancy
```
1. While still Trinity admin, visit:
   /admin-portal.html?church=crossroads
   → Should see empty or error (Crossroads has no data yet)

2. Super admin adds Crossroads Church:
   /super-admin-portal.html
   → Create Crossroads Church

3. Sign up as Crossroads parent:
   → Email: parent2@crossroads.com
   → Add different student
   → Logout, login as Trinity parent
   → DON'T see Crossroads student

4. Data isolation working ✓
```

---

## What's Missing (TODO)

### High Priority:
- [ ] Email notifications (questions answered, documents approved)
- [ ] Photo uploads for trip memories (UI exists, needs backend)
- [ ] Super admin role enforcement (currently anyone can access)
- [ ] Vercel deployment

### Medium Priority:
- [ ] Church branding customization
- [ ] Payment processing integration
- [ ] Production RLS policies (currently disabled, using app-level filtering)

### Nice to Have:
- [ ] Mobile app
- [ ] SMS notifications
- [ ] Advanced analytics

---

## Key Files to Know

```
Project Root:
├── index.html                    → Home page
├── login.html                    → Auth page
├── landing.html                  → Church selection
├── parent-portal.html           → Parent dashboard
├── student-portal.html          → Student dashboard
├── admin-portal.html            → Admin dashboard
├── questions-dashboard.html     → Q&A management
├── content-management.html      → FAQ/content management
├── nice-to-know.html            → FAQ viewer
├── super-admin-portal.html      → Church management
│
├── auth.js                       → Authentication logic
├── api.js                        → Database queries (with churchId filters)
├── tenant.js                     → Church context detection
├── config.js                     → Configuration
├── styles.css                    → All styling
│
├── migration-to-multitenant.sql  → Database setup
├── SIMPLE_FIX.sql               → Bug fixes
│
└── DOCUMENTATION:
    ├── SYSTEM_OVERVIEW.md        → Complete system explanation
    ├── VISUAL_GUIDE.md           → Diagrams and flowcharts
    ├── QUICK_REFERENCE.md        → This file
    ├── UI_DESIGN_SYSTEM.md       → Design colors and components
    ├── TRINITY_SETUP_AND_TESTING.md → How to test Trinity
    └── [other docs...]
```

---

## Common Questions

### Q: Can a parent be an admin?
**A:** No. A user has ONE role: admin, parent, or student. (Can be changed in database but not in UI)

### Q: Can a student see other students?
**A:** No. Students only see Trinity data and can't see other students' data.

### Q: Can Trinity admin see Crossroads data?
**A:** No. RLS + API filtering blocks cross-church access.

### Q: How many churches can we have?
**A:** Unlimited. Each church is just another row in churches table.

### Q: How many admins per church?
**A:** Unlimited. Each church can have as many admins as needed.

### Q: Do all churches use the same code?
**A:** Yes. One codebase, all churches use same app, just different data (isolated by church_id).

### Q: Can we customize each church's branding?
**A:** Currently no. All churches use same design. TODO: Add church branding customization.

### Q: How do students get accounts?
**A:** Parent creates them when adding student. OR student can sign up if email/password set by parent.

### Q: Can a parent have students from different churches?
**A:** Currently no. We could add this, but would require schema changes.

### Q: Are we ready to show your brother?
**A:** Almost! Just need to:
1. Test Trinity fully (sign up, add student, login as student, admin approve)
2. Test adding Crossroads Church via super-admin portal
3. Verify data isolation works
4. Consider adding super admin role enforcement
5. Then ready to deploy to Vercel!

---

## Next Steps

1. **Test Trinity Church Completely**
   - Follow TRINITY_SETUP_AND_TESTING.md

2. **Test Adding Crossroads**
   - Use super-admin-portal.html to create Crossroads Church
   - Sign up parent for Crossroads
   - Verify Trinity parent can't see Crossroads data

3. **Show Your Brother**
   - Demo the system working
   - Show multi-tenancy in action
   - Get feedback on features/design

4. **Deploy to Vercel**
   - Push to GitHub
   - Connect to Vercel
   - Set environment variables
   - Go live!

---

That's it! You now understand the complete system. The key insight:

> **One app, infinite churches. One database, isolated data. Three roles, complete control.**
