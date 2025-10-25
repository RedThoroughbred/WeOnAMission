# Comprehensive Testing Guide - All User Roles & Churches

## Overview

This guide walks you through testing every aspect of WeOnAMission with all user roles and multiple churches. It's designed to simulate real-world usage and verify everything works correctly.

**Estimated Time**: 2-3 hours for complete testing
**Best Done**: With at least 2-3 people testing simultaneously

---

## Test Environment Setup

### Prerequisites

1. **Running locally**: `python -m http.server 8000` from project directory
2. **Supabase connected**: Config.js has valid credentials
3. **Database**: SIMPLE_FIX.sql has been run
4. **Fresh test data**: Optional - delete old test data first

### Suggested Email Addresses for Testing

```
SUPER ADMIN:
- admin@weonamission.org  (role: admin at platform level)

TRINITY CHURCH ADMINS:
- pastor.dave@trinity.org  (role: admin for Trinity)
- associate@trinity.org    (role: admin for Trinity)

TRINITY PARENTS:
- parent.tom@trinity.org    (Tom - adds students)
- parent.lisa@trinity.org   (Lisa - adds students)
- parent.mike@trinity.org   (Mike - adds students)

TRINITY STUDENTS:
- Will be created by parents
- Or manually create: student.sarah@trinity.org, student.john@trinity.org

CROSSROADS CHURCH ADMINS:
- pastor.mark@crossroads.org  (role: admin for Crossroads)

CROSSROADS PARENTS:
- parent.karen@crossroads.org  (Karen)
- parent.david@crossroads.org  (David)

CROSSROADS STUDENTS:
- Will be created by parents
```

---

## Part 1: Super Admin Testing (30 minutes)

### Test 1.1: Access Super Admin Portal

**Goal**: Verify super admin can create churches and manage users

```
1. Go to: http://localhost:8000/super-admin-portal.html
2. You should be redirected to login (if not already logged in)
3. Sign up / Login with: admin@weonamission.org
4. Should see: Super Admin Dashboard
   - Total Churches: (count them)
   - Total Users: (count them)
   - Add New Church form
   - Manage Churches table
   - Manage Church Users section
```

**Success Criteria:**
- ✅ Can access super admin portal
- ✅ Can see churches list
- ✅ Can see users list
- ✅ "Manage Church Users" section visible

### Test 1.2: Create Crossroads Church

**Goal**: Test adding a new church (Trinity already exists)

```
1. In Super Admin Portal, find "Add New Church" form
2. Fill in:
   - Church Name: "Crossroads Church"
   - Church Slug: "crossroads"
   - Trip Name: "Jamaica Outreach 2026"
   - Country: "Jamaica"
   - Trip Year: 2026
3. Click: "Create Church"
4. Should see: Success alert "Church created successfully!"
5. Refresh page (Ctrl+R)
6. Verify: Crossroads now appears in churches table
```

**Success Criteria:**
- ✅ Can fill out form
- ✅ Success message appears
- ✅ Crossroads listed in churches table
- ✅ Church appears in dropdown on landing page

### Test 1.3: Test Admin Promotion System

**Goal**: Verify one-click promotion of users to admin

```
PART A: Promote Trinity Admin
1. In Super Admin Portal
2. Go to: "Manage Church Users" section
3. Select from dropdown: "Trinity Church"
4. Wait for users table to load
5. Look for: pastor.dave@trinity.org (should show role: "Parent")
6. Click: "Promote to Admin" button
7. Confirm: "Promote this user to admin?"
8. Success alert should appear
9. Refresh users table
10. Verify: pastor.dave now shows role: "Admin" (blue badge)
11. Button should now say: "Demote to Parent"

PART B: Promote Crossroads Admin
1. Select from dropdown: "Crossroads Church"
2. Look for: pastor.mark@crossroads.org (or create account first)
3. Click: "Promote to Admin"
4. Confirm
5. Verify: promoted successfully

PART C: Test Demotion
1. Still looking at Crossroads
2. Find: pastor.mark@crossroads.org (now showing "Admin")
3. Click: "Demote to Parent"
4. Confirm
5. Verify: pastor.mark now shows "Parent" again
6. Re-promote to "Admin" for next tests
```

