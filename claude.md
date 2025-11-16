# Claude Context Document - Mission Trip Platform

## Project Overview

This is a **multi-tenant SaaS platform** for coordinating student volunteer/mission trips across multiple churches. Each church gets its own separate instance with its own events, FAQs, resources, and user management.

**Tech Stack**: React 18.2 + Vite 5.0 + Supabase (PostgreSQL database, authentication, file storage)

**Architecture**:
- Modern React SPA with React Router for navigation
- Multi-tenant with row-level isolation using `church_id` on all tables
- Context-based state management (AuthContext, TenantContext, ThemeContext)
- Component-based UI with Tailwind CSS + custom components

**Target Users**:
- **Super Admins** (Platform): Create churches, promote church admins, manage platform
- **Church Admins**: Manage events, FAQs, resources, approve documents and memories
- **Parents**: Register students, upload documents, view payment status, track student progress
- **Students**: Submit trip photos and notes for a trip memory book

**Key Features**:
- Multi-church support (Trinity, Crossroads, etc.) - each completely isolated
- Question submission system with admin dashboard
- Content management (FAQs, packing lists, Spanish phrases)
- Event calendar and resource management
- Parent/student portals with role-based access
- Document upload and approval workflow
- Payment tracking and management

**Deployment**: Vite build → Static hosting (Vercel/Netlify) with Supabase backend

## Project Status

### ✅ Complete & Production Ready

**React Migration (Current Version):**
- **Framework**: React 18.2 with Vite 5.0 build tool
- **Routing**: React Router v6.20.0 for SPA navigation
- **State Management**: Context API (AuthContext, TenantContext, ThemeContext)
- **Styling**: Tailwind CSS 3.3 with custom design system
- **Components**: Reusable UI components (Button, Card, Input, etc.)
- **Build**: ES modules with code splitting (React vendor, Supabase vendor, Query vendor)

**Multi-Tenant Infrastructure:**
- Database schema with 12+ tables, all with `church_id` isolation
- RLS policies for multi-tenant data isolation
- Storage buckets with security policies
- Complete API service (`src/services/api.js`) with 90+ functions including church-aware queries
- Church context detection system (TenantContext) - detects church from user profile
- Multi-tenant routing throughout all pages with role-based access control

**Portal Pages (React Components):**
- **Landing Page** (`src/pages/Landing.jsx`) - Shows all available churches
- **Login Page** (`src/pages/Login.jsx`) - Church-aware authentication with Supabase
- **Parent Portal** (`src/pages/parent/*`) - Student management, documents, payments
  - ParentDashboard, Students, Payments, Documents
- **Student Portal** (`src/pages/student/*`) - Submit memories and view events
  - StudentDashboard, TripMemories
- **Admin Portal** (`src/pages/admin/*`) - Comprehensive management dashboard
  - AdminDashboard, AdminStudents, AdminPayments, AdminDocuments
  - AdminEvents, AdminMemories, AdminQuestions, AdminSettings
  - **AdminUsers** (NEW) - User management with mobile-responsive design
  - ContentManagement
- **Super Admin Portal** (`src/pages/superadmin/*`) - Platform management
  - SuperAdmin, Churches, Users, Settings

**Recent Fixes & Features (Latest Session - 2025-11-15):**
- 💰 **Payment System Connected** - Parent payment form now saves to database using real API
  - Loads actual student data with payment summaries from Supabase
  - `api.addPayment()` saves payments permanently to database
  - Automatic recalculation of totals and balances after payment submission
  - Parents can track payment history with real-time updates
  - Admin payment dashboard shows all payments across students
- 📋 **Admin Dashboard Updates** - Changed "Review Documents" to "Review Questions"
  - Better reflects the Q&A workflow where admins respond to user questions
  - Updated both header buttons and quick actions section
  - Uses MessageSquare icon for consistency
- 🐛 **Mobile Layout Fixes** - Fixed resource button overflow on mobile devices
  - AdminResources page now uses same responsive layout as Events
  - Buttons properly contained within card boundaries on all screen sizes
  - Applied `flex flex-col sm:flex-row` pattern for mobile-first design
- ✅ **Parent Management** - Added edit/delete functionality to AdminParents
  - Edit parent details (name, email, phone)
  - Delete parents with confirmation dialog
  - Matches functionality of AdminStudents page
  - Mobile-responsive card and desktop table views

