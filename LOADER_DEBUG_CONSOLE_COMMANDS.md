# Debug Spinning Loaders - Console Commands

Run these commands in the browser console (F12) to diagnose the stuck loaders:

## Test 1: Check if loader elements exist

```javascript
// For index.html
console.log('Events loader:', document.getElementById('eventsContainer'));
console.log('Resources loader:', document.getElementById('resourcesContainer'));
console.log('FAQ loader:', document.getElementById('faqContainer'));

// For content-management.html
console.log('FAQs loader:', document.getElementById('faqsContainer'));
console.log('Packing loader:', document.getElementById('packingContainer'));
console.log('Phrases loader:', document.getElementById('phrasesContainer'));
console.log('Tips loader:', document.getElementById('tipsContainer'));

// For admin-portal.html
console.log('FAQs loader:', document.getElementById('faqsContainer'));

// For questions-dashboard.html
console.log('Questions loader:', document.getElementById('questionsContainer'));
```

Expected: Should show HTML elements, NOT `null`

If you see `null`, the container ID is wrong or the page structure is broken.

---

## Test 2: Check if functions are defined

```javascript
// Check if load functions exist
console.log('loadFaqs defined?', typeof loadFaqs);
console.log('loadEvents defined?', typeof loadEvents);
console.log('loadResources defined?', typeof loadResources);
console.log('loadContentItems defined?', typeof loadContentItems);
console.log('renderFaqs defined?', typeof renderFaqs);
```

Expected: All should show `"function"`

If any show `"undefined"`, the function wasn't defined.

---

## Test 3: Manually call the load function and watch

```javascript
// For FAQs
console.log('Starting loadFaqs...');
loadFaqs().then(() => {
    console.log('loadFaqs completed');
    console.log('Loader HTML:', document.getElementById('faqContainer').innerHTML.substring(0, 100));
}).catch(err => {
    console.error('loadFaqs error:', err);
});
```

Watch the console output:
- If you see "loadFaqs completed" → function ran
- If you see an error → something threw an exception
- If you see neither → function is still running (hanging)

---

## Test 4: Check Tenant context

```javascript
// For authenticated pages
Tenant.getCurrentChurchContext().then(church => {
    console.log('Church context:', church);
}).catch(err => {
    console.error('Church error:', err);
});
```

Expected: Should show `{id: '...', name: '...', slug: '...'}`

If it shows `null` or error, the church detection is broken.

---

## Test 5: Check API calls directly

```javascript
// For index.html (unauthenticated)
const church = await Tenant.getCurrentChurchContext();
console.log('Church:', church);

const faqs = await API.getFaqs(church.id);
console.log('FAQs returned:', faqs);
console.log('FAQs count:', faqs ? faqs.length : 'null');
```

Watch what is returned:
- Empty array `[]` → No data (but should show empty state)
- Array with data → Data loaded successfully
- Error in console → API call failed
- No output → Query is hanging

---

## Test 6: Check API functions

```javascript
// See what API functions are available
console.log(Object.keys(API).filter(k => k.includes('faq') || k.includes('content')));
```

Should show:
- `getFaqs`
- `getAllFaqs`
- `getAllContentItems`
- `createFaq`
- `updateFaq`
- etc.

---

## Test 7: Monitor network requests

1. Open DevTools (F12)
2. Go to "Network" tab
3. Reload the page
4. Look for requests to `/rest/v1/faqs` or similar
5. Check the response:
   - Status 200 with data → Working
   - Status 200 with empty array → No data (but not an error)
   - Status 403 → RLS policy denied
   - Status 401 → Not authenticated
   - Pending → Request is hanging

---

## Interpretation Guide

### Loader shows "Loading FAQs..."

| Symptom | Cause | Fix |
|---------|-------|-----|
| Never changes, no console errors | Function isn't being called | Check initialization code |
| Never changes, console shows error | Error caught silently | Add error output |
| Shows empty state after 5 seconds | Works but no data | Correct behavior |
| Shows error after 5 seconds | API failed | Check API/RLS |

### If Test 3 shows "loadFaqs completed"
The function ran successfully. The loader should be replaced. If it's NOT replaced:
- The renderFaqs function isn't being called
- OR renderFaqs isn't updating the HTML
- Check line in loadFaqs that calls renderFaqs

### If Test 5 returns empty array `[]`
That's actually correct - it means:
- API is working
- No FAQs exist in the database (or are hidden)
- Function should show empty state: "No FAQs yet"

If loader is still showing, the renderFaqs() function isn't being called OR the container ID is wrong.

---

## Quick Diagnostic Summary

Run this to get full diagnostics:

```javascript
(async function() {
    console.log('=== LOADER DIAGNOSTIC ===');

    // 1. Check DOM elements
    const loaderIds = ['faqContainer', 'faqsContainer', 'eventsContainer', 'resourcesContainer', 'questionsContainer'];
    loaderIds.forEach(id => {
        const el = document.getElementById(id);
        console.log(`${id}: ${el ? 'EXISTS' : 'NOT FOUND'}`);
    });

    // 2. Check functions
    console.log('loadFaqs:', typeof loadFaqs);
    console.log('renderFaqs:', typeof renderFaqs);
    console.log('loadEvents:', typeof loadEvents);

    // 3. Try to get church
    try {
        const church = await Tenant.getCurrentChurchContext();
        console.log('Church:', church ? church.name : 'null');
    } catch(e) {
        console.log('Church error:', e.message);
    }

    // 4. Try to load FAQs
    try {
        const church = await Tenant.getCurrentChurchContext();
        const faqs = await API.getFaqs(church.id);
        console.log('FAQs loaded:', faqs.length, 'items');
    } catch(e) {
        console.log('FAQ load error:', e.message);
    }
})();
```

Copy this entire command and run it in the console. It will give you a complete diagnostic report.

---

## Common Issues & Solutions

### "Container is null"
**Problem**: Element not found
**Solution**: Check if container ID in HTML matches what's in JavaScript

### "Function is not defined"
**Problem**: Script didn't load or wasn't defined
**Solution**: Check if auth.js/api.js scripts are loaded (check Network tab)

### "Church is null"
**Problem**: Tenant context detection failed
**Solution**: Check URL has ?church=trinity parameter or you're logged in

### "FAQs loaded: 0 items"
**Problem**: No data in database
**Solution**: This is normal - should show "No FAQs yet" in UI

### Request hanging (no response in Network tab)
**Problem**: Likely RLS policy issue or network timeout
**Solution**: Check Supabase status, check RLS policies

---

## What to Report

When you run the diagnostics, tell me:

1. Which loaders are stuck (FAQ, Events, Resources, etc.)?
2. Which pages have the issue (index, admin-portal, content-management, etc.)?
3. Output of Test 1 (container exists? null?)
4. Output of Test 3 (does loadFaqs complete?)
5. Output of Test 5 (what does API return?)
6. Network tab: Any failed requests?

This will help pinpoint the exact issue!