**Success Criteria:**
- ✅ Can select church from dropdown
- ✅ Users table loads and shows correct users
- ✅ Can click "Promote to Admin"
- ✅ Role changes instantly in table
- ✅ Can demote back to parent
- ✅ Confirmation dialogs work correctly

---

## Part 2: Parent Testing (45 minutes)

### Test 2.1: Parent Signs Up for Trinity

**Goal**: Verify parents can sign up and get church context

```
1. Go to: http://localhost:8000/landing.html
2. You should see: List of churches (Trinity, Crossroads, etc.)
3. Find: Trinity Church card
4. Click: "Sign Up" button on Trinity card
5. Should redirect to: login.html?church=trinity&signup=true
6. Fill signup form:
   - Name: "Tom Smith"
   - Email: "parent.tom@trinity.org"
   - Password: "TestPassword123"
7. Click: "Sign Up"
8. Should redirect to: parent-portal.html?church=trinity
9. Header should show: "Trinity Church" or "Parent Portal"
10. Should see: Your Name (Tom Smith) in top right
```

**Success Criteria:**
- ✅ Can access landing page
- ✅ Trinity Church visible
- ✅ Sign up redirects to correct login page
- ✅ Form submits successfully
- ✅ Redirects to parent portal
- ✅ Shows correct church name
- ✅ Shows user name in header

### Test 2.2: Parent Adds Students

**Goal**: Test student registration from parent portal

```
1. Logged in as parent (Tom)
2. In parent portal, find "Students" or student management section
3. Click: "Add Student" button
4. Fill form:
   - Full Name: "Sarah Smith"
   - Grade: "10"
   - Date of Birth: "2009-06-15"
   - Emergency Contact: "Mom" (or parent's name)
   - Emergency Phone: "555-1234"
5. Click: "Add Student"
6. Success message should appear
7. Sarah should appear in students list
8. Repeat: Add another student "John Smith"
```

**Success Criteria:**
- ✅ Can see "Add Student" button
- ✅ Form fills and submits
- ✅ Student appears in list
- ✅ Can add multiple students
- ✅ Students show in table with their info

### Test 2.3: Parent Uploads Documents

**Goal**: Test document upload workflow

```
1. Logged in as parent (Tom) in Trinity
2. Find student: Sarah Smith
3. Click on Sarah or find "Upload Document" option
4. Drag and drop a test file OR click to browse
   (Use any PDF, image, or text file)
5. Select document type: "Waiver" or "Permission Slip"
6. Click: "Upload"
7. File should upload
8. Status should show: "Pending" (waiting for admin approval)
9. Repeat: Upload second document for John
```

**Success Criteria:**
- ✅ Can select/upload file
- ✅ File uploads successfully
- ✅ Status shows "Pending"
- ✅ Document appears in list
- ✅ Can upload multiple documents

### Test 2.4: Parent Tracks Payments

**Goal**: Test payment viewing and info

```
1. Logged in as parent (Tom) in Trinity
2. Find student: Sarah Smith
3. Look for payment section or payment tracker
4. Should show:
   - Trip Cost: $2,500 (or configured amount)
   - Amount Paid: $0 (or previous amount)
   - Balance Due: $2,500
5. Status should show: "No Payment" or "Pending"
6. (Admin can add payments - we'll test that later)
```

**Success Criteria:**
- ✅ Can see payment summary
- ✅ Shows correct amounts
- ✅ Shows correct balance

### Test 2.5: Parent Asks Question

**Goal**: Test question submission

```
1. Logged in as parent (Tom) in Trinity
2. Find: "Ask a Question" or "Questions" section
   (Usually in parent portal or on home page)
3. Fill question form:
   - Question: "What is the dress code for the trip?"
   - Category: "Packing/Clothing" (if available)
4. Click: "Submit"
5. Success message should appear
6. Question should be stored and show: "Status: Submitted"
7. Note: Question will be visible to admins in Questions Dashboard
```

