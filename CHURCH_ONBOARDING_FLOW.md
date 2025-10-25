# Church Onboarding Flow - Complete Walkthrough

## The Scenario

Your brother (super admin) wants to add **Crossroads Church** to the WeOnAMission platform.

---

## Phase 1: Super Admin Creates Church (5 minutes)

### Step 1: Super Admin Goes to Portal
```
URL: weonamission.org/super-admin-portal.html

Your brother logs in with any admin account
(Currently: anyone logged in can access - TODO: add super admin role)
```

### Step 2: Super Admin Fills "Add New Church" Form
```
Form Fields:
├─ Church Name:    "Crossroads Church"
├─ Church Slug:    "crossroads"  ← Used in URLs
├─ Trip Name:      "Jamaica Outreach 2026"
├─ Country:        "Jamaica"
└─ Trip Year:      2026
```

### Step 3: Super Admin Clicks "Create Church"

**System Creates:**
```sql
INSERT INTO churches (id, name, slug, settings) VALUES (
  'uuid-1234-abcd-efgh',
  'Crossroads Church',
  'crossroads',
  '{
    "tripName": "Jamaica Outreach 2026",
    "country": "Jamaica",
    "tripYear": 2026,
    "primaryColor": "#1976d2",
    "secondaryColor": "#1565c0"
  }'::jsonb
);
```

### Step 4: Crossroads is Now LIVE
```
Landing page immediately shows Crossroads Church
URL available: weonamission.org/crossroads/login.html
Crossroads parents can now sign up
```

**Time elapsed: ~5 minutes**

---

## Phase 2: Crossroads Admin Gets Set Up (10-20 minutes)

### Scenario: Pastor Mark is Crossroads Church Admin

### Step 1: Your Brother Sends Pastor Mark Instructions
```
Email to Pastor Mark:
"We've set up Crossroads Church on WeOnAMission!

To get started, go here and create your admin account:
weonamission.org/crossroads/login.html

Sign up with:
- Your name
- Your email (pastor.mark@crossroadscc.org)
- A password

After signing up, we need to promote your account to admin.
I'll do that in the system and send you confirmation."
```

### Step 2: Pastor Mark Signs Up
```
1. Pastor Mark visits: weonamission.org/crossroads/login.html

2. Clicks "Sign Up" tab

3. Fills form:
   Name:     "Mark Johnson"
   Email:    "pastor.mark@crossroadscc.org"
   Password: "SecurePassword123"

4. Clicks "Sign Up"

System creates:
├─ Supabase auth user (global auth)
└─ Database user record:
   {
     id: uuid,
     email: "pastor.mark@crossroadscc.org",
     full_name: "Mark Johnson",
     role: "parent",        ← Default role for all new signups
     church_id: crossroads_uuid
   }

5. System auto-signs in Mark

6. Redirects to: /parent-portal.html?church=crossroads

7. Mark sees: Empty parent portal (no students yet)
```

### Step 3: Your Brother Promotes Pastor Mark to Admin

**✅ UPDATED: Now Uses UI Method (Super Admin Portal)**

```
1. Your brother goes to: weonamission.org/super-admin-portal.html

2. Scrolls to "Manage Church Users" section

3. Selects "Crossroads Church" from the dropdown

4. Sees table of all Crossroads users:
   ├─ pastor.mark@crossroadscc.org | Mark Johnson | Parent | [Promote to Admin]
   └─ (other users if any)

5. Clicks "Promote to Admin" button next to Pastor Mark

6. Confirms: "Promote this user to admin? They will be able to manage
   church content, events, and responses."

7. Mark is promoted instantly ✓

8. Sends confirmation email to Mark:
   "You've been promoted to admin! You can now access
   the admin portal at:
   weonamission.org/crossroads/admin-portal.html"
```

**Time for this step: < 30 seconds**

See [ADMIN_PROMOTION_GUIDE.md](ADMIN_PROMOTION_GUIDE.md) for complete documentation on the UI-based admin promotion feature.

**Previously (Before UI Method):**
- Took 5-10 minutes via SQL commands
- Required manual Supabase console access
- Error-prone (easy to get email/UUID wrong)

**Now (After UI Method):**
- Takes < 30 seconds
- One-click button in portal
- Safe with confirmation dialogs
- No database access needed

### Step 4: Pastor Mark Logs In as Admin

```
1. Mark visits: weonamission.org/crossroads/admin-portal.html

2. Auth checks: role = "admin" ✓ Allowed

3. Mark sees: Empty admin dashboard
   - 0 students
   - 0 payments
   - 0 pending documents
   - 0 pending memories

4. Mark now has access to:
   ✓ Admin Portal (/admin-portal.html?church=crossroads)
   ✓ Questions Dashboard (/questions-dashboard.html?church=crossroads)
   ✓ Content Management (/content-management.html?church=crossroads)
```

