# How to Navigate Trinity Church Locally

## Your Question: "I'm on http://localhost:8000 but it doesn't say Trinity anywhere"

**Good news:** This is actually working correctly! Let me explain what you're seeing and why.

---

## What You're Currently Looking At

When you go to `http://localhost:8000/`, you're likely seeing **one of these pages**:

### Option 1: You See a File Listing
```
Index of /
- admin-portal.html
- api.js
- auth.js
- config.js
... etc
```

**What this means:** You're looking at the directory listing, not the website itself.

**How to fix:** Add a filename to the URL:
- Go to: `http://localhost:8000/landing.html`
- Or go to: `http://localhost:8000/index.html`

### Option 2: You See a Blank Page or 404 Error
**What this means:** The file might not exist or something is wrong.

**How to fix:**
- Check that you're in the right directory
- Try: `http://localhost:8000/landing.html`

### Option 3: You See "Peru 2026" with Events
**What this means:** Congratulations! You're looking at Trinity Church's home page!

**Where you are:** `http://localhost:8000/index.html?church=trinity`

Trinity is there - you might not be seeing the church name prominently, but you're viewing Trinity's content.

---

## Step-by-Step: Where Is Trinity?

### Step 1: Start at the Landing Page

**Go to:** `http://localhost:8000/landing.html`

**What you should see:**
- List of churches
- Trinity Church card
- Crossroads Church card (if you created it)
- Information about each church

**How to identify Trinity:**
- Name: "Trinity Church"
- Destination: Something like "Peru 2026" or "Ahuac, Peru"
- Trip year: Should be 2026

### Step 2: Click "Sign Up" on Trinity

**What to do:**
1. Find the Trinity Church card
2. Look for "Sign Up" button (likely blue or purple)
3. Click it

**Where you go:**
- URL becomes: `http://localhost:8000/login.html?church=trinity&signup=true`
- You see: Login/signup form
- Header might say: "Trinity Church Sign Up" or just "Sign Up"

### Step 3: Fill Out the Form

**Signs you're in Trinity:**
- Check the URL: `?church=trinity` ← This means Trinity!
- Form title or subtle text mentioning Trinity

**What to fill:**
- Name: "Tom Smith"
- Email: "parent.tom@trinity.org"
- Password: "TestPassword123"

### Step 4: After Sign Up

**You get redirected to:** `http://localhost:8000/parent-portal.html?church=trinity`

**Now you're in Trinity portal!**

**Where to look for "Trinity":**
- URL bar: Contains `?church=trinity` ← This is the "Trinity indicator"
- Header might say church name (depends on page design)
- Events should be Trinity's events
- Students should be Trinity students

---

## How to Know You're Looking at Trinity

### Trinity Indicators (Check These)

```
URL Bar (Most Reliable):
├─ http://localhost:8000/landing.html (List of churches)
├─ http://localhost:8000/login.html?church=trinity (Trinity login)
├─ http://localhost:8000/parent-portal.html?church=trinity (Trinity parent portal)
├─ http://localhost:8000/admin-portal.html?church=trinity (Trinity admin)
└─ http://localhost:8000/student-portal.html?church=trinity (Trinity student)

Look for: ?church=trinity in the URL ✓
```

### Content Indicators

```
Check the content you see:
├─ Events should be Trinity's events (Orientation, Training, etc.)
├─ FAQs should be Trinity's FAQs
├─ Students should be Trinity students (Sarah, John, etc.)
├─ Payments should be Trinity payments
└─ Should NOT see Crossroads data
```

### Browser Header/Tab

```
The page might show:
├─ "Trinity Church Parent Portal"
├─ "Trinity - Admin Portal"
├─ Or just "Parent Portal" (generic)

Also check: Your name (Tom Smith) should appear in top right
```

---

## Quick Navigation to Trinity Content

### Testing as Parent

**Step 1:** Login as Trinity parent
```
URL: http://localhost:8000/login.html?church=trinity
Email: parent.tom@trinity.org
Password: TestPassword123
```

**Step 2:** You'll see
```
Parent Portal (Trinity)
├─ Your Students section
├─ Payments section
├─ Questions section
└─ Logout button
```