**Previous Session Features:**
- ✨ **Question Submission System** - Red question mark (❓) button on all portals
- 📎 **File Attachment Support** - Users can upload files with questions, max 5MB
- 🖼️ **Image Preview Modal** - Images display in fullscreen modal with download/open options
- 📱 **Mobile-Optimized** - Complete mobile responsiveness across all portals
- 🔧 **Centralized Upload Logic** - File uploads handled via `API.uploadFile()`
- 🎨 **Header Standardization** - Consistent 70px min-height on mobile with 44px touch targets
- 🌓 **Dark Mode Support** - Complete dark theme support across all dashboard pages

**Previous Additions:**
- Admin promotion system - One-click UI buttons to promote/demote users (replaces manual SQL)
- Question management dashboard with responses and FAQ conversion
- Content management interface for FAQs and site content
- Multi-church user management in super admin portal
- Theme toggle (light/dark mode) on all admin pages
- Trip memories with photo uploads and admin approval

### 🎯 Next Steps (Optional Enhancements)
- Email notifications for question responses and approvals
- SMS reminders for upcoming events and payment deadlines
- Payment processing integration (Stripe for direct payments)
- Bulk operations (bulk approve documents, bulk upload resources)
- Advanced search/filter functionality for admins
- Data export to Excel/PDF for reports
- Calendar integration (Google Calendar, iCal export)
- Message/communication system between admins and parents

## Architecture

### Multi-Tenant Data Model

```
┌─────────────────────────────────────────────────────────┐
│  Frontend (Static HTML/CSS/JS)                          │
│  ├── Landing page (lists all churches)                  │
│  ├── Church-aware login/signup                          │
│  ├── Portals (parent/student/admin/super-admin)         │
│  └── Church context detection (tenant.js)               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  Supabase Backend (Single Database, Multiple Churches)  │
│  ├── PostgreSQL Database                                │
│  │   ├── churches table (Trinity, Crossroads, etc.)     │
│  │   ├── users (with church_id + role isolation)        │
│  │   ├── students (with church_id)                      │
│  │   ├── payments (with church_id)                      │
│  │   ├── events, resources, FAQs (with church_id)       │
│  │   └── 12+ tables, all with church_id                 │
│  │                                                       │
│  ├── Authentication (Supabase Auth)                     │
│  │   └── Automatic user creation trigger                │
│  │                                                       │
│  └── File Storage                                       │
│      ├── documents bucket (private, church-isolated)    │
│      ├── trip-photos bucket (private)                   │
│      └── resources bucket (public)                      │
└─────────────────────────────────────────────────────────┘
```

### Church Isolation

Each church is **completely isolated**:
- Trinity users can only see Trinity data
- Crossroads users can only see Crossroads data
- Data isolation at database level (church_id on every table)
- RLS policies enforce multi-tenant boundaries
- Same backend serves infinite churches

## File Structure