**Time elapsed: ~10-20 minutes (manual promotion is slow)**

---

## Phase 3: Church Builds Their Site (1-2 hours)

### What Pastor Mark Does First

#### STEP 1: Add Trip Details via Admin Settings (Currently Missing!)
```
Problem: We don't have a "Church Settings" page yet

Ideal flow would be:
1. Admin visits: /admin-portal.html
2. Clicks "Settings" tab
3. Fills:
   - Trip name
   - Trip dates
   - Trip cost per student
   - Trip location/description
   - Church colors/branding

Currently: These are set in churches.settings JSON when created
Next time you want to change: Contact super admin to update in database
```

#### STEP 2: Create Events (15-30 minutes)

```
Mark clicks: Admin Portal → Events Tab

Creates events like:
├─ Event 1: "Orientation Meeting"
│  ├─ Date: June 1
│  ├─ Time: 6:00 PM
│  ├─ Location: Crossroads Chapel
│  └─ Description: "Learn about the trip, get packing list"
│
├─ Event 2: "Pre-trip Training Day"
│  ├─ Date: June 8
│  ├─ Time: 9:00 AM
│  └─ Description: "Training on serving, cultural sensitivity..."
│
├─ Event 3: "Trip Departure"
│  ├─ Date: June 26
│  ├─ Time: 6:00 AM
│  └─ Location: "Crossroads Church parking lot"
│
└─ Event 4: "Trip Return"
   ├─ Date: July 5
   └─ Time: 4:00 PM

These events now show on:
├─ Student portal (when students login)
├─ Parent portal (when parents login)
└─ Home page (public, anyone can see)
```

#### STEP 3: Create Resources (15-30 minutes)

```
Mark clicks: Admin Portal → Resources Tab

Creates resources like:
├─ "Packing List"
│  ├─ Type: Document
│  ├─ Content: "What to bring to Jamaica..."
│
├─ "Preparation Guide"
│  ├─ Type: Document
│  ├─ Content: "10 things to know about Jamaica..."
│
├─ "Serving Team Roles"
│  ├─ Type: Document
│  ├─ Content: "Medical team, construction team, outreach team..."
│
└─ "Fundraising Ideas"
   ├─ Type: Document
   └─ Content: "How to fundraise $2500..."

These show on home page and parent/student portals
```

#### STEP 4: Create FAQs (20-40 minutes)

```
Mark clicks: Content Management → Create FAQ

Creates FAQs like:
├─ Q: "What is the cost?"
│  A: "The trip costs $2,500 per student. This covers..."
│
├─ Q: "What documents do I need to submit?"
│  A: "You'll need to submit: permission slip, medical form,..."
│
├─ Q: "Will there be free time?"
│  A: "Yes! We have 3 hours of free time on..."
│
├─ Q: "What's the daily schedule?"
│  A: "Wake up 6:30 AM, breakfast 7:00 AM, work until 12:30..."
│
└─ Q: "What if my student gets sick?"
   A: "We have a medical team and can call local doctors..."

These show on:
├─ Home page
├─ Student portal
├─ Parent portal
└─ "Nice to Know" page (/nice-to-know.html?church=crossroads)
```

#### STEP 5: Create Trip Memory Content (Optional)

```
Mark can optionally create content about:
├─ Trip overview/description
├─ Servant leader info
├─ History of the location
└─ Previous trip highlights

This gives students/parents context before trip starts
```

**Time for Phase 3: 1-2 hours for Mark to set everything up**

---

## Phase 4: Parents Sign Up (Ongoing, days/weeks)

### Parent Karen Signs Up

```
1. Karen hears about Crossroads mission trip

2. Karen visits: weonamission.org/
   (or weonamission.org/landing.html)

3. Landing page shows:
   - Trinity Church (Peru 2026)
   - Crossroads Church (Jamaica 2026)  ← NEW!
   - Hope Church (Mexico 2026)

4. Karen clicks "Sign Up" on Crossroads Card
   → Goes to: /login.html?church=crossroads

5. Karen clicks "Sign Up" tab

6. Karen fills:
   Name:     "Karen"
   Email:    "karen@email.com"
   Password: "MyPassword123"

7. System creates:
   {
     role: "parent",
     church_id: crossroads_uuid,
     email: "karen@email.com"
   }

8. Redirects to: /parent-portal.html?church=crossroads

9. Karen sees:
   - Empty student list
   - "Welcome to Crossroads Church mission trip"
   - Events Mark created (Orientation, Training, Departure, Return)
   - Resources Mark created (Packing List, etc.)
   - FAQs Mark created
```