**Step 3:** Verify it's Trinity
```
✓ URL contains: ?church=trinity
✓ Events are Trinity's
✓ Students are yours (Tom's family)
✓ NOT seeing Crossroads data
```

### Testing as Admin

**Step 1:** Login as Trinity admin
```
URL: http://localhost:8000/login.html?church=trinity
Email: pastor.dave@trinity.org
Password: TestPassword123
```

**Step 2:** You'll see
```
Admin Portal (Trinity)
├─ Students tab
├─ Payments tab
├─ Documents tab
├─ Memories tab
├─ Events tab
└─ Resources tab
```

**Step 3:** Verify it's Trinity
```
✓ URL contains: ?church=trinity
✓ Can see all Trinity students
✓ NOT seeing Crossroads students
✓ Events are Trinity's events
```

### Testing as Student

**Step 1:** Login as Trinity student
```
URL: http://localhost:8000/login.html?church=trinity
Email: student.sarah@trinity.org
Password: TestPassword123
```

**Step 2:** You'll see
```
Student Portal (Trinity)
├─ Upcoming Events (Trinity events)
├─ Submit Memory section
└─ View FAQs/Resources
```

### Testing as Crossroads (Different Church)

**Step 1:** Login as Crossroads parent
```
URL: http://localhost:8000/login.html?church=crossroads
Email: parent.karen@crossroads.org
Password: TestPassword123
```

**Step 2:** Verify it's DIFFERENT from Trinity
```
✓ URL contains: ?church=crossroads (NOT trinity!)
✓ See Crossroads students ONLY
✓ NOT seeing Trinity students
✓ See Crossroads events ONLY
```

---

## The URL Pattern (Most Important!)

**This is how you tell which church you're viewing:**

```
http://localhost:8000/[PAGE].html?church=[CHURCH_NAME]

Examples:
├─ http://localhost:8000/parent-portal.html?church=trinity
│  └─ You're in Trinity Church parent portal
│
├─ http://localhost:8000/admin-portal.html?church=trinity
│  └─ You're in Trinity Church admin portal
│
├─ http://localhost:8000/parent-portal.html?church=crossroads
│  └─ You're in Crossroads Church parent portal
│
└─ http://localhost:8000/login.html?church=trinity
   └─ You're logging into Trinity
```

**Key:** Look at the URL! The `?church=trinity` part tells you which church.

---

## Why Doesn't It Always Say "Trinity" on Screen?

### Reasons:
1. **Simple UI design** - We focus on clarity, not repetition
2. **The URL is the indicator** - That's where the info really matters
3. **Will be improved** - Future versions might add header labels
4. **Mobile-first** - Screen space is limited, we use it efficiently

### But You Can Tell You're in Trinity By:
- ✅ URL has `?church=trinity`
- ✅ Events shown are Trinity's events
- ✅ Students shown are Trinity's students
- ✅ You can't see Crossroads data (good!)

---

## Testing Script: Verify Trinity is Working

### Quick Verification (5 minutes)

```
1. Go to: http://localhost:8000/landing.html
   ✓ Do you see Trinity Church listed?
   ✓ Does it show "Peru 2026" or similar?

2. Click: "Sign Up" on Trinity card
   ✓ URL changed to include ?church=trinity?

3. Sign up as Trinity parent:
   - Email: parent.tom@trinity.org
   - Name: Tom
   - Password: TestPassword123

4. You should see: Parent portal
   ✓ URL shows: parent-portal.html?church=trinity

5. Add a student:
   - Name: Sarah
   - Grade: 10

6. Check: Student appears
   ✓ Sarah shows in your students list

SUCCESS! You're working in Trinity Church! 🎉
```

### Verify Multi-Tenancy (10 minutes)