```
WeOnAMission/
├── public/                         # Static assets
│   ├── config.js                   # Public configuration (Supabase URL/key, default settings)
│   └── vite.svg                    # Vite logo
│
├── src/                            # React application source
│   ├── components/                 # Reusable React components
│   │   ├── layout/
│   │   │   ├── PortalLayout.jsx    # Main layout wrapper
│   │   │   ├── PortalHeader.jsx    # Header with menu toggle
│   │   │   └── PortalSidebar.jsx   # Role-based navigation
│   │   └── ui/                     # UI components (Button, Card, Input, etc.)
│   │       └── index.js            # Component exports
│   │
│   ├── contexts/                   # React Context providers
│   │   ├── AuthContext.jsx         # Authentication state
│   │   ├── TenantContext.jsx       # Church/tenant detection
│   │   └── ThemeContext.jsx        # Dark/light mode
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.js              # Auth context hook
│   │   └── useTenant.js            # Tenant context hook
│   │
│   ├── lib/                        # Utility libraries
│   │   ├── config.js               # Supabase client initialization
│   │   ├── supabaseConfig.ts       # Hardcoded Supabase credentials
│   │   ├── queryClient.js          # React Query configuration
│   │   └── utils.js                # Helper utilities (cn, etc.)
│   │
│   ├── pages/                      # Page components (routes)
│   │   ├── Landing.jsx             # Church selection page
│   │   ├── Login.jsx               # Authentication page
│   │   ├── Home.jsx                # Role-based home redirect
│   │   ├── parent/                 # Parent portal pages
│   │   │   ├── ParentDashboard.jsx
│   │   │   ├── Students.jsx
│   │   │   ├── Payments.jsx
│   │   │   └── Documents.jsx
│   │   ├── student/                # Student portal pages
│   │   │   ├── StudentDashboard.jsx
│   │   │   └── TripMemories.jsx
│   │   ├── admin/                  # Admin portal pages
│   │   │   ├── AdminPortal.jsx     # Redirects to dashboard
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminStudents.jsx   # Student management with edit
│   │   │   ├── AdminUsers.jsx      # User management (NEW)
│   │   │   ├── AdminPayments.jsx
│   │   │   ├── AdminDocuments.jsx
│   │   │   ├── AdminEvents.jsx
│   │   │   ├── AdminMemories.jsx   # Trip memories with images
│   │   │   ├── AdminQuestions.jsx
│   │   │   ├── AdminSettings.jsx
│   │   │   └── ContentManagement.jsx
│   │   └── superadmin/             # Super admin portal
│   │       ├── SuperAdmin.jsx
│   │       ├── Churches.jsx
│   │       ├── Users.jsx           # All users across churches
│   │       └── Settings.jsx
│   │
│   ├── services/                   # API services
│   │   └── api.js                  # All Supabase operations (90+ functions)
│   │
│   ├── App.jsx                     # Main app with routing
│   ├── main.jsx                    # Entry point (NO StrictMode)
│   └── index.css                   # Tailwind CSS imports
│
├── old-vanilla-js-backup/         # Original vanilla JS version
│
├── Documentation/
│   ├── README.md                   # Setup and deployment guide
│   ├── claude.md                   # This file - AI context
│   └── *.md                        # Other documentation files
│
├── Configuration Files
│   ├── package.json                # npm dependencies
│   ├── vite.config.js              # Vite build configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── postcss.config.js           # PostCSS configuration
│   └── .eslintrc.cjs               # ESLint configuration
│
└── Database
    └── schema.sql                  # Complete database schema
```

## Database Schema

### Multi-Tenant Structure

All tables include `church_id` (UUID, FK to churches) for complete isolation.

**churches** - Platform data
- `id` (UUID, primary key)
- `name` (e.g., "Trinity Church", "Crossroads Church")
- `slug` (e.g., "trinity", "crossroads" - used in URLs)
- `settings` (JSONB - trip cost, trip name, country, etc.)
- `created_at`, `updated_at`

### User Management Tables

**users** - Extends Supabase auth.users (WITH church_id)
- `id` (UUID, FK to auth.users)
- `church_id` (UUID, FK to churches) ← **KEY: Multi-tenant isolation**
- `email`, `full_name`, `phone`
- `role` (enum: 'parent', 'admin')
- `created_at`
- Note: Automatic creation on Supabase auth signup

### Trip Data Tables (All with church_id)

**students**
- `id`, `church_id` ← Multi-tenant
- `parent_id` (FK to users)
- `full_name`, `grade`, `date_of_birth`
- `emergency_contact_name`, `emergency_contact_phone`
- `medical_info`, `allergies`, `dietary_restrictions`

**payments**
- `id`, `church_id` ← Multi-tenant
- `student_id` (FK to students)
- `amount`, `payment_date`, `payment_type`, `notes`

**payment_config**
- `id`, `church_id` ← Multi-tenant
- `student_id` (FK to students)
- `total_cost` (customizable per student)

**payment_summaries** (VIEW - auto-calculated per church)
- `student_id`, `student_name`, `church_id`
- `total_paid`, `trip_cost`, `balance_due`

### Content Management Tables (All with church_id)

**documents** (uploaded by parents)
- `id`, `church_id` ← Multi-tenant
- `student_id`, `uploaded_by`
- `file_name`, `file_path`, `file_type`, `document_type`
- `status` (enum: 'pending', 'approved', 'rejected')

