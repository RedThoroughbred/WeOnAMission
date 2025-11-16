# Quick Recovery: Get Back Into Parent Account

## What Happened

The login redirect was broken (now fixed), and you're locked out of your parent account. Follow these steps to get back in.

---

## FASTEST WAY: Reset Password (2 minutes)

### If you remember your password:

1. **Hard refresh browser**
   ```
   Ctrl+Shift+R or Cmd+Shift+R
   ```

2. **Go to login page**
   ```
   http://localhost:8000/login.html
   ```

3. **Try signing in again**
   - Email: (your parent email)
   - Password: (your password)

4. **If it works** → You're in! Parent portal should load.

5. **If "Invalid credentials"** → Password is wrong, do reset below

### If you forgot your password:

1. **Go to login page**
2. **Look for "Forgot Password" link** (if available)
3. **Enter your email**
4. **Check email for reset link**
5. **Follow link and set new password**
6. **Try signing in again**

---

## NUCLEAR OPTION: Delete and Recreate Account (5 minutes)

Use this if:
- You can't remember password
- Password reset doesn't work
- You want a completely fresh account

### Steps:

1. **Open Supabase Console**
   - Go to https://app.supabase.com
   - Select your project

2. **Delete Your Account**
   - Go to **Authentication** → **Users**
   - Search for your parent email
   - Click the user
   - Click "..." menu → **Delete user**
   - Confirm deletion

3. **Wait 10 seconds**
   - Let the deletion propagate

4. **Create New Account**
   - Go back to app login page
   - Click "Sign Up"
   - Use same email
   - Create new password
   - Sign up

5. **Verify Account Created**
   - Check Supabase → Users
   - See your email listed
   - Check role: should be 'parent'

6. **Try Logging In**
   - Use new password
   - Should go to parent-portal.html

---

## STEP-BY-STEP: Delete Account in Supabase

1. **Go to Supabase**
   ```
   https://app.supabase.com
   ```

2. **Select Your Project**
   - Click on your project name

3. **Open Authentication**
   - Left sidebar → "Authentication"

4. **Go to Users**
   - Click "Users" tab

5. **Find Your Email**
   - Search box at top
   - Type your parent email
   - Click on the user

6. **Open Menu**
   - Click the three dots "..." at the right
   - Select "Delete user"

7. **Confirm**
   - Click "Delete" in confirmation dialog

8. **Wait a few seconds**
   - Database needs to propagate the change

---

## STEP-BY-STEP: Create New Account

1. **Hard Refresh Browser**
   ```
   Ctrl+Shift+R or Cmd+Shift+R
   ```

2. **Go to Login Page**
   ```
   http://localhost:8000/login.html
   ```

3. **Click "Sign Up"**
   - Or look for sign up form

4. **Fill in Form**
   - Email: (your parent email)
   - Full name: (your name)
   - Password: (choose a new password, remember it!)
   - Confirm password: (same as above)

5. **Click "Sign Up"**
   - Wait for confirmation

6. **Verify Account Created**
   - You should see success message
   - Or might be asked to confirm email

7. **Try Logging In**
   - Use your new password
   - Should redirect to parent-portal.html

---

## VERIFY IT WORKED

After successfully logging in:

1. **Check Navigation Menu**
   - Should see: 📋 Trip Info | 👨‍👩‍👧‍👦 My Students | ⚙️ Settings

2. **Check Header**
   - Should show your name and email
   - Should have logout button

3. **Check URL**
   - Should be at parent-portal.html (not /trinity/parent-portal.html)

4. **Try Navigation**
   - Click "📋 Trip Info" → should see index.html
   - Click "⚙️ Settings" → should see parent-profile.html

---

## TROUBLESHOOTING

### "Still says Invalid Credentials"
- Make sure you're using correct email
- Make sure new account was created
- Check Supabase → Users to verify account exists

### "Can't find my email in users list"
- Account was deleted successfully
- Need to create new account (follow "Create New Account" above)

### "Still getting 404 error"
- Did you hard refresh? Try again: Ctrl+Shift+R
- Check browser cache in DevTools

### "Signed in but went to student portal"
- Your user role is 'student'
- Need to update role to 'parent'
- See ADMIN_SETUP.md for how to change role

---

## Prevention FOR FUTURE

1. **Remember your password**
   - Or use browser password manager
   - Write it down somewhere safe

2. **Know your email**
   - This is your login username

3. **Remember your role**
   - Parent: role = 'parent'
   - Student: role = 'student'

---

## NEXT STEPS

After you're back in:

1. ✅ Test navigation menu
2. ✅ Test profile editing
3. ✅ Create student invite
4. ✅ Invite a student

---

## QUESTIONS?

Check these files:
- **FIX_LOGIN_REDIRECT.md** - What the issue was
- **LOGIN_TROUBLESHOOTING.md** - More detailed troubleshooting
- **ADMIN_SETUP.md** - How to set user roles

---

**Recommended**: Do "Nuclear Option" if anything else doesn't work. It's fast and reliable.

Good luck! You should be back in within 5 minutes.

---

**Date**: 2025-10-25
**Status**: Ready to help you recover access
