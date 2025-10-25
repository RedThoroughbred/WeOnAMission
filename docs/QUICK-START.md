# Quick Start Guide

## What's Been Built

### ✅ Complete Files:
1. **Database Schema** (`supabase/schema.sql`) - Complete database with all tables, relationships, RLS policies
2. **Storage Policies** (`supabase/storage-policies.sql`) - Secure file upload policies
3. **API Helpers** (`api.js`) - All Supabase operations wrapped in easy functions
4. **Auth Helpers** (`auth.js`) - Authentication utilities and helper functions
5. **Login Page** (`login.html`) - Complete sign in/sign up functionality
6. **Parent Portal** (`parent-portal.html`) - Full-featured portal with:
   - View/add students
   - Upload documents
   - View payment status
   - Manage student information

### 🚧 Still Needed (You can build these):
1. **Student Portal** (`student-portal.html`) - For students to submit photos/notes
2. **Admin Dashboard** (`admin-portal.html`) - For coordinators to manage everything
3. **Public Landing Page** (`index.html`) - Josh's existing HTML adapted for Supabase
4. **Shared Styles** (`styles.css`) - Common styles across pages

## Getting Started (30 minutes)

### Step 1: Set Up Supabase (10 min)
1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project (name it, choose password, select region)
3. Wait ~2 minutes for project to be ready
4. Go to SQL Editor → New Query
5. Copy/paste entire contents of `supabase/schema.sql`
6. Click "Run" - this creates all your tables
7. Go to Storage → Create these 3 buckets:
   - `documents` (private)
   - `trip-photos` (private)
   - `resources` (public)
8. Go to SQL Editor → New Query
9. Copy/paste entire contents of `supabase/storage-policies.sql`
10. Click "Run" - this sets up upload permissions

### Step 2: Configure Your Site (5 min)
1. Go to Supabase project → Settings → API
2. Copy your `Project URL` and `anon public` key
3. Copy `config.example.js` to `config.js`
4. Paste your Supabase URL and key into `config.js`
5. Update trip details (name, dates, destination, etc.)

### Step 3: Create First Admin User (5 min)
1. In Supabase → Authentication → Users
2. Click "Add User"
3. Enter email and password
4. Go to SQL Editor → New Query
5. Run this (replace with your email):
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your-admin@email.com';
   ```

### Step 4: Test Locally (5 min)
1. Open `login.html` in a browser (or use Live Server in VS Code)
2. Try signing in with your admin account
3. You should be redirected to parent portal (it works for now)
4. Try adding a student
5. Try uploading a document

### Step 5: Deploy to Vercel (5 min)
1. Push to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Deploy (automatic!)
5. Done!

## What to Build Next

### Priority 1: Student Portal
Create `student-portal.html` where students can:
- Submit trip photos
- Write notes/reflections
- View their submissions
- See if they've been approved

Use `parent-portal.html` as a template - you can copy most of the structure!

### Priority 2: Admin Dashboard  
Create `admin-portal.html` where admins can:
- See all students and payment status
- Approve/reject documents
- Approve/reject trip memories
- Add events and resources
- Export data

### Priority 3: Public Landing Page
Adapt Josh's existing HTML to:
- Remove Quickbase references
- Pull events from Supabase using `API.getEvents()`
- Pull resources from Supabase using `API.getResources()`
- Add "Login" button to header

## Tips

### Using the API
All database operations are in `api.js`. Examples:

```javascript
// Get current user
const user = await API.getCurrentUser();

// Get all students (for admin)
const students = await API.getAllStudents();

// Upload a file
await API.uploadDocument(studentId, file, 'passport');

// Add a payment
await API.addPayment(studentId, 500.00, '2025-12-01', 'deposit');
```

### Authentication
Use `Auth.initializePage()` at the start of every portal page:

```javascript
// In parent portal
const user = await Auth.initializePage('parent');

// In admin portal  
const user = await Auth.initializePage('admin');
```

### File Uploads
Already implemented in parent portal - copy that code for student portal!

## Need Help?

All the database operations are already written in `api.js`. Just call the functions!

Check the parent portal for examples of:
- Loading data
- Uploading files
- Displaying students
- Handling forms

Good luck! 🚀