**trip_memories** (photos/notes from students)
- `id`, `church_id` ← Multi-tenant
- `student_id`, `title`, `content`, `photo_path`
- `status` (enum: 'pending', 'approved', 'rejected')
- `approved_by`, `approved_at`

**events** (calendar)
- `id`, `church_id` ← Multi-tenant
- `name`, `description`
- `event_date`, `event_time`, `location`
- `event_type` (enum: 'meeting', 'deadline', 'activity', 'preparation', 'travel', 'fundraiser', 'other')
- `display_on_calendar`, `created_by`

**resources** (guides, packing lists, etc.)
- `id`, `church_id` ← Multi-tenant
- `name`, `description`, `url`, `file_path`
- `resource_type` (enum: 'document', 'video', 'website', 'form', 'guide', 'other')
- `created_by`

### Content Tables (All with church_id)

**faqs**
- `id`, `church_id` ← Multi-tenant
- `question`, `answer`, `category`
- `created_by`, `created_at`

**content_items**
- `id`, `church_id` ← Multi-tenant
- `section`, `title`, `content`, `order_index`
- `created_by`, `created_at`

### Question/Support Tables (All with church_id)

**user_questions**
- `id`, `church_id` ← Multi-tenant
- `user_id`, `question_text`, `category`
- `status` (enum: 'submitted', 'pending', 'complete')
- `created_at`

**question_responses**
- `id`, `church_id` ← Multi-tenant
- `question_id`, `response_text`, `response_by`
- `can_be_faq` (boolean), `created_at`

### Row Level Security (RLS) & Multi-Tenant Isolation

All data isolated by `church_id`:

**Parent Users (role = 'parent'):**
- View/edit own students for their church
- View own payments for their church
- Upload documents for their students
- Submit trip memories for their students
- **Cannot see**: Other churches' data, other parents' students
- **Confined to**: Their assigned church

**Admin Users (role = 'admin'):**
- Manage everything for their church
- Approve/reject documents and memories
- Create events, resources, FAQs, content
- Promote/demote other users **for their church**
- View questions and provide responses
- **Cannot see**: Other churches' data
- **Confined to**: Their assigned church

**Super Admins (role = 'admin' at platform level):**
- Access Super Admin Portal
- Create new churches
- Promote/demote users across all churches
- View platform statistics
- Manage all church configurations

**Public/Unauthenticated Users:**
- View events where `display_on_calendar = true` for their church
- View resources for their church
- View public FAQs and content
- **Cannot see**: Private data, other churches

### Storage Buckets

1. **documents** (private)
   - Path: `{student_id}/{timestamp}_{filename}`
   - Parents upload, admins approve

2. **trip-photos** (private)
   - Path: `{student_id}/{timestamp}_{filename}`
   - Students/parents upload, admins approve

3. **resources** (public)
   - Admin uploads for public access

## API Patterns (api.js)

All database operations are wrapped in easy-to-use functions. Never write raw SQL or Supabase queries in HTML files.

### Common Patterns

**Authentication:**
```javascript
await API.signUp(email, password, fullName, role)
await API.signIn(email, password)
await API.signOut()
const user = await API.getCurrentUser()
```

**Students:**
```javascript
const students = await API.getMyStudents()        // Current user's students
const students = await API.getAllStudents()       // All students (admin only)
const student = await API.getStudent(studentId)
await API.createStudent(studentData)
await API.updateStudent(studentId, updates)
```

**Payments:**
```javascript
const summary = await API.getPaymentSummary(studentId)
const summaries = await API.getAllPaymentSummaries()  // Admin only
const history = await API.getPaymentHistory(studentId)
await API.addPayment(studentId, amount, date, type, notes)
```

**Documents:**
```javascript
await API.uploadDocument(studentId, file, documentType)
const docs = await API.getDocumentsForStudent(studentId)
const docs = await API.getAllDocuments()  // Admin only
await API.updateDocumentStatus(docId, 'approved', notes)
const url = await API.getDocumentUrl(filePath)
```

**Trip Memories:**
```javascript
await API.submitTripMemory(studentId, title, content, photoFile)
const memories = await API.getMemoriesForStudent(studentId)
const memories = await API.getAllMemories()  // Admin only
const approved = await API.getApprovedMemories()
await API.updateMemoryStatus(memoryId, 'approved')
const url = await API.getPhotoUrl(photoPath)
```

