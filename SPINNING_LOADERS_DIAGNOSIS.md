# Spinning Loaders - Root Cause Diagnosis

## Problem Summary

Spinning loaders are getting stuck on multiple pages:

1. **index.html** (Homepage) - FAQs section, Resources section, Upcoming Events section
2. **content-management.html** - FAQs section at bottom
3. **questions-dashboard.html** - Questions container at bottom
4. **admin-portal.html** - FAQs tab

The loaders show "Loading..." but never complete or show an error.

---

## Root Cause Analysis

### The Issue

The loaders hang because API queries **return empty arrays silently** rather than throwing errors.

Here's what happens:

```javascript
// index.html:1358
const faqs = await API.getFaqs(church.id);
// If RLS denies: returns [] (empty array) - NO ERROR
// If data doesn't exist: returns [] (empty array) - NO ERROR
// Code continues: renderFaqs([])
// renderFaqs sees empty array: renders "No FAQs yet"
// ✅ But loader never replaced - still shows "Loading FAQs..."
```

### Why Loaders Stay Visible

Looking at the code flow:

```javascript
// 1. Initial state
<div id="faqContainer" class="loading">Loading FAQs...</div>

// 2. loadFaqs() is called
async function loadFaqs() {
    try {
        const faqs = await API.getFaqs(church.id);
        renderFaqs(faqs);  // ← This SHOULD replace the loader
    } catch (error) {
        // Only runs if API throws an error
        document.getElementById('faqContainer').innerHTML = '...error...';
    }
}

// 3. renderFaqs() replaces the HTML
function renderFaqs(faqs) {
    const container = document.getElementById('faqContainer');

    if (faqs.length === 0) {
        container.innerHTML = '<p class="empty-state">No FAQs yet...</p>';
        return;  // ← Loader should be replaced here
    }

    container.innerHTML = faqs.map(...).join('');  // Render FAQs
}
```

**The logic LOOKS correct.** So the issue must be:

1. **loadFaqs() is never called**, OR
2. **loadFaqs() is throwing an error silently**, OR
3. **renderFaqs() is never being called**, OR
4. **The container ID is wrong**

---

## Hypothesis Testing

### Hypothesis 1: loadFaqs() isn't being called at all

**Evidence to check**:
- Open browser console while page loads
- Should see "Error loading FAQs:" if something fails
- Should see `renderFaqs` being called

**If true**: The initialization code at line 1391-1396 might not be executing

### Hypothesis 2: Wrong container ID

**Code paths**:
- **index.html**: `faqContainer` (line 933)
- **content-management.html**: `faqsContainer` (line 524) ← Note the 's'!
- **admin-portal.html**: `faqsContainer` (line 753) ← Note the 's'!
- **questions-dashboard.html**: `questionsContainer` (line 569)

**FOUND INCONSISTENCY**: index.html uses `faqContainer`, but the function is trying to update... let me check:

```javascript
// index.html:1362
document.getElementById('faqContainer').innerHTML =
```

✅ That's correct - it matches line 933.

But what about the other files?

### Hypothesis 3: renderFaqs() not defined in all files

Let me check if renderFaqs exists in each file...

```javascript
// index.html:1367
function renderFaqs(faqs) { ... }  // ✅ Defined

// content-management.html:673
async function loadFaqs() { ... }
// But where is renderFaqs?
```

**AH HA!** That's likely the issue. Let me verify...

---

## The Real Problem

Looking at the different files, they have different implementations:

### **index.html** (Homepage)
```javascript
loadFaqs() {
    API.getFaqs() → renderFaqs(faqs)
}

renderFaqs(faqs) {
    container.innerHTML = ...  // ✅ Replaces loader
}
```

### **content-management.html**
```javascript
loadFaqs() {
    API.getAllFaqs() → ???  // What happens next?
}
```

Let me check what content-management actually does:

---

## Investigation Needed

I need to check:

1. **index.html (1351-1365)**: How does loadFaqs work? Does it call renderFaqs?
2. **content-management.html (673+)**: How does loadFaqs work? Does it properly update the container?
3. **admin-portal.html (2117+)**: How does loadFaqs work?
4. **questions-dashboard.html**: How does it load questions?

**Pattern to look for**:
```javascript
// WORKING:
const faqs = await API.getFaqs(churchId);
container.innerHTML = faqs.map(...).join('');  // ✅ Replaces loader

// BROKEN:
const faqs = await API.getFaqs(churchId);
// Missing: container.innerHTML update
// Result: Loader never replaced
```

---

## Specific Issues to Fix

Based on the structure, the loaders are likely stuck because:

### Issue 1: FAQs Query Failing Silently
- RLS policy: `church_id IN (SELECT church_id FROM users WHERE id = auth.uid())`
- For **unauthenticated users** (index.html): `auth.uid()` is NULL
- Result: `NULL IN (...)` = NULL = DENY silently (no error thrown)
- Loader stays visible because query returns `[]` without error

### Issue 2: Similar for Resources and Events on index.html
- Same RLS issue affects resources and events
- Unauthenticated access denied by RLS silently

### Issue 3: Content Management Pages
- These users ARE authenticated
- But the queries might not be returning data for some other reason
- Loader still visible = function not replacing HTML properly

---

## Solution Options

### Option A: Fix RLS Policies (Recommended)
Make FAQs/Resources publicly readable but still church-specific:

```sql
-- BEFORE
CREATE POLICY "Users can access their church's faqs" ON faqs
    FOR SELECT USING (
        church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
    );

-- AFTER
CREATE POLICY "Public faqs are readable" ON faqs
    FOR SELECT USING (
        display = true
        AND church_id IN (
            SELECT church_id FROM users WHERE id = auth.uid()
            UNION
            SELECT id FROM churches  -- Any church is readable publicly
        )
    );
```

Actually, better approach:

```sql
-- Allow public read of faqs where display = true
CREATE POLICY "Public faqs are readable" ON faqs
    FOR SELECT USING (display = true);

-- Allow authenticated users to see all faqs in their church
CREATE POLICY "Admins can see all faqs in their church" ON faqs
    FOR SELECT USING (
        church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
    );
```

### Option B: Add Error Handling to API
Wrap API calls to detect silent failures:

```javascript
async function loadFaqsWithFallback() {
    try {
        const faqs = await API.getFaqs(church.id);
        if (faqs.length === 0) {
            // Still show empty state instead of loader
            container.innerHTML = '<p>No FAQs available</p>';
        } else {
            renderFaqs(faqs);
        }
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = '<p>Error loading FAQs</p>';
    }
}
```

### Option C: Add Timeout to Loaders
Show error after 5 seconds if loader still visible:

```javascript
const timeout = setTimeout(() => {
    const container = document.getElementById('faqContainer');
    if (container.classList.contains('loading')) {
        container.innerHTML = '<p>Failed to load FAQs. Please refresh.</p>';
    }
}, 5000);

loadFaqs().finally(() => clearTimeout(timeout));
```

---

## Next Steps

1. **Confirm the RLS issue** by checking browser console
2. **Check which approach fits** the system design
3. **Implement the fix** in all affected pages
4. **Test thoroughly** to verify loaders complete

---

## Files Affected

- ✏️ index.html (FAQs, Resources, Events loaders)
- ✏️ content-management.html (FAQs, packing, phrases, tips loaders)
- ✏️ admin-portal.html (FAQs loader)
- ✏️ questions-dashboard.html (Questions loader)
- ✏️ database/migration-to-multitenant.sql (RLS policies)

---

## Estimated Fix Time

- **Option A (RLS)**: 30 minutes (1 SQL fix, test)
- **Option B (Error handling)**: 1 hour (update 4 files, add timeouts)
- **Option C (Timeout)**: 30 minutes (add 5-second timeout logic)

**Recommended**: Option A is cleanest - fix root cause at database level