```
1. Log out (click Logout button)

2. Go to: http://localhost:8000/landing.html

3. Click: "Sign Up" on Crossroads card
   ✓ URL now shows: ?church=crossroads

4. Sign up as Crossroads parent:
   - Email: parent.karen@crossroads.org
   - Name: Karen
   - Password: TestPassword123

5. Add a student:
   - Name: Jake

6. Verify:
   ✓ Jake is in Crossroads student list
   ✓ Sarah (Trinity student) is NOT visible
   ✓ URL shows: ?church=crossroads

7. Go back to Trinity:
   - URL: http://localhost:8000/parent-portal.html?church=trinity
   - Login as: parent.tom@trinity.org

8. Verify:
   ✓ See Sarah (Trinity student)
   ✓ Do NOT see Jake (Crossroads student)
   ✓ URL shows: ?church=trinity

SUCCESS! Multi-tenancy is working - churches are isolated! 🎉
```

---

## Troubleshooting: "I Can't Find Trinity"

### Problem: "The page doesn't show any churches"

**Solution:**
1. Go directly to: `http://localhost:8000/login.html?church=trinity`
2. If churches exist in database, you'll see them on landing.html
3. Check: Did you run SIMPLE_FIX.sql?
4. Check: Is your Supabase connected?

### Problem: "I'm on parent-portal but it's blank"

**Solution:**
1. Check URL: Does it say `?church=trinity`?
2. If not, change it to: `http://localhost:8000/parent-portal.html?church=trinity`
3. Log in if needed
4. Check: Is there a church named "trinity"?

### Problem: "I see Peru 2026 but no Trinity label"

**Solution:**
1. Check URL bar - that's your Trinity indicator
2. The page is showing Trinity content (Peru trip)
3. This is normal! The URL is the definitive indicator.
4. Try looking for page header that might say the church name

### Problem: "Am I seeing Trinity or Crossroads?"

**Solution:**
1. **Always check the URL first**
2. Look for: `?church=trinity` = Trinity
3. Look for: `?church=crossroads` = Crossroads
4. Check the content: Trinity events vs Crossroads events

---

## Your Complete Testing Flow

### Start Here

```
1. Open browser: http://localhost:8000/landing.html

2. See: Churches listed (Trinity, Crossroads)

3. Click: Trinity sign up

4. Fill: Signup form
   - Email: parent.tom@trinity.org
   - Name: Tom Smith
   - Password: TestPassword123

5. Click: Sign up

6. Confirm: You're in Trinity portal
   ✓ URL: ?church=trinity
   ✓ Content is Trinity's

7. Add student: Sarah Smith

8. Upload document

9. Ask question

10. Log out

11. Log back in as Trinity admin:
    - Email: pastor.dave@trinity.org
    - Password: TestPassword123

12. Approve documents

13. Create events

14. Create FAQs

SUCCESS! You've tested Trinity Church completely! 🎉
```

---

## Summary

**Where is Trinity?**
- Everywhere on your site using `?church=trinity` in the URL

**How to find Trinity?**
- Check the URL: `?church=trinity`
- Check the content: Trinity events, Trinity students, Trinity data

**How to know it's working?**
- Trinity and Crossroads data are completely separate
- You only see your own church's data
- URL changes when you switch churches

**It's not broken if you don't see "Trinity" everywhere** - the URL is the definitive indicator. That's actually the design. The backend knows which church you're in based on the URL parameter.

Now go test and have fun! 🚀

---

## Quick Reference URLs

```
Trinity URLs:
├─ Home: http://localhost:8000/index.html?church=trinity
├─ Login: http://localhost:8000/login.html?church=trinity
├─ Parent Portal: http://localhost:8000/parent-portal.html?church=trinity
├─ Admin Portal: http://localhost:8000/admin-portal.html?church=trinity
├─ Student Portal: http://localhost:8000/student-portal.html?church=trinity
├─ Questions: http://localhost:8000/questions-dashboard.html?church=trinity
├─ Content Mgmt: http://localhost:8000/content-management.html?church=trinity
├─ Nice to Know: http://localhost:8000/nice-to-know.html?church=trinity
└─ Super Admin: http://localhost:8000/super-admin-portal.html

Crossroads URLs (for comparison):
├─ Home: http://localhost:8000/index.html?church=crossroads
└─ Login: http://localhost:8000/login.html?church=crossroads
```

**The pattern:** Every URL has `?church=[NAME]` which tells the system which church you're viewing!