**Events & Resources:**
```javascript
const events = await API.getEvents()
await API.createEvent(eventData)
await API.updateEvent(eventId, updates)

const resources = await API.getResources()
await API.createResource(resourceData)
```

## Authentication Patterns (auth.js)

### Page Initialization

Every portal page should start with:

```javascript
(async function() {
    const user = await Auth.initializePage('parent');  // or 'student', 'admin'
    if (!user) return;  // User not logged in or wrong role
    
    // Load page data here
})();
```

This handles:
- Checking if user is logged in (redirects to login if not)
- Checking if user has correct role (redirects to correct portal if not)
- Setting up logout button
- Displaying user info in header

### Helper Functions

```javascript
Auth.formatDate(dateString)           // "October 23, 2025"
Auth.formatDateTime(dateString)       // "October 23, 2025, 3:45 PM"
Auth.formatCurrency(amount)           // "$2,500.00"
Auth.formatFileSize(bytes)            // "2.5 MB"
Auth.getEventTypeColor(type)          // Returns hex color
Auth.getStatusColor(status)           // Returns hex color
```

## Configuration (config.js)

Users copy `config.example.js` to `config.js` and fill in:

```javascript
const CONFIG = {
    supabase: {
        url: 'https://xxx.supabase.co',
        anonKey: 'eyJ...'
    },
    trip: {
        name: 'Peru 2026',
        destination: 'Ahuac, Peru',
        departureDate: '2026-06-26',
        returnDate: '2026-07-05'
        // ... etc
    },
    payment: {
        totalCost: 2500.00,
        depositAmount: 500.00
        // ... etc
    }
};
```

## UI/UX Patterns

### Standard Portal Structure

```html
<div class="portal-header">
    <div class="container">
        <h1>Portal Name</h1>
        <div class="user-info">
            <div class="user-details">
                <p><strong id="userName"></strong></p>
                <p id="userEmail"></p>
            </div>
            <button class="logout-btn" id="logoutBtn">Logout</button>
        </div>
    </div>
</div>

<div class="container">
    <!-- Portal content -->
</div>
```

### Standard Form Pattern

```html
<form onsubmit="handleSubmit(event)">
    <div class="form-group">
        <label>Field Name</label>
        <input type="text" id="fieldId" required>
    </div>
    <button type="submit" class="btn">Submit</button>
</form>

<script>
async function handleSubmit(event) {
    event.preventDefault();
    const value = document.getElementById('fieldId').value;
    
    try {
        await API.someOperation(value);
        alert('Success!');
        // Reload data or redirect
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
    }
}
</script>
```

### File Upload Pattern

See `parent-portal.html` for complete drag-and-drop implementation:

```javascript
async function uploadFile(studentId, file) {
    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
        alert('File too large');
        return;
    }
    
    try {
        await API.uploadDocument(studentId, file, documentType);
        await loadDocuments(studentId);  // Refresh list
        alert('Uploaded!');
    } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed');
    }
}
```

## Common Development Tasks

### Adding a New Portal Page

1. Copy structure from `parent-portal.html`
2. Update page title and header text
3. Change `Auth.initializePage()` role parameter
4. Replace content sections with your features
5. Use API functions from `api.js` for data

### Adding a New Feature

1. Check if API function exists in `api.js`
2. If not, add it following existing patterns
3. Create UI in HTML
4. Wire up with event handlers
5. Test with real Supabase connection

### Modifying Database

1. Update `supabase/schema.sql`
2. Run new SQL in Supabase SQL Editor
3. Update RLS policies if needed
4. Add/update API functions in `api.js`
5. Update UI to use new fields

### Testing Locally

1. Use VS Code Live Server or `python -m http.server`
2. Configure `config.js` with your Supabase credentials
3. Test all user flows
4. Check browser console for errors

## Code Conventions

### Naming
- Functions: `camelCase` (e.g., `loadStudents`, `handleSubmit`)
- HTML IDs: `camelCase` (e.g., `userName`, `studentsContainer`)
- CSS classes: `kebab-case` (e.g., `portal-header`, `student-card`)
- Constants: `SCREAMING_SNAKE_CASE` (e.g., `CONFIG`, `API`)

