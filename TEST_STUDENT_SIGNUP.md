# Test Plan - Complete Student Signup Flow

## Status: Ready to Test ✅

All bugs have been fixed. The system should now handle the complete invite flow end-to-end.

---

## Test Checklist

### Phase 1: Login to Parent Portal
- [ ] Open browser to `http://localhost:3000/parent-portal.html` (or your domain)
- [ ] Log in with your parent account
- [ ] Verify you can see the student list
- [ ] Confirm the "📬 Send Invite" button appears on each student card

### Phase 2: Send Student Invite
- [ ] Click the "📬 Send Invite" button on any student card
- [ ] Modal appears with title "Invite Student to Create Account"
- [ ] Enter a test email address (e.g., `teststudent123@example.com`)
- [ ] Click "Send Invite"
- [ ] **Expected Result**: Success modal appears with:
  - ✓ "Invite Sent Successfully!" message
  - An invite URL that looks like: `/student-signup.html?church=trinity&invite=<long-token>`
  - A "📋 Copy Link" button

### Phase 3: Copy Invite Link
- [ ] Click the "📋 Copy Link" button
- [ ] **Expected Result**:
  - Button text changes to "✓ Copied!" and becomes green
  - Toast notification shows "Invite link copied to clipboard!"
  - Link is now in your clipboard (no console errors)

### Phase 4: Student Receives Invite (Simulated)
- [ ] Open the copied link in a **new incognito/private browser window** (important: different from parent login)
- [ ] Or manually construct the URL and paste it in a new window

### Phase 5: Verify Invite Page
- [ ] Student signup page loads without errors
- [ ] Form shows pre-filled fields:
  - **Student Name**: Should show the student's full name (pre-filled from invite)
  - **Email**: Should show the invite email address (pre-filled from invite)
  - **Password**: Empty, ready for input
  - **Confirm Password**: Empty, ready for input

### Phase 6: Create Student Account
- [ ] Enter a password (at least 8 characters)
- [ ] Confirm password (must match)
- [ ] Click "Create Account"
- [ ] **Expected Result**:
  - A notification shows "Account created! Checking email..."
  - Spinner appears briefly
  - Either:
    - Page redirects to student portal, OR
    - Message appears saying "Please confirm your email before logging in"

### Phase 7: Email Confirmation (if needed)
- [ ] If "Please confirm your email" message appears:
  - Go to Supabase console → Authentication → Users
  - Find the email you just used
  - Click "..." menu → "Confirm email"
  - Return to browser and try signing in again with email/password

### Phase 8: Student Portal Access
- [ ] After email confirmation, you should be redirected to or can access the student portal
- [ ] Student name should appear in the header/dashboard
- [ ] No permission errors or database errors

---

## Success Criteria

All steps should complete **without console errors**. If you encounter ANY error, note:
1. The exact error message
2. Where it occurred (which page/step)
3. What the console shows
4. Screenshot if helpful

---

## Troubleshooting

### If Copy Button Fails
- Error: "Failed to copy: TypeError..."
- **Status**: ✅ FIXED in latest version
- Re-check that your api.js has `function copyInviteLink(button)` (with parameter)

### If Signup Page Shows "Cannot read properties of undefined"
- Error: "Invite verification failed: TypeError..."
- **Status**: ✅ FIXED in latest version
- Re-check that your api.js `verifyStudentInvite()` has separate queries

### If Account Creation Fails with "Database error"
- Error: "Database error saving new user"
- **Status**: ✅ FIXED - trigger function created
- Check Supabase database → Functions → `handle_new_user` exists

### If Login Shows Constraint Violation
- Error: "null value in column 'church_id' violates not-null constraint"
- **Status**: ✅ FIXED in latest version (just now!)
- Re-check that your api.js `getCurrentUser()` includes churchId in profile creation (lines 56-73)

### If Login Shows "Cannot coerce result"
- This usually means user profile wasn't created
- **Status**: ✅ FIXED - fallback logic added
- Should auto-create profile on next login attempt

---

## What Each Fix Does

| Bug | Root Cause | Fix | Status |
|-----|-----------|-----|--------|
| Copy button error | `event` not in scope | Pass button parameter | ✅ Fixed |
| Signup verification error | Joined query failed | Separate queries | ✅ Fixed |
| Auth user creation failed | Missing trigger function | Created `handle_new_user()` | ✅ Fixed |
| Church ID constraint | Fallback didn't include church_id | Added church_id lookup | ✅ Fixed |

---

## Next Steps After Success

Once the complete flow works:
1. ✅ Mark this test complete
2. Test with multiple students
3. Verify email integration (manual email sending to students)
4. Consider bulk invite feature (CSV upload)
5. Add payment collection workflow

---

## Quick Links

- Parent Portal: `/parent-portal.html`
- Student Signup: `/student-signup.html?church=trinity&invite=<token>`
- Student Portal: `/student-portal.html`
- API File: `api.js`
- HTML Files: `parent-portal.html`, `student-signup.html`
- Database: Supabase console

---

**Date Created**: 2025-10-25
**Version**: 1.0 - All fixes applied
