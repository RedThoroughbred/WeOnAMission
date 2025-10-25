# Interactive Testing Walkthrough - WeOnAMission

## Overview

This guide walks through the **entire user journey** with concrete examples, test accounts, and step-by-step instructions. You can follow along with your local instance running at `http://localhost:8000`.

---

## Part 1: Understanding the Site Structure

### Where You Are Right Now

You're viewing **landing.html** - the public-facing homepage that lists all churches.

**What you see:**
- "WeOnAMission" header
- Introduction section explaining the platform
- Grid of church cards (currently only Trinity is configured)
- Each card shows: Church name, trip destination, dates, trip cost
- Login and Sign Up buttons on each card

### The 10 Pages (and who sees them)

| Page | Who Sees It | Purpose |
|------|----------|---------|
| **landing.html** | Everyone (public) | Browse churches, pick which church to access |
| **login.html** | Authenticated users | Email/password login |
| **index.html** | All authenticated users | Church home page (events, FAQs, resources) |
| **parent-portal.html** | Parents & Admins | Manage students, track payments, upload documents, ask questions |
| **admin-portal.html** | Admins only | Approve documents, create events, respond to questions, manage FAQs |
| **student-portal.html** | Students only | View events, submit trip memories/photos |
| **questions-dashboard.html** | Admins only | Dashboard for answering parent questions |
| **content-management.html** | Admins only | Manage FAQs and public content |
| **nice-to-know.html** | Everyone logged in | Public FAQ viewer, helpful resources |
| **super-admin-portal.html** | Super-admins only | Create churches, promote users to admin |

---

## Part 2: Test Flow (Complete Journey)

### Phase A: Sign Up as a New Parent

#### Step 1: Create Account
1. Go to `http://localhost:8000` (landing page)
2. Click "Sign Up" on the Trinity card
3. You're now at `login.html?church=trinity` signup form

4. Fill in:
   - Email: `parent1@test.com`
   - Password: `TestPassword123!`
   - Full Name: `John Parent`
   - Confirm password

5. Click "Sign Up"

**Expected result:**
- Account created in Supabase
- User profile created with `role: 'parent'`
- Automatically logged in
- Redirected to parent portal (`parent-portal.html?church=trinity`)

#### What happened behind the scenes:
1. Auth.js called `API.signUp(email, password, fullName)`
2. Supabase auth.signUp() created auth user
3. Database trigger created user profile with `church_id: trinity` (auto-detected from URL)
4. You're now authenticated with Supabase session token

---

### Phase B: Parent Portal Tour

**You should now see:** Parent portal with tabs for Students, Payments, Documents, Memories, Questions

#### 1. Add a Student

1. Click "Students" tab (if not already there)
2. Click "Add Student" button
3. Fill in student info:
   - Full Name: `Alice Johnson`
   - Grade: `10`
   - Date of Birth: `2009-05-15`
   - Emergency Contact: `Jane Johnson`
   - Emergency Phone: `555-1234`
   - Medical Info: `None`
   - Allergies: `Peanuts`
   - Dietary: `Vegetarian`

4. Click "Add Student"

**Expected result:**
- Student card appears in Students tab
- Shows payment status (Pending - needs to pay)
- Shows balance due ($2,500)

**Testing what's secure here:**
- The student is linked to `parent_id: current user`
- The student has `church_id: trinity` (multi-tenant isolation)
- Switch churches → you can't see this student (proves isolation)

---

#### 2. Upload a Document

1. In parent portal, click "Documents" tab
2. Select student "Alice Johnson" from dropdown
3. Select document type: "Passport"
4. Click "Choose File" and select any file from your computer (even a text file)
5. Click "Upload Document"

**Expected result:**
- Document appears in Documents section with status "Pending"
- Admin will need to approve it

**What's happening:**
- File uploaded to Supabase Storage (bucket: `documents`)
- File path stored as: `{studentId}/{timestamp}_{filename}`
- Database record created with `church_id: trinity`

---

#### 3. Record a Payment

1. Click "Payments" tab
2. Select student "Alice Johnson"
3. Enter amount: `500`
4. Enter date: Today's date
5. Payment type: `Check`
6. Notes: `First deposit`
7. Click "Add Payment"