### Error Handling
Always wrap API calls in try-catch:

```javascript
try {
    await API.someOperation();
} catch (error) {
    console.error('Operation failed:', error);
    alert('Error: ' + error.message);
}
```

### Async Patterns
Use async/await, not promises with `.then()`:

```javascript
// ✅ Good
const data = await API.getData();

// ❌ Avoid
API.getData().then(data => { ... });
```

### Loading States
Show loading feedback to users:

```javascript
container.innerHTML = '<div class="loading">Loading...</div>';
const data = await API.getData();
container.innerHTML = renderData(data);
```

## Security Notes

### What's Protected
- All database operations go through RLS policies
- Parents can only see their own students
- Students can only submit for themselves
- Admins can do everything
- File uploads are scoped to student IDs

### What's Not Protected (By Design)
- Events calendar (public read)
- Resources (public read)
- Anyone can create an account (becomes a parent)

### Admin Access & Promotion

**Church Admins** (role = 'admin' for a specific church):

New users start as `role = 'parent'` when they sign up. Promotion to admin is now handled through the **Super Admin Portal**:

1. Super admin goes to: `http://weonamission.org/super-admin-portal.html`
2. Scrolls to "Manage Church Users" section
3. Selects the church
4. Clicks "Promote to Admin" button next to the user's name
5. Confirms dialog
6. User is promoted instantly!

See **ADMIN_PROMOTION_GUIDE.md** for complete documentation.

**Alternative (Legacy): Manual SQL**
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com' AND church_id = 'church-uuid';
```

**Super Admin Creation** (First time setup):
When you first deploy the platform, manually create a super admin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```
(Create user account first by signing up, then run this SQL)

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import in Vercel
3. Deploy (automatic)
4. Add environment variables (optional, can use config.js)

### Netlify
Same process as Vercel

### Important
- `config.js` should be in `.gitignore` (contains keys)
- OR use environment variables in production
- Supabase anon key is safe to expose (RLS protects data)

## Troubleshooting

### "Error loading students"
- Check Supabase connection (URL and key correct?)
- Check browser console for specific error
- Verify RLS policies are set up

### "Permission denied"
- User might not have correct role
- Check RLS policies in Supabase
- Verify user's role in users table

### "File upload failed"
- Check storage bucket exists
- Verify storage policies are set up
- Check file size (max 10MB by default)
- Verify bucket is named correctly

### "Can't fetch API"
- CORS issues: Supabase should handle this automatically
- Check network tab in browser dev tools
- Verify Supabase project is running

## Future Enhancement Ideas

When building new features, consider:
- Email notifications (Supabase supports this)
- SMS reminders (Twilio integration)
- Payment processing (Stripe)
- PDF export of trip memories
- Bulk operations for admins
- Search/filter functionality
- Data export to Excel

## Testing Checklist

Before considering a feature "done":
- [ ] Works on mobile (responsive)
- [ ] Error messages are helpful
- [ ] Loading states shown
- [ ] Success feedback provided
- [ ] Works when offline/network fails gracefully
- [ ] Console has no errors
- [ ] RLS policies tested (can't access other users' data)

## Key Design Decisions

### Why Vanilla JS?
- No build step needed
- Easy to understand and modify
- Fast to iterate
- Can add framework later if needed

### Why Supabase?
- Free tier is generous
- Handles auth, database, storage
- Built-in RLS for security
- PostgreSQL (real database)
- Easy to replicate for other churches

### Why Static Hosting?
- Free on Vercel/Netlify
- Fast (CDN)
- No server to maintain
- Scales automatically

### Why This Architecture?
- Separation of concerns (API layer)
- Easy to test each piece
- Can swap Supabase for another backend
- Reusable across pages

## Getting Help from AI Assistants

When asking for help, provide:
1. What you're trying to build
2. Which file you're working in
3. Relevant error messages
4. What you've already tried

Example: "I'm building the student portal and trying to add photo upload. I copied the pattern from parent-portal.html but getting error 'bucket not found'. Here's my code..."

## Contact

For questions about the original design:
- This codebase was architected to be self-documenting
- All patterns are demonstrated in `parent-portal.html`
- API functions are fully implemented in `api.js`
- Database schema is in `supabase/schema.sql`

Read the code - it's meant to be understood!