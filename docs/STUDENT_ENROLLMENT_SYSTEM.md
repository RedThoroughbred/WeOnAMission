# Student Enrollment System Design

## Problem Statement

**Current workflow (broken):**
```
Parent creates student record
  → Parent gives student login info somehow
  → Student creates own account separately
  → Two separate entities, no link between them
  → Student can't see their own data
  → Confusing for everyone
```

**New workflow (what we need):**
```
Parent adds student name to trip
  → Parent clicks "Send Invite"
  → Student receives email with invite link
  → Student clicks link, creates account
  → System automatically links them
  → Student logs in and sees trip info
  → Parent sees confirmation
```

---

## Implementation Plan

### Phase 1: Database Schema (30 minutes)

Add table to track invites:

```sql
-- Create student_invites table
CREATE TABLE student_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE,

    -- Invite details
    invite_token VARCHAR(64) NOT NULL UNIQUE,  -- Random 64-char token
    student_email VARCHAR(255) NOT NULL,       -- Email invite is sent to

    -- Status
    status VARCHAR(20) DEFAULT 'pending',      -- pending, accepted, expired

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
    accepted_at TIMESTAMP,

    -- Indexes for fast lookup
    INDEX idx_token (invite_token),
    INDEX idx_student (student_id),
    INDEX idx_church (church_id)
);
```

### Phase 2: Parent UI - Send Invite (1 hour)

**Where:** Parent portal, Students tab

**Current state:**
```
Student Name: Alice Johnson
Grade: 10
[Delete Student button]
```

**New state:**
```
Student Name: Alice Johnson
Grade: 10
Status: [No account yet] [Send Invite] button
--OR--
Status: [Account linked] ✓
```

**What happens when parent clicks "Send Invite":**
1. Show form with student's email
2. Parent enters email (alice.johnson@email.com)
3. Parent clicks "Send"
4. System generates random token
5. Email sent to alice.johnson@email.com with link:
   ```
   https://yourdomain.com/student-signup.html?invite=abc123def456...
   ```
6. Button changes to "Invite Sent ✓"

**HTML to add in parent-portal.html:**
```html
<div class="student-card">
    <!-- ... existing student info ... -->

    <!-- NEW: Invite section -->
    <div class="student-invite-section" id="invite-${studentId}">
        <button class="btn btn-secondary" onclick="showInviteForm('${studentId}')">
            Send Invite to Student
        </button>
    </div>
</div>

<!-- Invite modal -->
<div id="inviteModal" class="modal">
    <div class="modal-content">
        <div class="modal-header">
            <h3>Invite Student to Create Account</h3>
            <button class="modal-close" onclick="closeInviteModal()">×</button>
        </div>
        <form onsubmit="submitInvite(event)">
            <div class="form-group">
                <label for="inviteEmail">Student Email Address</label>
                <input type="email" id="inviteEmail" required placeholder="alice@example.com">
            </div>
            <div class="form-group">
                <p class="text-muted">An invite link will be sent to this email address.</p>
            </div>
            <div style="display: flex; gap: 1rem;">
                <button type="submit" class="btn btn-primary">Send Invite</button>
                <button type="button" class="btn btn-secondary" onclick="closeInviteModal()">Cancel</button>
            </div>
        </form>
    </div>
</div>
```

**JavaScript to add:**
```javascript
function showInviteForm(studentId) {
    window.currentInviteStudentId = studentId;
    document.getElementById('inviteModal').classList.add('show');
}

function closeInviteModal() {
    document.getElementById('inviteModal').classList.remove('show');
}

async function submitInvite(event) {
    event.preventDefault();

    const email = document.getElementById('inviteEmail').value;
    const studentId = window.currentInviteStudentId;

    try {
        Button.setLoading('submitBtn');

        const result = await API.sendStudentInvite(studentId, email, churchId);

        Notify.success('Invite sent to ' + email);
        closeInviteModal();

        // Update UI to show "Invite sent"
        document.getElementById(`invite-${studentId}`).innerHTML =
            `<p class="text-muted">✓ Invite sent to ${email}</p>`;

    } catch (error) {
        ErrorHandler.handleError(error, 'sending invite');
    } finally {
        Button.setLoading('submitBtn', false);
    }
}
```

---

### Phase 3: Student Signup Page with Invite (1.5 hours)

**New page:** `student-signup.html`

**How it works:**
1. Student clicks invite link from email
2. Lands on special signup page with invite token in URL
3. Page pre-fills with student info (name, email)
4. Student creates password and signs up
5. System links new account to student record

