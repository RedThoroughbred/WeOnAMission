# Super Admin Portal: 400 Error Analysis

**Issue**: Submitting questions/feedback in super admin portal returns HTTP 400 error

**Error Location**: `super-admin-portal.html` line 1263

**Error Details**:
```
Failed to load resource: the server responded with a status of 400
URL: sqcdgvvjojgrwsdajtuq.supabase.co/rest/v1/user_questions?columns=...
```

## Root Cause Analysis

### Step 1: The API Call
**File**: `super-admin-portal.html:1263`
```javascript
await API.submitQuestion(email, questionText, questionType, null, attachmentPath);
//                                                        ^^^^
//                                                   churchId = null
```

### Step 2: The API Function
**File**: `api.js:667-687`
```javascript
async submitQuestion(email, question, questionType = 'question', churchId, attachmentPath = null) {
    const questionData = {
        user_id: user ? user.id : null,
        email: email,
        question: attachmentPath ? `${question}\n\n[Attachment: ${attachmentPath}]` : question,
        question_type: questionType,
        church_id: churchId  // <-- This is NULL
    };

    const { data, error } = await supabaseClient
        .from('user_questions')
        .insert([questionData])  // Inserting with church_id = null
        .select()
        .single();

    if (error) throw error;
    return data;
}
```

### Step 3: The Database Constraint
**File**: `database/migration-to-multitenant.sql`
```sql
ALTER TABLE user_questions ADD COLUMN IF NOT EXISTS church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
```

**Problem**: The migration added `church_id` column but did NOT add `NOT NULL` constraint initially. However, subsequent ALTER statements set NOT NULL on other tables but the exact status of `user_questions.church_id` constraint needs verification.

### Step 4: The RLS Policy
**File**: Check current RLS policies on user_questions table

The RLS policy for INSERT likely requires:
```sql
CREATE POLICY "Anyone can submit questions in their church" ON user_questions
    FOR INSERT WITH CHECK (
        church_id IN (SELECT church_id FROM users WHERE id = auth.uid())
    );
```

**Problem**: When inserting with `church_id = null`:
1. The foreign key constraint allows null (since no `NOT NULL` was set)
2. BUT the RLS policy check fails because:
   - `null IN (SELECT church_id ...)` always evaluates to `NULL` (not TRUE)
   - The policy denies the insert
3. This results in a 400 Bad Request error

## Why This Happens

The Supabase REST API returns **400 Bad Request** when:
- RLS policy denies the operation (not 403 Forbidden like you might expect)
- This is because the client doesn't know the true reason

## The Architecture Problem

The current design has a fundamental mismatch:

**Original (Pre-Migration)**:
- user_questions had no church_id column
- Super admins could submit platform-wide questions/feedback without church context
- This worked fine

**After Migration**:
- ALL tables now require church_id for RLS isolation
- Super admin questions are now "orphaned" - they have no church
- The RLS policy doesn't allow null church_id

## Solution Options

### Option A: Assign Super Admin Questions to a Default Church ✅ RECOMMENDED
- Super admin questions default to Trinity Church (church_id = '00000000-0000-0000-0000-000000000001')
- Pros: Simple, no schema changes, no RLS policy changes
- Cons: Questions appear under Trinity in the system
- Implementation: Change line 1263 to pass Trinity's UUID

### Option B: Allow Null Church IDs for Questions
- Modify RLS policy to allow `church_id IS NULL OR church_id IN (...)`
- Pros: True platform-wide questions
- Cons: More complex RLS logic, schema changes needed
- Implementation: Add NOT NULL check bypass to RLS policy

### Option C: Don't Allow Super Admin Feedback
- Remove feedback submission from super admin portal
- Pros: Simplest, no changes needed
- Cons: Super admins can't submit feedback

### Option D: Ask Super Admin Which Church
- Add dropdown to select church before submitting
- Pros: Explicit church context
- Cons: More UX complexity

## Recommendation

**Use Option A: Default to Trinity Church**

Why:
1. ✅ Simplest implementation (1 line change)
2. ✅ No database schema changes
3. ✅ No RLS policy changes
4. ✅ Questions still get tracked in the system
5. ✅ Super admin can find their feedback through Trinity's question interface
6. ✅ Follows the principle of least disruption (migration already assigns unknown records to Trinity)

### Implementation

**File**: `super-admin-portal.html:1263`

Change from:
```javascript
await API.submitQuestion(email, questionText, questionType, null, attachmentPath);
```

To:
```javascript
// Trinity Church is the default for platform-wide questions
const TRINITY_CHURCH_ID = '00000000-0000-0000-0000-000000000001';
await API.submitQuestion(email, questionText, questionType, TRINITY_CHURCH_ID, attachmentPath);
```

This way:
- Super admin questions get submitted successfully
- They're categorized under Trinity Church in the database
- Admins can view them in the Trinity Church's question dashboard
- The RLS policy passes because church_id is valid
- Future: Could implement a "platform questions" feature by modifying schema

## Testing the Fix

After implementing Option A:

1. **Verify in Browser**:
   - Open super admin portal
   - Go to question submission form
   - Submit a test question
   - Should see success message (no 400 error)

2. **Verify in Supabase**:
   ```sql
   SELECT id, email, question, church_id, created_at
   FROM user_questions
   ORDER BY created_at DESC
   LIMIT 5;
   ```
   Should show the submitted question with church_id = '00000000-0000-0000-0000-000000000001'

3. **Verify Data Appears**:
   - Go to admin portal
   - View Trinity Church's questions
   - Should see the super admin's question in the list

## Files to Modify

- `super-admin-portal.html` (line 1263)

## Related Issues to Address Later

1. **Future Enhancement**: Create a true "platform questions" table/feature separate from church-specific questions
2. **Future Enhancement**: Add church dropdown to super admin feedback form
3. **Documentation**: Update API_AUDIT_CHECKLIST.md to note this pattern