**Success Criteria:**
- ✅ Can find question form
- ✅ Can fill and submit
- ✅ Success message appears
- ✅ Question appears in submitted list

### Test 2.6: Different Parent - Crossroads

**Now test with a different parent - Crossroads**

```
1. Log out (click Logout)
2. Go to: http://localhost:8000/landing.html
3. Click: "Sign Up" on Crossroads Church card
4. Fill signup:
   - Name: "Karen Johnson"
   - Email: "parent.karen@crossroads.org"
   - Password: "TestPassword123"
5. Should redirect to: parent-portal.html?church=crossroads
6. Header should show: "Crossroads Church" NOT "Trinity Church"
7. Add a student to Crossroads
8. Verify: Crossroads student is separate from Trinity students
```

**Success Criteria:**
- ✅ Can sign up for different church
- ✅ Header shows correct church name
- ✅ Data is isolated between churches
- ✅ Not seeing Trinity students

---

## Part 3: Admin Testing (45 minutes)

### Test 3.1: Trinity Admin Approves Documents

**Goal**: Test admin approval workflow

```
PART A: Login as Admin
1. Log out
2. Go to: http://localhost:8000/login.html?church=trinity
3. Login with: pastor.dave@trinity.org / TestPassword123
4. Should redirect to: admin-portal.html?church=trinity
5. Should see: Admin Dashboard
6. Can see: Students, Payments, Documents, Memories, Events, Resources tabs

PART B: Approve Documents
1. Click: "Documents" tab
2. Should see: Documents uploaded by Tom (Sarah's waiver, John's permission slip)
3. Find: Sarah's document
4. Click: "Approve" or "Approve Document" button
5. Optional: Add approval note
6. Status should change: "Pending" → "Approved"
7. Repeat: Approve John's document too
```

**Success Criteria:**
- ✅ Can login as admin
- ✅ Can access admin portal
- ✅ Can see documents tab
- ✅ Can see documents from parents
- ✅ Can approve documents
- ✅ Status changes immediately

### Test 3.2: Admin Creates Events

**Goal**: Test event creation

```
1. Logged in as Trinity admin (Pastor Dave)
2. Click: "Events" tab
3. Click: "Add Event" or "Create Event" button
4. Fill form:
   - Event Name: "Orientation Meeting"
   - Description: "Mandatory meeting for all students and parents"
   - Event Date: (pick a future date)
   - Event Time: "6:00 PM"
   - Event Type: "Meeting"
   - Location: "Trinity Church"
5. Click: "Create Event"
6. Success message should appear
7. Event should appear in events list
8. Repeat: Create 3-4 more events:
   - "Training Day"
   - "Trip Departure"
   - "Trip Return"
```

**Success Criteria:**
- ✅ Can create events
- ✅ Events appear in list
- ✅ Can create multiple events
- ✅ Events have all required info

### Test 3.3: Admin Creates FAQs and Content

**Goal**: Test content management

```
1. Logged in as Trinity admin
2. Click: "Content Management" tab or similar
3. Click: "Add FAQ" or "Create FAQ"
4. Fill form:
   - Question: "What is the total trip cost?"
   - Answer: "$2,500 per student"
   - Category: "Cost/Payment"
5. Click: "Create FAQ"
6. FAQ should appear in list
7. Repeat: Create 2-3 more FAQs:
   - "What documents do I need?"
   - "What's the cancellation policy?"

ALSO: Create Content Items
1. Click: "Add Content" or similar
2. Fill:
   - Section: "Packing List"
   - Title: "What to Pack"
   - Content: "Bring: Comfortable clothes, medications, etc."
3. Click: "Create"
```

**Success Criteria:**
- ✅ Can create FAQs
- ✅ Can create content items
- ✅ Items appear in list
- ✅ Can create multiple items