**URL format:**
```
https://yourdomain.com/student-signup.html?invite=abc123def456&church=trinity
```

**Workflow:**
```
1. Page loads
2. Extract token from URL
3. Query: "Is this token valid?"
4. If valid: show student name, ask for password
5. If invalid: show "Invalid invite link"
6. Student enters password
7. Click "Create Account"
8. System creates auth account with role='student'
9. System creates user profile with student_id link
10. System marks invite as accepted
11. Redirect to student portal
```

**HTML structure:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>Join Trip - WeOnAMission</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <div class="card" style="max-width: 500px; margin: 2rem auto;">
            <h2>Create Your Account</h2>

            <!-- Loading state -->
            <div id="loadingState" class="loading">
                Verifying your invite...
            </div>

            <!-- Invalid invite -->
            <div id="invalidState" style="display: none;">
                <div class="alert alert-error">
                    <strong>Invalid Invite Link</strong>
                    <p>This invite link is invalid or has expired. Please ask your parent to send a new invite.</p>
                </div>
            </div>

            <!-- Valid invite form -->
            <div id="formState" style="display: none;">
                <div class="alert alert-info">
                    <strong>Welcome!</strong>
                    <p id="welcomeMessage"></p>
                </div>

                <form onsubmit="handleSignup(event)">
                    <div class="form-group">
                        <label for="studentName">Your Name</label>
                        <input type="text" id="studentName" disabled style="background: #f5f5f5;">
                        <small class="text-muted">Confirmed by your parent</small>
                    </div>

                    <div class="form-group">
                        <label for="studentEmail">Email</label>
                        <input type="email" id="studentEmail" disabled style="background: #f5f5f5;">
                        <small class="text-muted">Where you received this invite</small>
                    </div>

                    <div class="form-group">
                        <label for="password">Create Password</label>
                        <input type="password" id="password" required minlength="8" placeholder="At least 8 characters">
                        <small class="text-muted">Use a strong password</small>
                    </div>

                    <div class="form-group">
                        <label for="confirmPassword">Confirm Password</label>
                        <input type="password" id="confirmPassword" required minlength="8" placeholder="Re-enter password">
                    </div>

                    <button type="submit" class="btn btn-primary btn-block">
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    </div>

    <script src="config.js"></script>
    <script src="theme.js"></script>
    <script src="utils.js"></script>
    <script src="student-signup.js"></script>
</body>
</html>
```

**JavaScript (student-signup.js):**
```javascript
let inviteData = null;

// On page load, verify invite
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const inviteToken = params.get('invite');
    const churchSlug = params.get('church');

    if (!inviteToken || !churchSlug) {
        showInvalid('Missing invite information');
        return;
    }

    try {
        // Verify invite token
        inviteData = await API.verifyStudentInvite(inviteToken, churchSlug);

        // Show form with pre-filled data
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('formState').style.display = 'block';

        document.getElementById('studentName').value = inviteData.student_name;
        document.getElementById('studentEmail').value = inviteData.student_email;
        document.getElementById('welcomeMessage').textContent =
            `Welcome, ${inviteData.student_name}! Create your account to join the trip.`;

    } catch (error) {
        showInvalid('Invalid or expired invite link');
        console.error('Invite verification failed:', error);
    }
});

function showInvalid(message) {
    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('invalidState').style.display = 'block';
}

async function handleSignup(event) {
    event.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        Notify.error('Passwords do not match');
        return;
    }

    // Validate password strength
    if (password.length < 8) {
        Notify.error('Password must be at least 8 characters');
        return;
    }

    try {
        Button.setLoading('submitBtn');

        // Sign up with Supabase
        const { data, error } = await supabaseClient.auth.signUp({
            email: inviteData.student_email,
            password: password,
            options: {
                data: {
                    full_name: inviteData.student_name,
                    role: 'student'
                }
            }
        });

        if (error) throw error;

        // Accept the invite and link student
        await API.acceptStudentInvite(inviteData.invite_id, data.user.id);

        Notify.success('Account created successfully!');

        // Wait 2 seconds then redirect to student portal
        setTimeout(() => {
            window.location.href = `/student-portal.html?church=${inviteData.church_slug}`;
        }, 2000);

    } catch (error) {
        ErrorHandler.handleError(error, 'creating account');
    } finally {
        Button.setLoading('submitBtn', false);
    }
}
```

---

### Phase 4: API Functions (1 hour)

Add these functions to `api.js`:

```javascript
// Send student invite
async sendStudentInvite(studentId, studentEmail, churchId) {
    const user = await this.getCurrentUser();
    const inviteToken = this.generateRandomToken(64);

    const { data, error } = await supabaseClient
        .from('student_invites')
        .insert([{
            student_id: studentId,
            parent_id: user.id,
            church_id: churchId,
            invite_token: inviteToken,
            student_email: studentEmail,
            status: 'pending'
        }])
        .select()
        .single();

    if (error) throw error;

    // Send email (using Supabase functions or external service)
    // For now: just return the invite token
    return data;
},

