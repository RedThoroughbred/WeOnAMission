# Debug: API Object Not Loading

If you're still getting "API.sendStudentInvite is not a function" after hard refreshing, use this guide to diagnose the issue.

---

## Diagnostic Steps

### Step 1: Check if api.js File Loaded

Open Developer Tools Console (F12) and type:

```javascript
document.querySelectorAll('script').forEach(s => console.log(s.src));
```

**Look for:** A line containing `api.js`

**If you see it:** File was included
**If you don't:** File isn't in HTML - check parent-portal.html script tags

---

### Step 2: Check if API Object Exists

In Console, type:

```javascript
typeof API
```

**Expected:** `"object"`

**If "undefined":** API object didn't load - check for JavaScript errors below
**If "object":** Continue to Step 3

---

### Step 3: Check API Methods

In Console, type each of these separately:

```javascript
typeof API.sendStudentInvite
typeof API.getChurchIdFromSlug
typeof API.getCurrentUser
typeof API.signUp
```

**Expected:** All should be `"function"`

**If any are "undefined":** The method doesn't exist in the API object
**If all are "function":** API is properly loaded

---

### Step 4: Check for JavaScript Errors

1. Open DevTools (F12)
2. Go to "Console" tab
3. Look for any RED error messages at the top
4. Note the exact error message

**Common errors:**

| Error | Cause | Fix |
|-------|-------|-----|
| `CONFIG is not defined` | config.js didn't load | Check if config.js exists |
| `supabase is not defined` | Supabase CDN didn't load | Check internet connection |
| `SyntaxError: Unexpected token` | JavaScript syntax error | Check api.js for typos |

---

### Step 5: Check Network Tab

1. Open DevTools (F12)
2. Go to "Network" tab
3. Reload page (F5)
4. Look for `api.js` in the list
5. Click on it
6. Go to "Response" tab
7. Search for `sendStudentInvite`

**If found:** File loaded correctly
**If not found:** File wasn't loaded or is corrupted

---

### Step 6: Verify api.js Content

Open the actual file in your editor: `api.js`

Search for these lines to verify the file is correct:

**Line ~909:**
```javascript
async sendStudentInvite(studentId, studentEmail, churchId) {
```

**Line ~1035:**
```javascript
async getChurchIdFromSlug(churchSlug) {
```

**Both should exist** if the file is updated correctly.

---

## Possible Issues & Fixes

### Issue 1: Browser Still Serving Old Cached Version

**Symptoms:**
- Hard refresh doesn't help
- Console shows `sendStudentInvite` not defined
- Network tab shows old file size

**Fix:**
Option A: Use Incognito/Private mode (always loads fresh)
Option B: Clear entire browser cache
Option C: Wait 5 minutes for CDN cache to expire

---

### Issue 2: api.js File Wasn't Updated

**Symptoms:**
- File loads but missing `getChurchIdFromSlug` function
- Check api.js around line 1034-1048

**Fix:**
1. Open `api.js` in your editor
2. Go to line 1034
3. Verify this code exists:
```javascript
// Helper to get church ID from slug
async getChurchIdFromSlug(churchSlug) {
```

If not there, the file wasn't updated. Save again.

---

### Issue 3: Syntax Error in api.js

**Symptoms:**
- DevTools Console shows JavaScript error
- Error mentions api.js

**Diagnosis:**
In terminal, run:
```bash
node -c api.js
```

Should print nothing. If it prints an error, there's a syntax issue.

**Fix:**
Check these common issues:
- Missing comma after function
- Unclosed braces
- Typos in function names

---

### Issue 4: CONFIG Not Loaded

**Symptoms:**
- Error: `CONFIG is not defined`
- This prevents api.js from initializing

**Check:**
In Console, type:
```javascript
typeof CONFIG
```

Should be `"object"`

**Fix:**
1. Check that config.js exists
2. Check that script tag for config.js comes before api.js in HTML
3. Check that config.js doesn't have syntax errors

---

## Step-by-Step Debugging Checklist

- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] Type `typeof API` → should be "object"
- [ ] Type `typeof API.sendStudentInvite` → should be "function"
- [ ] Type `typeof API.getChurchIdFromSlug` → should be "function"
- [ ] Check for red errors in console
- [ ] Reload page (F5)
- [ ] Try invite button again

---

## If All Else Fails

Try this nuclear option:

1. **Close all browser tabs** with your site
2. **Quit the entire browser** (not just close it)
3. **Restart the browser**
4. **Go to your site**
5. **Try the invite button**

This will completely clear all caches and restart everything fresh.

---

## Still Not Working?

If you've done all the above and it still doesn't work:

1. **Take a screenshot** of the error
2. **Copy the exact error message** from console
3. **Check that api.js has the fix:**
   - Open api.js in editor
   - Search for `getChurchIdFromSlug`
   - It should be there (lines 1034-1048)
4. **Run the diagnostic commands** from Step 1-6 above
5. **Note all findings**

With this information, we can pinpoint exactly what's wrong.

---

## Quick Reference: What Should Be True

| Check | Command | Expected Result |
|-------|---------|-----------------|
| API exists | `typeof API` | `"object"` |
| sendStudentInvite exists | `typeof API.sendStudentInvite` | `"function"` |
| getChurchIdFromSlug exists | `typeof API.getChurchIdFromSlug` | `"function"` |
| CONFIG exists | `typeof CONFIG` | `"object"` |
| Supabase exists | `typeof supabase` | `"object"` |
| No errors | (check console) | No red messages |

If all are correct, the API is working and the issue is elsewhere (database not set up).

---

**Note:** This debugging guide assumes you've already done a hard refresh and the api.js file contains the fix (getChurchIdFromSlug function on lines 1034-1048).