### Test 3.4: Admin Responds to Questions

**Goal**: Test admin question dashboard

```
1. Logged in as Trinity admin
2. Click: "Questions" tab or "Questions Dashboard"
3. Should see: Questions submitted by Tom (from Part 2.5)
4. Find: Tom's question about dress code
5. Click: "Respond" or "Answer" button
6. Type response: "Business casual. See packing list for details."
7. Optional: Check "Add to FAQ?" checkbox
8. Click: "Submit Response"
9. Status should change: "Submitted" → "Complete"
10. Response should appear
```

**Success Criteria:**
- ✅ Can see submitted questions
- ✅ Can respond to questions
- ✅ Status updates to "Complete"
- ✅ Response is visible
- ✅ Can optionally add to FAQ

### Test 3.5: Crossroads Admin Tests

**Now login as Crossroads admin and verify isolation**

```
1. Log out
2. Go to: http://localhost:8000/login.html?church=crossroads
3. Login with: pastor.mark@crossroads.org
4. Click: "Admin Portal" (if needed)
5. Verify: Seeing ONLY Crossroads data
   - ✅ NOT seeing Trinity students
   - ✅ NOT seeing Trinity events
   - ✅ NOT seeing Trinity documents
   - ✅ Only seeing Crossroads students (Karen added one)
6. Create an event for Crossroads
7. Verify: Trinity admin CANNOT see this event
```

**Success Criteria:**
- ✅ Admin portals are completely isolated by church
- ✅ Crossroads admin only sees Crossroads data
- ✅ Cannot see Trinity data

---

## Part 4: Student Testing (30 minutes)

### Test 4.1: Student Signs Up and Logs In

**Goal**: Verify students can create accounts and access portal

```
1. Create a student account OR use email you set in student table
2. Go to: http://localhost:8000/login.html?church=trinity
3. Fill signup:
   - Name: "Sarah Smith"
   - Email: "student.sarah@trinity.org"
   - Password: "TestPassword123"
4. Should redirect to: student-portal.html?church=trinity
5. Header should show: "Student Portal"
6. Should see: Your name (Sarah Smith)
```

**Success Criteria:**
- ✅ Can sign up as student
- ✅ Redirects to student portal
- ✅ Shows student name

### Test 4.2: Student Views Events and Memories

**Goal**: Test student portal features

```
1. Logged in as student (Sarah)
2. Should see: "Upcoming Events" section
   - Should show the events created by Trinity admin
   - "Orientation Meeting"
   - "Training Day"
   - etc.
3. Click on an event to see details
4. Should see: "Submit Memory" or "Add Memory" section
5. Click: "Submit Memory"
6. Fill form:
   - Title: "Trip Day 1 - Arrived!"
   - Description: "We just arrived in Peru!"
   - Photo: Optional (or skip for now)
7. Click: "Submit"
8. Memory should show: "Status: Pending" (waiting for admin approval)
9. Try submitting another memory
```

**Success Criteria:**
- ✅ Can see events created by admin
- ✅ Can submit memories
- ✅ Memories show pending approval
- ✅ Can submit multiple memories

### Test 4.3: Student Views FAQs

**Goal**: Verify students can access content

```
1. Logged in as student (Sarah)
2. Click: "Nice to Know" or "FAQs" page
   (Or navigate to: nice-to-know.html?church=trinity)
3. Should see: FAQs created by Trinity admin
   - "What is the total trip cost?"
   - "What documents do I need?"
   - etc.
4. Should see: Content items
5. Click on FAQ or content to read full text
6. Verify: All Trinity content visible
```

**Success Criteria:**
- ✅ Can access FAQ/content page
- ✅ Can see FAQs and content created by admin
- ✅ Can read full text

---

## Part 5: Data Isolation Testing (30 minutes)

**Goal**: Verify multi-tenancy works - Trinity and Crossroads data MUST be separate

### Test 5.1: Parent Data Isolation

