# WeOnAMission 🚀

**A beautiful, easy-to-use platform for churches to manage mission trips.**

Multi-tenant SaaS built with vanilla JavaScript, Supabase, and love ❤️

---

## ✨ Features

- 👥 **Multi-tenant** - Unlimited churches, complete data isolation
- 🎯 **Admin Promotion UI** - One-click (no SQL!)
- 📱 **Mobile-first** - Works great on phones
- 📄 **Document Management** - Upload, approve, reject
- 💰 **Payment Tracking** - Know who paid what
- 📅 **Event Calendar** - Keep everyone informed
- 🎤 **Q&A System** - Parents ask, admins answer
- 📝 **Content Management** - FAQs, packing lists, guides

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/RedThoroughbred/WeOnAMission.git
cd WeOnAMission

# 2. Configure
cp config.example.js config.js
# Edit config.js with your Supabase credentials

# 3. Setup database
# Go to Supabase SQL Editor
# Run: database/schema.sql
# Then: database/SIMPLE_FIX.sql

# 4. Run
python -m http.server 8000

# 5. Open
http://localhost:8000/landing.html
```

---

## 📚 Documentation

See [`docs/`](docs/) directory for:

- **[NON_TECHNICAL_USER_GUIDE.md](docs/NON_TECHNICAL_USER_GUIDE.md)** - Simple overview (start here!) ⭐
- **[COMPREHENSIVE_TESTING_GUIDE.md](docs/COMPREHENSIVE_TESTING_GUIDE.md)** - Full 2-3 hour test
- **[SYSTEM_OVERVIEW.md](docs/SYSTEM_OVERVIEW.md)** - Complete architecture
- **[QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md)** - Cheat sheet
- **[CHURCH_ONBOARDING_FLOW.md](docs/CHURCH_ONBOARDING_FLOW.md)** - Setup process
- **[DOCUMENTATION_INDEX.md](docs/DOCUMENTATION_INDEX.md)** - All docs listed

And 16 more guides...

---

## 🏗️ Project Structure

```
WeOnAMission/
├─ *.html              # 10 portal pages (all multi-tenant)
├─ *.js                # api.js, auth.js, tenant.js
├─ styles.css          # Modern design system
├─ config.example.js   # Configuration template
│
├─ docs/               # 22 comprehensive guides
│  ├─ NON_TECHNICAL_USER_GUIDE.md
│  ├─ COMPREHENSIVE_TESTING_GUIDE.md
│  ├─ SYSTEM_OVERVIEW.md
│  └─ (19 more...)
│
├─ database/           # SQL files
│  ├─ schema.sql
│  ├─ migration-to-multitenant.sql
│  ├─ SIMPLE_FIX.sql
│  └─ (5 more...)
│
└─ tests/              # Test files
   ├─ test-supabase.html
   ├─ test-supabase-simple.html
   └─ demo.html
```

---

## 🔐 Architecture

**Single codebase. Unlimited churches. Complete isolation.**

- Frontend: Vanilla JS (no dependencies)
- Backend: Supabase (PostgreSQL + Auth + Storage)
- Hosting: Static (Vercel/Netlify)
- Security: RLS policies + application-level filtering

---

## 📖 Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Database:** PostgreSQL with Row-Level Security
- **Hosting:** Vercel or Netlify

---

## 🎯 For Your Brother

If you're showing this to your brother:

1. Read [docs/SYSTEM_OVERVIEW.md](docs/SYSTEM_OVERVIEW.md) - Full architecture
2. Try [docs/COMPREHENSIVE_TESTING_GUIDE.md](docs/COMPREHENSIVE_TESTING_GUIDE.md) - Test everything
3. Setup locally and click around!

---

## 📁 Database Setup

Run these in Supabase SQL Editor:

1. `database/schema.sql` - Create tables and structure
2. `database/SIMPLE_FIX.sql` - Fix common issues
3. Done!

---

## 🚀 Deploy

Connect this repo to Vercel/Netlify for automatic deployments.

---

## 📞 Questions?

- 📖 Read the [docs/](docs/) - we have comprehensive guides
- 🧪 Follow [docs/COMPREHENSIVE_TESTING_GUIDE.md](docs/COMPREHENSIVE_TESTING_GUIDE.md)
- 📝 Check [docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) for quick lookup

---

**Built with ❤️ for churches**
