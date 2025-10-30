# Universal Loader Fix - Template

## The Problem

Loaders get stuck because:
1. Load function is called but never completes
2. Render function updates HTML, but loader is still visible
3. No error thrown, so user sees frozen "Loading..." state

## The Solution

Add three improvements to each load function:

### 1. Add timeout to show error if loading takes too long

```javascript
async function loadFaqs() {
    const container = document.getElementById('faqContainer');
    let timeoutId;

    try {
        // Set 5-second timeout
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
                reject(new Error('Loading FAQs timed out'));
            }, 5000);
        });

        const church = await Tenant.getCurrentChurchContext();
        if (!church) {
            console.error('No church context found');
            return;
        }

        // Race: either complete or timeout
        const faqs = await Promise.race([
            API.getFaqs(church.id),
            timeoutPromise
        ]);

        renderFaqs(faqs);
    } catch (error) {
        console.error('Error loading FAQs:', error);
        container.innerHTML = '<p class="empty-state">⚠️ Unable to load FAQs. Please refresh the page.</p>';
    } finally {
        clearTimeout(timeoutId);
    }
}
```

### 2. Add explicit console logging

```javascript
async function loadFaqs() {
    console.log('[LoadFaqs] Starting...');
    try {
        const church = await Tenant.getCurrentChurchContext();
        console.log('[LoadFaqs] Church:', church?.name);

        const faqs = await API.getFaqs(church.id);
        console.log('[LoadFaqs] Got FAQs:', faqs.length);

        renderFaqs(faqs);
        console.log('[LoadFaqs] Rendered successfully');
    } catch (error) {
        console.error('[LoadFaqs] Error:', error.message);
        document.getElementById('faqContainer').innerHTML = '...error...';
    }
}
```

### 3. Add null check before HTML update

```javascript
function renderFaqs(faqs) {
    const container = document.getElementById('faqContainer');

    // Safety check: ensure container exists
    if (!container) {
        console.error('FAQs container element not found');
        return;
    }

    console.log('[RenderFaqs] Container found, FAQs:', faqs.length);

    if (!faqs || faqs.length === 0) {
        container.innerHTML = '<p class="empty-state">No FAQs yet</p>';
        return;
    }

    // ... rest of rendering
}
```

---

## Which Functions Need the Fix

### index.html
- [ ] loadEvents() - line 1115
- [ ] loadResources() - line 1248
- [ ] loadFaqs() - line 1351

### content-management.html
- [ ] loadFaqs() - line 673
- [ ] loadContentItems() - line 751

### admin-portal.html
- [ ] loadFaqs() - line 2117

### questions-dashboard.html
- [ ] loadQuestions() - line 645

---

## Implementation Order

1. **Start with index.html** (most critical - homepage for users)
   - Fix loadEvents()
   - Fix loadResources()
   - Fix loadFaqs()

2. **Then content-management.html**
   - Fix loadFaqs()
   - Fix loadContentItems()

3. **Then admin-portal.html**
   - Fix loadFaqs()

4. **Finally questions-dashboard.html**
   - Fix loadQuestions()

---

## Testing Each Fix

After fixing each function:

```javascript
// Open console and run
loadFaqs();  // Should see [LoadFaqs] Starting... then [LoadFaqs] Rendered successfully
```

Expected console output:
```
[LoadFaqs] Starting...
[LoadFaqs] Church: Trinity
[LoadFaqs] Got FAQs: 0
[RenderFaqs] Container found, FAQs: 0
[LoadFaqs] Rendered successfully
```

---

## Backup Plan

If the above fixes don't work, there's likely a deeper issue:

1. **RLS policy blocking access** → Check Supabase RLS policies
2. **API script not loading** → Check Network tab for api.js
3. **Container element missing** → Check HTML structure
4. **Initialization race condition** → Need to restructure async flow

See SPINNING_LOADERS_DIAGNOSIS.md for investigation steps.