```
1. Login as Tom (Trinity parent) in parent portal
2. Note: Tom's students (Sarah, John)
3. Log out
4. Login as Karen (Crossroads parent)
5. Karen should see: Only Karen's students
   - NOT Tom's students
   - NOT Trinity students
6. Log back into Tom's account
7. Verify: Tom still only sees his students
```

**Success Criteria:**
- ✅ Trinity parents see only Trinity students
- ✅ Crossroads parents see only Crossroads students
- ✅ No data leakage between churches

### Test 5.2: Admin Data Isolation

```
1. Login as Pastor Dave (Trinity admin)
2. In admin portal, look at Students tab
3. Note: Trinity students only (Sarah, John, etc.)
4. NOT seeing Crossroads students
5. Look at Documents tab
6. Note: Only Trinity documents
7. Log out and login as Pastor Mark (Crossroads admin)
8. Pastor Mark should see: Only Crossroads data
   - NOT Trinity students
   - NOT Trinity documents
   - NOT Trinity events
9. Verify: Pastor Mark CAN see events/documents he created
10. Verify: Pastor Mark CANNOT see Trinity admin's events/documents
```

**Success Criteria:**
- ✅ Admin portals completely isolated
- ✅ Trinity admin only sees Trinity data
- ✅ Crossroads admin only sees Crossroads data
- ✅ No cross-church data access

### Test 5.3: Payment Isolation

```
1. Login as Pastor Dave (Trinity admin)
2. Go to Payments tab
3. Note: Trinity students and their payment info only
4. Add a payment: Sarah - $500
5. Log out and login as Pastor Mark (Crossroads admin)
6. Go to Payments tab
7. Verify: Payments for Crossroads students ONLY
   - Should NOT see Trinity's Sarah or payment of $500
8. Log back in as Tom (Trinity parent)
9. Tom should see: Sarah's payment shows $500 paid
10. Log in as Karen (Crossroads parent)
11. Karen should see: NO payment records (isolated from Trinity)
```

**Success Criteria:**
- ✅ Payment data isolated by church
- ✅ Admins only see their church's payments
- ✅ Parents only see their own payments

### Test 5.4: Event Isolation

```
1. Login as Pastor Dave (Trinity admin)
2. Create event: "Trinity Only Meeting - June 1"
3. Log in as student Sarah (Trinity student)
4. Sarah should see: "Trinity Only Meeting" in events list
5. Log out and login as student Jake (Crossroads student)
   (If you haven't created a Crossroads student, do that first)
6. Jake should see: Events for Crossroads ONLY
   - Should NOT see Trinity's "Trinity Only Meeting"
```

**Success Criteria:**
- ✅ Events are church-specific
- ✅ Students only see their church's events
- ✅ No events leak between churches

---

## Part 6: Edge Cases & Error Handling (30 minutes)

### Test 6.1: Attempt to Access Other Church's Portal

```
1. Login as Tom (Trinity parent)
2. In URL bar, manually navigate to:
   http://localhost:8000/admin-portal.html?church=crossroads
3. Result: Should be redirected to login or show "Permission Denied"
   (Tom is not an admin and not part of Crossroads)
4. Try: http://localhost:8000/admin-portal.html?church=trinity
5. Result: Should redirect because Tom is not an admin
   (Tom is a parent, not an admin)
```

**Success Criteria:**
- ✅ Cannot access other church's portals
- ✅ Cannot access admin portal without admin role
- ✅ Proper error messages or redirects

### Test 6.2: Upload Limits and Validation

```
1. Login as parent (Tom) in Trinity
2. Try uploading a VERY large file (> 10MB)
3. Should get error message
4. Try uploading file with invalid type
5. Should get error or ignore
6. Upload valid file
7. Should succeed
```

**Success Criteria:**
- ✅ File size validation works
- ✅ Error messages are clear
- ✅ Valid files upload successfully

### Test 6.3: Form Validation

```
1. Go to: Create Event form (as admin)
2. Try submitting WITHOUT filling required fields
3. Should get validation errors
4. Fill only some fields
5. Should not submit
6. Fill ALL required fields
7. Should submit successfully
```