### Parent Karen Adds Her Student

```
1. Karen clicks: "+ Add Student"

2. Karen fills:
   Student Name: "Jake"
   Grade: 9
   Email: "jake@email.com"
   Shirt Size: Large
   Emergency Contact: [info]

3. System creates:
   {
     full_name: "Jake",
     parent_id: karen_uuid,
     church_id: crossroads_uuid
   }

4. Karen's portal now shows:
   - Jake (student)
   - Payment status: $0 paid, owes $2500
   - Documents: Empty (none submitted yet)
   - Memories: Empty (none submitted yet)
```

---

## Phase 5: Students Can Now Log In

### Student Jake's First Login

```
1. Karen gives Jake his login info (or he receives email)
   Email: jake@email.com
   Password: [assigned by Karen or created during signup]

2. Jake visits: weonamission.org/crossroads/login.html

3. Jake signs in with email/password

4. System finds Jake's user record:
   {
     role: "student",
     church_id: crossroads_uuid,
     parent_id: karen_uuid
   }

5. Redirects to: /student-portal.html?church=crossroads

6. Jake sees:
   - Upcoming events (Orientation June 1, Training June 8, etc.)
   - Crossroads trip info
   - FAQs about the trip
   - Section to submit trip memories

7. Jake can:
   ✓ View events
   ✓ View FAQs
   ✓ View resources
   ✓ Submit trip memory (once trip starts)
   ✓ Ask questions

8. Jake CANNOT:
   ✗ See parent portal
   ✗ See admin features
   ✗ See other students' data
   ✗ See Trinity Church data
```

---

## Timeline Summary

```
Day 1 - Morning (5 min):
┌─ Super Admin creates Crossroads Church
└─ Crossroads is immediately live at /crossroads/

Day 1 - Afternoon (1-2 min):  ← MUCH FASTER NOW! (was 20 min)
┌─ Pastor Mark signs up as parent
└─ Super admin promotes Mark to admin via UI (< 30 seconds!)

Day 1 - Late Afternoon (1-2 hours):
┌─ Mark logs into admin portal
├─ Creates 4 events (Orientation, Training, Departure, Return)
├─ Creates 5 resources (Packing list, guides, etc.)
├─ Creates 10 FAQs about the trip
└─ Crossroads site is now READY for parents

Days 2-3:
┌─ Parents hear about trip
├─ Parents visit landing page
├─ Parents see Crossroads (with events, FAQs, resources visible)
├─ Parents sign up
└─ Parents see events and resources on parent portal

Days 4+:
┌─ Parents add their students
├─ Students can now log in
├─ Students see events, FAQs, resources
└─ Trip management begins

═════════════════════════════════════════════════════════════════
TOTAL TIME: ~2 hours from church creation to site ready for parents
(Previously: ~2.5 hours due to manual SQL admin promotion)
═════════════════════════════════════════════════════════════════
```

---

## The Complete Crossroads Workflow Diagram

```
SUPER ADMIN (Your Brother)
        │
        ├─→ Create Crossroads Church
        │   (5 min)
        │
        └─→ Crossroads is LIVE at /crossroads/
                │
                │
        PASTOR MARK (Admin)
                │
                ├─→ Signs up as parent
                │   (2 min)
                │
                ├─→ Your brother promotes to admin via UI
                │   (< 30 seconds!)  ✅ MUCH FASTER
                │
                ├─→ Logs into admin portal
                │   (1 sec)
                │
                ├─→ Creates events (15-30 min)
                │   - Orientation
                │   - Training
                │   - Departure
                │   - Return
                │
                ├─→ Creates resources (15-30 min)
                │   - Packing list
                │   - Guides
                │   - Role descriptions
                │
                ├─→ Creates FAQs (20-40 min)
                │   - What is cost?
                │   - What documents?
                │   - What's schedule?
                │
                └─→ Crossroads site is COMPLETE
                        │
                        │
        PARENTS (Karen, etc.)
                        │
                        ├─→ Visit landing page
                        │   (See Crossroads listed!)
                        │
                        ├─→ Click "Sign Up" on Crossroads
                        │
                        ├─→ Sign up as parent
                        │
                        ├─→ See events, FAQs, resources
                        │
                        └─→ Add their students
                                │
                                │
        STUDENTS (Jake, etc.)
                                │
                                ├─→ Receive login from parent
                                │
                                ├─→ Log in to student portal
                                │
                                └─→ See events, FAQs, resources
                                   Can submit memories later
```

---

## Critical Understanding

