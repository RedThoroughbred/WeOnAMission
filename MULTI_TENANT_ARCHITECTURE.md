# WeOnAMission Multi-Tenant Architecture

## Overview
WeOnAMission is a SaaS platform allowing churches to manage mission trips. Each church (tenant) has isolated data but shares the same application infrastructure.

- **Domain:** weonamission.org
- **Church URLs:** weonamission.org/{church-slug}
- **Example:** weonamission.org/trinity, weonamission.org/crossroads

---

## Core Principles

1. **Data Isolation:** Each church's data is completely isolated from others
2. **Scalability:** One database serves all churches
3. **Easy Onboarding:** New churches can sign up and be ready in minutes
4. **Multi-level Roles:** Super-admin (manages all churches), Church-admin (manages their church), Users (parent/student)

---

## Database Schema Changes

### New Table: `churches`
```sql
CREATE TABLE churches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,                    -- "Trinity Church"
    slug TEXT NOT NULL UNIQUE,             -- "trinity" or "trinitychurch"
    description TEXT,
    website TEXT,

    -- Admin who manages this church
    admin_user_id UUID REFERENCES users(id),

    -- Church-specific settings
    settings JSONB DEFAULT '{}'::jsonb,   -- {
                                            --   "logo": "url",
                                            --   "primaryColor": "#1976d2",
                                            --   "tripName": "Peru 2026",
                                            --   "tripCost": 2500
                                            -- }

    -- Status
    status TEXT DEFAULT 'active',          -- active, suspended, archived

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Updated Tables: Add `church_id` Column
Add this column to ALL data tables:

```sql
-- For each table, add:
ALTER TABLE students ADD COLUMN church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE payments ADD COLUMN church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE payment_config ADD COLUMN church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE documents ADD COLUMN church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE trip_memories ADD COLUMN church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE events ADD COLUMN church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE resources ADD COLUMN church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE user_questions ADD COLUMN church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE question_responses ADD COLUMN church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE faqs ADD COLUMN church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE content_items ADD COLUMN church_id UUID REFERENCES churches(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_students_church_id ON students(church_id);
CREATE INDEX idx_payments_church_id ON payments(church_id);
CREATE INDEX idx_documents_church_id ON documents(church_id);
CREATE INDEX idx_trip_memories_church_id ON trip_memories(church_id);
CREATE INDEX idx_events_church_id ON events(church_id);
CREATE INDEX idx_resources_church_id ON resources(church_id);
CREATE INDEX idx_user_questions_church_id ON user_questions(church_id);
CREATE INDEX idx_question_responses_church_id ON question_responses(church_id);
CREATE INDEX idx_faqs_church_id ON faqs(church_id);
CREATE INDEX idx_content_items_church_id ON content_items(church_id);
```

### Updated: `users` Table
Add church affiliation:

```sql
ALTER TABLE users ADD COLUMN church_id UUID REFERENCES churches(id) ON DELETE CASCADE;
ALTER TABLE users ADD COLUMN is_super_admin BOOLEAN DEFAULT false;

CREATE INDEX idx_users_church_id ON users(church_id);
```

---

## User Roles & Permissions

### Role Hierarchy
```
Super Admin (manages all churches) [SET IN DATABASE]
  ↓
Church Admin (manages their church) [SET IN DATABASE]
  ↓
User Roles (parent, student, admin) [SET IN DATABASE]
```

### Role Definitions

**Super Admin**
- Access to entire system
- Can create/edit/delete churches
- Can manage any user
- Access to master admin dashboard

**Church Admin**
- Manages only their church
- Can manage all users in their church
- Can edit church settings
- Cannot see other churches' data

**Parent**
- See only their own students
- Manage payments, documents for their students
- View church calendar and resources

**Student**
- Submit trip memories
- View approved memories
- Submit questions

**Regular User (Anonymous)**
- View public calendar and resources
- Submit questions
- Cannot access church portals

---

## Frontend Architecture

### Tenant Detection
```javascript
// Detect church from URL: weonamission.org/trinity/parent-portal
const churchSlug = window.location.pathname.split('/')[1];
// Result: "trinity"
```

### URL Structure
```
weonamission.org/                              // Landing page
weonamission.org/{church-slug}/                // Church home page
weonamission.org/{church-slug}/login           // Church login
weonamission.org/{church-slug}/parent-portal   // Church parent portal
weonamission.org/{church-slug}/student-portal  // Church student portal
weonamission.org/{church-slug}/admin-portal    // Church admin portal
```

### Key Responsibilities
1. **Detect church from URL** on every page load
2. **Pass church_id to all API calls**
3. **RLS policies automatically filter by church_id**
4. **Redirect to correct church if user navigates to wrong one**

---

## API Layer Changes

### Current
```javascript
async getStudents() {
    const { data } = await supabaseClient
        .from('students')
        .select('*')
        .eq('parent_id', user.id);
    return data;
}
```

### Multi-Tenant
```javascript
async getStudents(churchId) {
    const { data } = await supabaseClient
        .from('students')
        .select('*')
        .eq('church_id', churchId)
        .eq('parent_id', user.id);
    return data;
}
```

**Every API function needs to:**
1. Accept `churchId` as parameter
2. Filter by `church_id` in the query
3. RLS policies enforce this automatically as backup

---

## Security: RLS Policies for Multi-Tenant

### Pattern for All Tables
```sql
-- For students table (example):
CREATE POLICY "Users can access their church's data" ON students
    FOR SELECT USING (
        church_id IN (
            SELECT church_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert into their church" ON students
    FOR INSERT WITH CHECK (
        church_id IN (
            SELECT church_id FROM users WHERE id = auth.uid()
        )
    );
```

This ensures:
- User can only see data from churches they're part of
- Even if someone tries to access another church's data via API, RLS blocks it
- Double-layer protection (application + database)

---

## Church Signup Flow

### Step 1: Landing Page
- User visits weonamission.org
- Sees explanation of WeOnAMission
- Clicks "Start Your Church's Trip" button

### Step 2: Church Creation
- Form asks for:
  - Church name
  - Church slug (auto-generated from name)
  - Admin email
  - Password
- Creates:
  - New church in `churches` table
  - New admin user in `users` table
  - Sets admin_user_id on church

### Step 3: Admin Dashboard
- Admin logs in
- Configures church settings:
  - Trip name, date, cost
  - Logo, colors
  - Trip location
- Can invite other admins/staff

### Step 4: Onboarding
- Pre-populate sample events, resources, FAQs
- Provide tutorial
- Ready to go!

---

## Database Triggers & Functions

### Trigger: Set church_id from user's church
When a parent creates a student, automatically set church_id:

```sql
CREATE OR REPLACE FUNCTION set_church_id_on_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Get the parent's church_id
    NEW.church_id := (SELECT church_id FROM users WHERE id = auth.uid());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER students_set_church_id BEFORE INSERT ON students
    FOR EACH ROW EXECUTE FUNCTION set_church_id_on_insert();
```

---

## Migration Plan

### Phase 1: Database Schema (Today)
1. Create `churches` table
2. Add `church_id` to all data tables
3. Add `church_id` to `users` table
4. Create RLS policies for multi-tenant

### Phase 2: Update API Layer (This Week)
1. Update all API functions to accept `churchId`
2. Add church_id to every query
3. Update RLS policies

### Phase 3: Frontend Updates (Next Week)
1. Detect church slug from URL
2. Pass churchId to all API calls
3. Update all page headers to show church name
4. Add church selector for super-admins

### Phase 4: Church Onboarding (Next Week)
1. Create landing page
2. Build church signup flow
3. Auto-create sample data
4. Set up admin dashboard

---

## Deployment

### Architecture
```
weonamission.org (Vercel)
    ├── Landing page + signup
    ├── /trinity (Trinity Church app)
    ├── /crossroads (Crossroads Church app)
    └── /[church-slug] (Dynamic church apps)
         ├── /parent-portal
         ├── /student-portal
         ├── /admin-portal
         └── /public pages

Supabase (Single project for all churches)
    ├── churches table
    ├── users table (all churches)
    ├── students table (all churches, filtered by church_id)
    ├── payments table (all churches, filtered by church_id)
    └── ... all other tables with church_id
```

### Environment Variables
```
VITE_SUPABASE_URL=https://sqcdgvvjojgrwsdajtuq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...
```

No secrets needed in frontend - RLS + auth handles security

---

## Next Steps

1. **Create `churches` table** in Supabase
2. **Add `church_id` columns** to all tables
3. **Create RLS policies** for multi-tenant isolation
4. **Update `config.js`** to pass church context
5. **Refactor API functions** to accept churchId
6. **Update pages** to detect and use church slug
7. **Test isolation** (try accessing another church's data - should fail)
8. **Build signup flow** for new churches
9. **Deploy to Vercel**

---

## Testing Checklist

- [ ] Trinity admin can see only Trinity students
- [ ] Crossroads admin can see only Crossroads students
- [ ] Trinity parent cannot see Crossroads data
- [ ] RLS prevents direct database access to other churches
- [ ] Church slug detection works on all URLs
- [ ] Super admin can see all churches
- [ ] New church creation works end-to-end
- [ ] Sample data populates for new church