**Success Criteria:**
- ✅ Required field validation works
- ✅ Cannot submit incomplete forms
- ✅ Clear error messages

### Test 6.4: Network Error Recovery

```
1. Login as parent (Tom)
2. Open browser DevTools (F12)
3. Go to Network tab
4. Find and "Throttle" to slow network or simulate offline
5. Try uploading a document
6. See how app handles slow/failed request
7. Turn network back on
8. Try again - should work
```

**Success Criteria:**
- ✅ Graceful handling of network issues
- ✅ No crashes when network fails
- ✅ Can retry operations

---

## Part 7: Cross-Browser & Mobile Testing (20 minutes)

### Test 7.1: Mobile Responsiveness

```
1. Open Chrome DevTools (F12)
2. Click: Device Toolbar icon (mobile view)
3. Resize to: iPhone 12 / Pixel 5 / iPad
4. Test as parent:
   - Can read all content
   - Can tap all buttons
   - Forms are readable
   - No horizontal scrolling
5. Test as admin:
   - Dashboard tables are readable
   - Can manage all features
6. Test student portal
   - Can see events
   - Can submit memories
```

**Success Criteria:**
- ✅ Mobile-friendly layout
- ✅ All buttons/forms accessible on mobile
- ✅ No excessive scrolling
- ✅ Text is readable

### Test 7.2: Browser Compatibility

```
Test in:
1. Chrome (primary)
2. Firefox
3. Safari (if Mac)
4. Edge

For each browser:
- Can login
- Can navigate pages
- Can submit forms
- No console errors
```

**Success Criteria:**
- ✅ Works across major browsers
- ✅ No JavaScript errors
- ✅ Layout renders correctly

---

## Part 8: Full End-to-End Workflow Test (30 minutes)

### Complete User Journey: Trinity Trip

**Scenario: Entire Trinity trip workflow from signup to admin approval**

```
WEEK 1: SETUP

Day 1: Super Admin
├─ ✅ Creates Trinity Church (already done)
├─ ✅ Promotes Pastor Dave to admin

Day 1-2: Admin (Pastor Dave)
├─ ✅ Creates Events:
│  ├─ "Orientation" - June 1
│  ├─ "Training" - June 8
│  ├─ "Departure" - June 15
│  └─ "Return" - June 22
├─ ✅ Creates FAQs:
│  ├─ "Cost is $2,500"
│  ├─ "Need passport"
│  └─ "Bring comfortable clothes"
└─ ✅ Creates Resources:
   └─ Packing list PDF

WEEK 2: PARENT SIGNUP

Day 3-5: Parents
├─ ✅ Tom signs up
│  ├─ Adds Sarah (10th grade)
│  ├─ Adds John (11th grade)
│  └─ Uploads documents for each
├─ ✅ Lisa signs up
│  └─ Adds Emily (10th grade)
└─ ✅ Mike signs up
   ├─ Adds twins
   └─ Uploads documents

WEEK 3: ADMIN APPROVALS

Day 6-8: Pastor Dave
├─ ✅ Approves documents
│  ├─ Sarah's waiver ✓
│  ├─ John's waiver ✓
│  ├─ Emily's waiver ✓
│  └─ Twins' waivers ✓
├─ ✅ Answers questions
│  └─ Parents ask questions
│     Admin responds
└─ ✅ Adds payment for Tom's family
   ├─ Sarah: $500 received
   └─ John: $500 received

WEEK 4: STUDENTS LOG IN

Day 9: Students
├─ ✅ Sarah logs in
│  ├─ Sees all events
│  ├─ Sees all FAQs
│  └─ Submits memory: "Day 1 in Peru"
├─ ✅ John logs in
│  ├─ Submits memory: "Great training!"
│  └─ Views packing list
└─ ✅ Emily logs in
   └─ Submits memory

WEEK 5: ADMIN FINAL APPROVALS

Day 10: Pastor Dave
├─ ✅ Approves memories
│  ├─ Sarah's memory ✓
│  ├─ John's memory ✓
│  └─ Emily's memory ✓
└─ ✅ Checks payments
   ├─ Tom's family: $1000 / $5000 (Sarah+John)
   └─ Balance due: $4000

FINAL CHECK: Verify complete workflow
```

