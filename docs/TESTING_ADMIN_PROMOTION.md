# Testing the Admin Promotion Feature

## Quick Start Test (5 minutes)

Follow these steps to test the new admin promotion feature end-to-end.

---

## Prerequisites

You'll need:
1. The app running locally: `http://localhost:8000`
2. A super admin account (role = 'admin')
3. A test user account to promote (role = 'parent')
4. Trinity Church set up in database (UUID: `00000000-0000-0000-0000-000000000001`)

---

## Step 1: Access the Super Admin Portal

1. Open browser to: `http://localhost:8000/super-admin-portal.html?church=trinity`
2. Log in with your super admin account
3. You should see:
   - "Super Admin Dashboard" header
   - "Add New Church" form
   - "Manage Churches" section with churches table
   - **NEW:** "Manage Church Users" section at the bottom

---

## Step 2: Create a Test User (if needed)

If you don't have a test user to promote, create one first:

1. Go to: `http://localhost:8000/login.html?church=trinity`
2. Click "Sign Up" tab
3. Fill in:
   - Name: "Test User"
   - Email: "testuser@example.com"
   - Password: "TestPassword123"
4. Click "Sign Up"
5. You should be auto-signed in as parent

Now create another test user (different email) to have someone to promote.

---

## Step 3: View Church Users

Back in the Super Admin Portal:

1. Scroll to "Manage Church Users" section
2. Click dropdown labeled "Select Church to View Users"
3. Select "Trinity Church" (or whatever church name you have)
4. A table should appear with users for Trinity

