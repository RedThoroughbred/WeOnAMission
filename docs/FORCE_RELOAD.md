# Force Reload Browser Cache

## Issue

You're getting an error that the code I just fixed should have resolved. This is likely a **browser cache** issue.

## Solution

### Step 1: Hard Refresh Your Browser

**Chrome / Edge / Firefox:**
- Press: **Ctrl + Shift + R** (Windows)
- Or: **Cmd + Shift + R** (Mac)

This bypasses the cache and loads fresh copies of all files.

### Step 2: Verify Cache is Cleared

1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Reload the page (F5)
4. Look at the file sizes
5. They should all load (not say "from cache")

### Step 3: Check DevTools Console

1. Open Developer Tools (F12)
2. Go to "Console" tab
3. Type: `typeof API`
4. Press Enter
5. Should say: `"object"`
6. Type: `typeof API.sendStudentInvite`
7. Press Enter
8. Should say: `"function"`

**If you see "undefined" for either, cache is still old**

---

## If Hard Refresh Doesn't Work

### Option A: Clear Application Cache
1. Open DevTools (F12)
2. Go to "Application" tab
3. Click "Storage"
4. Click "Clear site data" button
5. Check all boxes
6. Click "Clear"
7. Refresh page

### Option B: Use Incognito/Private Mode
1. Open new Incognito window (Ctrl+Shift+N or Cmd+Shift+N)
2. Go to your site
3. This will load fresh without cache
4. Test the invite button
5. If it works, your cache was the issue

### Option C: Check Browser Network Requests
1. Open DevTools (F12)
2. Go to "Network" tab
3. Reload page (Ctrl+R)
4. Look for `api.js` in the list
5. Click on it
6. Check the "Response" tab
7. Search for `sendStudentInvite`
8. It should be there

---

## What Changed

I added a missing function `getChurchIdFromSlug()` to `api.js` that was being called but not defined. This was preventing the entire API object from working.

**File:** `api.js` (lines 1034-1048)

The fix is in the code, but your browser needs to load the latest version.

---

## Quick Checklist

- [ ] Pressed Ctrl+Shift+R (or Cmd+Shift+R on Mac)
- [ ] Waited for page to fully reload
- [ ] Opened DevTools Console (F12)
- [ ] Typed `typeof API` and got "object"
- [ ] Typed `typeof API.sendStudentInvite` and got "function"
- [ ] Tried the "Send Invite" button again

---

## Still Getting Error?

If you've done all the above and still getting the error:

1. **Check the exact error message** - copy the full error
2. **Take a screenshot** of the error
3. **Check if maybe api.js file didn't get updated** - open it in your editor and look for `getChurchIdFromSlug` function (should be around line 1034)

---

## Next Steps

Once you verify the API is loaded properly:

1. Click "Send Invite" button
2. Enter student email
3. Click "Send Invite"
4. You should get either:
   - ✅ Success with invite link (if database migration ran)
   - ❌ Error about database (if migration not run)

But you WON'T get "API.sendStudentInvite is not a function" anymore.

---

**The Fix:** api.js has been updated with the missing function
**Your Action:** Hard refresh your browser to load the updated code
**Expected Result:** API will work, invite button will function properly