**Success Criteria:**
- ✅ All steps complete without errors
- ✅ Data flows correctly between user types
- ✅ No data leakage or corruption
- ✅ Church isolation maintained throughout

---

## Test Results Summary

### Testing Checklist

**Part 1: Super Admin**
- [ ] Can access super admin portal
- [ ] Can create churches
- [ ] Can promote users to admin
- [ ] Can demote admins to parent
- [ ] Promotion instant and works correctly

**Part 2: Parents**
- [ ] Can sign up for church
- [ ] Can add students
- [ ] Can upload documents
- [ ] Can track payments
- [ ] Can ask questions
- [ ] Data isolated between churches

**Part 3: Admins**
- [ ] Can login to admin portal
- [ ] Can approve documents
- [ ] Can create events
- [ ] Can create FAQs and content
- [ ] Can respond to questions
- [ ] Data isolated to their church

**Part 4: Students**
- [ ] Can sign up
- [ ] Can view events
- [ ] Can submit memories
- [ ] Can view FAQs/content
- [ ] Data isolated to their church

**Part 5: Data Isolation**
- [ ] Parents see only their church
- [ ] Admins see only their church
- [ ] Students see only their church
- [ ] No data leakage between churches

**Part 6: Error Handling**
- [ ] File upload validation works
- [ ] Form validation works
- [ ] Permission checks work
- [ ] Network errors handled gracefully

**Part 7: Mobile & Browser**
- [ ] Mobile responsive
- [ ] Works on Chrome/Firefox/Safari/Edge

**Part 8: Complete Workflow**
- [ ] Full end-to-end workflow succeeds
- [ ] All integrations work
- [ ] No errors or crashes

### Issues Found

```
Issue 1: [Description]
- URL/Steps to reproduce:
- Expected:
- Actual:
- Severity: (High/Medium/Low)
- Fixed: (Yes/No)

Issue 2: ...
```

### Overall Assessment

```
PASS / FAIL / PASS WITH ISSUES

Notes:
- System is ready for: (Vercel deployment / Beta testing / Production)
- Still needs: (specific items)
- Known issues: (list)
```

---

## Tester Information

```
Tester Name: _______________
Date: _______________
Environment: (Local / Staging / Production)
Browser(s) Tested: _______________
Mobile Device(s): _______________
Time Spent: _______________
Overall Impressions:
```

---

## Quick Reference: Test Accounts

**Save this for quick access during testing:**

```
ADMIN ACCOUNTS:
- admin@weonamission.org / TestPassword123 (Super Admin)
- pastor.dave@trinity.org / TestPassword123 (Trinity Admin)
- pastor.mark@crossroads.org / TestPassword123 (Crossroads Admin)

PARENT ACCOUNTS:
- parent.tom@trinity.org / TestPassword123 (Trinity)
- parent.karen@crossroads.org / TestPassword123 (Crossroads)

STUDENT ACCOUNTS:
- student.sarah@trinity.org / TestPassword123 (Trinity)
- student.jake@crossroads.org / TestPassword123 (Crossroads)

BASE URLs:
- Landing: http://localhost:8000/landing.html
- Trinity Login: http://localhost:8000/login.html?church=trinity
- Crossroads Login: http://localhost:8000/login.html?church=crossroads
- Super Admin: http://localhost:8000/super-admin-portal.html
```

---

## Success!

If you've completed this entire guide successfully, your WeOnAMission platform is ready for:
- ✅ Production deployment
- ✅ Real church onboarding
- ✅ Multiple churches using simultaneously
- ✅ Parents managing students
- ✅ Admin approvals and content management
- ✅ Students submitting and viewing content

Congratulations! 🎉