### What's Automated:
✅ Church creation (clicks one button)
✅ Events appear on student/parent portals (automatically)
✅ FAQs appear on home page (automatically)
✅ Resources appear everywhere (automatically)
✅ Parent signup (email + password)
✅ Student creation (parent adds them)
✅ Data isolation (automatic via church_id)

### What Requires Manual Work:
❌ Promoting admin (SQL command - TODO: add UI)
❌ Creating events (admin has to fill form)
❌ Creating resources (admin has to create)
❌ Creating FAQs (admin has to type answers)
❌ Emailing parents signup link (manual process)
❌ Setting up payment tracking (optional, happens as parents submit)

### What's Missing:
❌ Church settings UI (currently just in database)
❌ Admin creation UI (can't create admin from UI, need SQL)
❌ Email invitations (no automated emails to parents yet)
❌ Admin role enforcement (anyone can access super-admin-portal)
❌ Phone/SMS reminders (would be nice to have)

---

## Current Bottleneck: Admin Promotion

### The Problem:
```
After Mark signs up as parent, he needs to be promoted to admin.

Current solution: SQL command
  UPDATE users SET role = 'admin'
  WHERE email = 'pastor.mark@crossroadscc.org'

This requires:
1. Your brother to have SQL access
2. Your brother to know Mark's exact email
3. Your brother to manually run SQL command
4. Wait time: ~10 minutes (manual step)

This is slow and error-prone.
```

### The Solution (TODO Feature):
```
Better solution: UI feature

Super admin portal should have tab:
"Manage Church Users"

For each church:
  Show list of users
  Show "Promote to Admin" button next to user
  Click button → role changes to admin
  User immediately has admin access
  No SQL needed
  Takes 30 seconds

This would save ~10 minutes per church onboarding.
```

---

## What Your Brother Actually Does

### Day 1: Create Church
```
1. Go to super-admin-portal.html
2. Click "Add Church"
3. Fill form (2 min)
4. Click save
5. Send email to new church admin with signup link
```

### Day 1: Promote Admin
```
1. Wait for church admin to sign up (he knows his own email)
2. Go to Supabase console
3. Run SQL update (2 min)
4. Send email saying "You're now admin!"
```

### Church Admin Does Setup
```
Mark (the admin) does the rest:
- Create events (30 min)
- Create resources (30 min)
- Create FAQs (40 min)
- Total: 1-2 hours
```

### Parents Sign Up Automatically
```
Parents find the church via landing page
Parents self-serve sign up
No manual intervention needed
```

---

## The End-to-End Experience

### From Super Admin's Perspective:
```
"I create a church in 5 minutes.
The church admin signs up.
I promote them to admin in the database.
They spend 1-2 hours setting up events, FAQs, resources.
Parents can now sign up and see everything.
Done!"
```

### From Church Admin's Perspective:
```
"I sign up for the platform.
I get promoted to admin.
I see a dashboard with everything I need.
I spend 1-2 hours entering events, FAQs, resources.
Parents can now see my trip information.
Easy!"
```

### From Parent's Perspective:
```
"I visit the website.
I see my church's trip listed.
I click sign up.
I see events, FAQs, packing lists - all ready to go.
I add my student.
I track documents and payments.
Everything I need is here!"
```

### From Student's Perspective:
```
"My parent gave me a login.
I sign in.
I see the trip events and details.
I can submit trip memories.
I can ask questions.
Simple and straightforward!"
```

---

## Ready to Go Live?

When ready to launch, your brother would:

1. **Have you set up your Vercel deployment**
   - Push code to GitHub
   - Connect to Vercel
   - Set environment variables

2. **Buy domain and point to Vercel**
   - weonamission.org → Vercel

3. **Start onboarding churches**
   - Create church (5 min)
   - Church admin signs up (5 min)
   - Promote to admin (< 30 seconds!)  ✅ IMPROVED
   - Admin sets up content (1-2 hours)
   - Parents sign up (automated)
   - Profit! 💰

Each church takes about 2 hours of work (mostly admin setup, not super admin work).
(Previously: 2-2.5 hours due to manual SQL admin promotion)

---

## Summary

**After super admin creates a church:**

1. **Immediately**: Church is live, parents can see it on landing page
2. **Within 1 minute**: Admin is promoted via UI button and can access admin portal
3. **Within 1-2 hours**: Admin creates events, FAQs, resources
4. **Within days/weeks**: Parents sign up and add students
5. **At trip time**: Students can log in and participate

**The key insight**: Most of the work is done by the individual church admin, not the super admin. Super admin just creates the church and promotes the admin via a one-click button. Everything else is self-service.

**Recent Improvement**: Admin promotion was moved from manual SQL commands (5-10 min per promotion) to a one-click UI button (< 30 seconds). This cuts overall onboarding time by ~15-20 minutes per church!