// Verify invite token
async verifyStudentInvite(inviteToken, churchSlug) {
    const { data: invite, error } = await supabaseClient
        .from('student_invites')
        .select(`
            id,
            invite_token,
            student_id,
            status,
            expires_at,
            students (
                id,
                full_name
            ),
            churches (
                id,
                name,
                slug
            )
        `)
        .eq('invite_token', inviteToken)
        .eq('churches.slug', churchSlug)
        .single();

    if (error) throw new Error('Invalid invite token');

    // Check if expired
    if (new Date(invite.expires_at) < new Date()) {
        throw new Error('Invite has expired');
    }

    // Check if already accepted
    if (invite.status !== 'pending') {
        throw new Error('Invite already used');
    }

    return {
        invite_id: invite.id,
        student_id: invite.student_id,
        student_name: invite.students[0].full_name,
        student_email: invite.student_email,
        church_slug: invite.churches[0].slug,
        church_id: invite.churches[0].id
    };
},

// Accept invite and link student
async acceptStudentInvite(inviteId, userId) {
    // Update invite to accepted
    const { error: updateError } = await supabaseClient
        .from('student_invites')
        .update({
            status: 'accepted',
            accepted_at: new Date()
        })
        .eq('id', inviteId);

    if (updateError) throw updateError;

    // Link student to user account
    const { error: linkError } = await supabaseClient
        .from('students')
        .update({ user_id: userId })
        .eq('id', inviteId);

    if (linkError) throw linkError;
},

// Helper: generate random token
generateRandomToken(length = 64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}
```

---

### Phase 5: Email Integration (1-2 hours, optional for MVP)

For MVP, we can skip actual emails and just show the link in the UI.

**For production, integrate with:**
- Supabase email (free 50/month)
- SendGrid
- Resend
- AWS SES

**Email template:**
```
Subject: You're Invited to Join the Trip!

Hi [STUDENT_NAME],

[PARENT_NAME] has invited you to join the [CHURCH_NAME] mission trip!

Click the link below to create your account:
[INVITE_LINK]

This link expires in 7 days.

Questions? Contact [PARENT_EMAIL]
```

---

## Database Changes Needed

### 1. Add students table field
```sql
ALTER TABLE students ADD COLUMN user_id UUID REFERENCES users(id);
```

### 2. Create invites table
```sql
CREATE TABLE student_invites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    church_id UUID REFERENCES churches(id) ON DELETE CASCADE NOT NULL,
    invite_token VARCHAR(64) NOT NULL UNIQUE,
    student_email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
    accepted_at TIMESTAMP,
    CONSTRAINT valid_status CHECK (status IN ('pending', 'accepted', 'expired')),
    INDEX idx_token (invite_token),
    INDEX idx_student (student_id),
    INDEX idx_church (church_id)
);
```

---

## Timeline

- **Phase 1 (DB):** 30 minutes
- **Phase 2 (Parent UI):** 1 hour
- **Phase 3 (Signup Page):** 1.5 hours
- **Phase 4 (API):** 1 hour
- **Phase 5 (Testing):** 1 hour

**Total: ~5 hours** for complete implementation

---

## How It Will Work After Implementation

### Parent's Perspective
1. Create student: "Alice Johnson, Grade 10"
2. See: "No account yet" with "Send Invite" button
3. Click button, enter email: alice.johnson@email.com
4. System says "Invite sent!"
5. Alice gets email with link
6. Alice clicks link, creates account
7. Parent sees "✓ Account linked" with Alice's name

### Student's Perspective
1. Receive email with invite link
2. Click link (or copy/paste)
3. Land on special signup page
4. See "Welcome Alice! Create your account"
5. Enter password
6. Click "Create Account"
7. Instantly logged in, see student portal

### Result
- ✅ Student account created
- ✅ Linked to student record
- ✅ Can log in anytime
- ✅ Parent has confirmation
- ✅ Clear, intuitive flow

---

## Questions?

This is the MVP version. Future enhancements could include:
- Email verification
- Bulk invite import
- Resend invite if not opened
- Guardian approval workflow
- Multiple parents per student

Should we build this?