**Table should show:**
| Email | Name | Role | Joined | Actions |
|-------|------|------|--------|---------|
| your@email.com | Your Name | Parent | [today's date] | Promote to Admin |
| testuser@example.com | Test User | Parent | [today's date] | Promote to Admin |

---

## Step 4: Test Promotion

1. Find the test user in the table
2. Click the **"Promote to Admin"** button
3. Confirm dialog appears: "Promote this user to admin? They will be able to manage church content, events, and responses."
4. Click **"OK"** to confirm
5. Success alert appears: "User promoted to admin successfully!"
6. Table refreshes automatically
7. Test user's role changes to **"Admin"** (blue badge)
8. Button changes to **"Demote to Parent"**

✅ **Promotion successful!**

---

## Step 5: Verify Admin Can Access Admin Portal

Now verify the promoted user can actually access the admin portal:

1. Log out of super admin portal
2. Log in as the test user (testuser@example.com / TestPassword123)
3. You should be redirected to parent portal
4. In URL bar, manually navigate to: `http://localhost:8000/admin-portal.html?church=trinity`
5. Page should load (no permission error)
6. You should see admin dashboard with tabs for Students, Payments, Documents, etc.

✅ **Admin access works!**

---

## Step 6: Test Demotion

1. Log back in as super admin
2. Go to super-admin-portal.html
3. Go to "Manage Church Users" section
4. Select Trinity Church again
5. Find the user you just promoted (now showing as "Admin")
6. Click **"Demote to Parent"** button
7. Confirm dialog appears: "Demote this user from admin? They will lose admin privileges."
8. Click **"OK"** to confirm
9. Success alert appears: "User demoted from admin successfully!"
10. Table refreshes
11. User role changes back to **"Parent"**

✅ **Demotion successful!**

---

## Step 7: Verify Demoted User Can't Access Admin

1. Log out of super admin
2. Log in as the demoted test user
3. In URL bar, try to navigate to: `http://localhost:8000/admin-portal.html?church=trinity`
4. You should be redirected to: `http://localhost:8000/login.html` with permission error
5. Or if logged in, you should see: "You do not have permission to access this page"

✅ **Permission check works!**

---

## Test Scenarios

### Scenario 1: New Church Onboarding

**Simulate the church onboarding workflow:**

1. Create a new church via "Add New Church" form:
   - Name: "Test Church"
   - Slug: "testchurch"
   - Trip Name: "Test Trip 2026"

2. Invite a test user to sign up at: `http://localhost:8000/login.html?church=testchurch`

3. Have them sign up as a new account

4. Go back to super admin portal

5. Use "Manage Church Users" to promote them to admin

6. Verify they can access the admin portal at: `http://localhost:8000/admin-portal.html?church=testchurch`

✅ **New church workflow complete!**

### Scenario 2: Emergency Admin Cover

**Test quick admin assignment:**

1. Create a quick test user (don't need them to sign up, can create directly)

2. Use promotion feature to make them admin instantly (< 30 seconds)

3. Verify they have access

4. Demote them when done

✅ **Emergency coverage works!**

### Scenario 3: Staff Rotation

**Test removing admin privileges:**

1. Have an admin user (use one from scenario 1 or 2)

2. Use demotion feature to remove admin role

3. Verify they can no longer access admin portal

4. Verify they still have parent access (can log in to parent portal)

✅ **Staff rotation works!**

---

## Troubleshooting During Testing

### Issue: "Manage Church Users" section doesn't appear

**Fix:**
- Make sure you're logged in as a super admin (role = 'admin')
- Refresh the page (Ctrl+R or Cmd+R)
- Check browser console (F12) for errors

### Issue: Church dropdown is empty

**Fix:**
- Make sure you've created at least one church (Trinity should exist)
- Check that the churches are in your database
- Reload the page and try again

### Issue: Table shows "No users found for this church"

**Fix:**
- Make sure at least one user has signed up for that church
- Create a test user by signing up at the login page with that church's slug
- Check the database directly to verify users exist

### Issue: "You do not have permission to promote users" error

**Fix:**
- Make sure you're logged in as a super admin (role = 'admin')
- The user you're logged in as must be the "admin" role (not "parent")
- Try logging out and back in

### Issue: User still can't access admin portal after promotion

**Fix:**
- Have them do a hard refresh (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)
- Have them log out and log back in
- Their auth token may be cached with old role

---

## Success Criteria

The feature is working correctly if all these pass:

✅ Super admin can view "Manage Church Users" section
✅ Can select a church and see its users
✅ Can click "Promote to Admin" button
✅ Confirmation dialog appears before promotion
✅ User role changes to Admin in table
✅ Promoted user can access admin portal
✅ Admin user shows "Demote to Parent" button instead
✅ Can click "Demote to Parent" button
✅ Confirmation dialog appears before demotion
✅ User role changes back to Parent in table
✅ Demoted user cannot access admin portal (redirected to login)
✅ Success/error alerts appear appropriately
✅ All operations complete in < 5 seconds

---

## Browser Console Checks

If something isn't working, check the browser console for errors:

1. Press **F12** to open Developer Tools
2. Click the **"Console"** tab
3. Look for any red error messages
4. Note the error and check what operation triggered it

Common errors to look for:
- `API.getChurchUsers is not a function` - api.js not loaded
- `Cannot read property 'value' of null` - HTML element missing
- `403 Forbidden` - Permission issue in database
- `Network error` - Database connection issue

---

## Performance Expectations

When everything is working correctly:

- **Load users**: < 1 second
- **Promote user**: < 2 seconds
- **Demote user**: < 2 seconds
- **Table refresh**: < 1 second

If operations take much longer (> 5 seconds), there may be a network or database issue.

---

## Database Verification

If you want to verify changes directly in the database:

1. Go to Supabase dashboard
2. SQL Editor
3. Run this query:

```sql
SELECT id, email, full_name, role, church_id
FROM users
WHERE church_id = '00000000-0000-0000-0000-000000000001'
ORDER BY email;
```

You should see:
- Your users for Trinity Church
- Role column showing 'admin' or 'parent'
- Changes reflected after each promotion/demotion

---

## Next Steps After Testing

Once testing passes:

1. ✅ Feature is ready for production
2. 📚 Share ADMIN_PROMOTION_GUIDE.md with church admins
3. 🚀 Deploy to Vercel
4. 📊 Monitor for any issues
5. 📝 Update any other documentation that references admin promotion

---

## Reporting Issues

If you find a bug during testing:

1. Note the exact steps to reproduce
2. Take a screenshot or console error
3. Check the browser console (F12) for error messages
4. Document which operation failed and what the error was

Common issues and fixes:
- Clear browser cache and reload
- Check database connection in Supabase dashboard
- Verify user has correct role in database
- Ensure API functions are loaded in api.js

---

## Summary

This testing guide should help verify the admin promotion feature works end-to-end. The feature is designed to be:

- ✅ **Fast** - Promote/demote in < 2 seconds
- ✅ **Safe** - Confirmation dialogs prevent accidents
- ✅ **Secure** - Role validation on every operation
- ✅ **Intuitive** - One-click buttons in the portal UI

Good luck with testing! Let me know if you find any issues.