**Expected result:**
- Payment appears in list
- Balance due updated to $2,000
- Payment status may change to "Partial" (showing they've started paying)

---

#### 4. Ask a Question

1. Click "Questions" tab
2. Click "Submit New Question"
3. Enter:
   - Subject: `What should Alice bring on the trip?`
   - Question: `Is there a packing list available? Alice is unsure what to bring.`
4. Click "Submit"

**Expected result:**
- Question submitted successfully
- Shows in your questions list with status "Pending"
- Admin will see it in their questions dashboard

---

### Phase C: Test Admin Functionality

#### Step 1: Promote Yourself to Admin

Currently, you're a parent. To test admin features, you need to promote yourself. Here's how:

**Option A: Via Super-Admin Portal (Best)**
1. Open **new browser** or **private window**
2. Go to `http://localhost:8000`
3. Sign up new account with email: `superadmin@test.com`
4. Go directly to: `http://localhost:8000/super-admin-portal.html?church=trinity`

**This should work because:**
- In a real system, your church leader would set you up as super-admin first
- For testing, you can access it, and the first super-admin can promote others

**Once in super-admin portal:**
1. Select "Manage Church Users" section
2. Under "Church Selection," pick "Trinity"
3. Click "Load Users"
4. Find your `parent1@test.com` account
5. Click "Promote to Admin" button
6. Confirm the dialog

**After promotion:**
1. Log out (click Logout button)
2. Log back in as `parent1@test.com`
3. You should now see admin features

**Option B: Direct Database Update (Technical)**
```sql
UPDATE users
SET role = 'admin'
WHERE email = 'parent1@test.com'
AND church_id = 'trinity-id-uuid';
```

---

#### Step 2: Admin Portal Tour

After promotion, log back in and go to `http://localhost:8000/admin-portal.html?church=trinity`

**You should see 6 tabs:**

##### Tab 1: Students
- Lists all students in Trinity church
- Shows: Name, Grade, Parent, Payment Status, Medical Info
- You see ALL students (parents only see their own)

##### Tab 2: Payments
- See all payment records
- Add payments on behalf of parents
- Track which students have paid

##### Tab 3: Documents
- See all uploaded documents
- Status: Pending, Approved, Rejected
- **ACTION:** Click on a pending document → you can now approve/reject it!

1. Click "Approve" on Alice's passport
2. Document status changes to "Approved"
3. Parent gets approval feedback

##### Tab 4: Memories
- Trip memories (photos/notes) submitted by students
- Approve or reject after the trip
- Currently no submissions (test this after student portal)

##### Tab 5: Events
- Create trip events/meetings
- Try adding one:
  1. Click "Create New Event"
  2. Name: `Pre-Trip Meeting`
  3. Date: `2025-12-01`
  4. Time: `19:00`
  5. Type: `meeting`
  6. Location: `Church Fellowship Hall`
  7. Description: `Prepare students for the journey`
  8. Click "Create Event"

##### Tab 6: Resources
- Add helpful resources (links, documents, guides)
- Try adding one:
  1. Click "Add Resource"
  2. Title: `What to Pack`
  3. Type: `guide`
  4. URL: `https://example.com/packing-guide` (any URL works)
  5. Click "Add Resource"

---

### Phase D: Questions Dashboard (Admin)

#### Step 1: Answer a Question

1. Go to `http://localhost:8000/questions-dashboard.html?church=trinity`
2. You should see the question you submitted earlier: "What should Alice bring?"
3. Click on it to expand
4. Type response: `Great question! Here's our packing list: [details]`
5. Click "Submit Response"

**Expected result:**
- Question status changes to "Complete"
- Parent can see the response in their portal

---

### Phase E: Content Management (Admin)

1. Go to `http://localhost:8000/content-management.html?church=trinity`
2. Click "Create New FAQ"
3. Enter:
   - Question: `When do we depart?`
   - Answer: `We depart June 26, 2026 at 6:00 AM from First Baptist Church`
4. Click "Create FAQ"

**Expected result:**
- FAQ appears in the list
- Will be visible to all users at `nice-to-know.html`

---

### Phase F: Student Portal

#### Step 1: Create a Student Login

You need a student account to test this. Create it like this:

1. Open new browser/private window
2. Go to `http://localhost:8000`
3. Sign up with: `student1@test.com`
4. Name: `Alice Johnson` (match the student we created)

But here's the issue: **This student isn't linked to the parent's family yet.**

**In a real system:**
- Parents add students with their basic info
- Students sign up with their email
- System links them together
- This requires a matching mechanism (not currently implemented)

**For now, just test with:**
- Parent account that also goes to student portal
- It will show: "No students found"
- That's okay - demonstrates the role system works

---

### Phase G: Public Pages (Everyone)

#### Step 1: Nice to Know (FAQs)
1. Go to `http://localhost:8000/nice-to-know.html?church=trinity`
2. You should see the FAQ you created as admin
3. All users (logged in) can see this

#### Step 2: Home Page
1. Go to `http://localhost:8000/index.html?church=trinity`
2. Shows events, FAQs, resources created by admins
3. This is the public/logged-in user view

---

## Part 3: Multi-Tenant Testing (The Critical Security Test)

### Test 1: Verify You Can't See Other Churches' Data

#### Setup
1. You have Trinity data (students, payments, etc.)
2. Check that you can't see other churches

#### Test
1. Manually change URL parameter: `?church=crossroads`
2. Go to: `http://localhost:8000/parent-portal.html?church=crossroads`
3. Click "Load Students"

**Expected result:**
- No students shown
- OR error message (depends on implementation)
- Definitely NOT Alice's data (that would be a security breach!)

**Why this works:**
- API checks: `eq('church_id', churchId)`
- Supabase filters the query
- Can't access other churches' data

---

### Test 2: Verify Admin Can Only Manage Their Church

1. As Trinity admin, try to access: `http://localhost:8000/admin-portal.html?church=crossroads`
2. Attempt to load students from Crossroads
3. Should fail (not authorized for that church)

---

## Part 4: Edge Cases to Test

### Test 1: What happens with bad/missing data?

1. Try uploading a document with no file selected
   - Should show error

2. Try adding student with no name
   - Should show validation error

3. Try paying with amount of 0 or negative
   - Should show validation error or prevent

### Test 2: Authentication

1. Sign up with weak password (less than 8 characters)
   - Should be rejected by Supabase

2. Sign up with same email twice
   - Should show "User already registered"

3. Sign out and try to access admin portal
   - Should redirect to login

### Test 3: File Uploads

1. Try uploading a very large file
   - Should either upload slowly or fail with message

2. Upload a file, log in as different church
   - New church can't see the file

3. Upload multiple files for same student
   - All should be listed

---

## Part 5: Checklist for Complete Testing

### User Signup & Authentication
- [ ] Sign up as parent - success
- [ ] Sign up with duplicate email - fails
- [ ] Log in - works
- [ ] Log out - works
- [ ] Session persists on page refresh
- [ ] Cannot access admin pages without login

### Parent Portal Features
- [ ] Add student - appears in list
- [ ] Upload document - shows in documents
- [ ] Add payment - balance updates
- [ ] Ask question - appears in parent's questions

### Admin Features
- [ ] Approve/reject documents - status updates
- [ ] Create event - appears in calendar
- [ ] Add resource - visible to parents
- [ ] Respond to question - appears in parent portal
- [ ] Create FAQ - appears in "Nice to Know"

### Multi-Tenant Isolation
- [ ] Trinity data not visible in Crossroads
- [ ] Admin of one church can't modify another's data
- [ ] Students see only their own data
- [ ] Payments isolated by church

### Mobile Responsiveness
- [ ] Test on phone size (use browser dev tools)
- [ ] All buttons clickable
- [ ] No horizontal scroll
- [ ] Text readable on small screens

### Cross-Browser
- [ ] Chrome - works
- [ ] Firefox - works
- [ ] Safari - works
- [ ] Edge - works

---

## Part 6: Troubleshooting Common Issues

### Issue: "Cannot read property of undefined"

**Cause:** Usually missing church context
**Solution:** Make sure URL has `?church=trinity` or `?church=crossroads`

### Issue: Buttons don't work, nothing happens

**Cause:** Check browser console for errors
**Solution:**
1. Right-click → Inspect → Console tab
2. Look for red error messages
3. Screenshot the error and troubleshoot

### Issue: Data not saving

**Cause:** Supabase connection problem
**Solution:**
1. Check config.js is loaded: Open browser console → type `CONFIG`
2. Verify Supabase URL and key are correct
3. Check Supabase storage buckets exist

### Issue: "You do not have permission"

**Expected behavior:** This means your role doesn't allow the action
- Parents can't approve documents (admins only)
- Students can't create events (admins only)
- This is working correctly!

---

## Part 7: Test Data Cleanup

After testing, you might want to clean up test data:

```sql
-- Delete test users
DELETE FROM users WHERE email LIKE '%@test.com';

-- Delete test students
DELETE FROM students WHERE parent_id IN (
    SELECT id FROM users WHERE email LIKE '%@test.com'
);

-- This cascades and deletes payments, documents, etc.
```

Or just start fresh with a new Supabase project.

---

## Next Steps

Once you've completed this walkthrough:

1. ✅ You understand all 10 pages and their purposes
2. ✅ You can navigate between roles (parent → admin)
3. ✅ You know how multi-tenancy works
4. ✅ You've tested core features
5. Ready to review the UI and discuss improvements!

---

## Questions?

If something doesn't work as described here, it might be a bug! Document it:

1. **What you did:** Step-by-step reproduction
2. **What you expected:** What should have happened
3. **What actually happened:** What did happen instead
4. **Error messages:** Any console errors?
5. **Browser:** Chrome/Firefox/Safari version?

This helps identify and fix issues quickly.
