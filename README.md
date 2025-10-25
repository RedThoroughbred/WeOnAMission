# WeOnAMission 🚀

**A beautiful, easy-to-use platform for churches to manage mission trips.**

Multi-tenant SaaS built with vanilla JavaScript, Supabase, and love ❤️

---

## ✨ What is WeOnAMission?

WeOnAMission simplifies mission trip management for churches. Coordinate students, track payments, manage documents, collect memories - all in one beautiful platform.

**Perfect for:**
- Church mission trips
- Student volunteer programs
- Any group travel coordination

**Built for:**
- Busy church admins (simple, intuitive)
- Tech-skeptical parents (no jargon, easy signup)
- Youth leaders managing trips
- Multiple churches on one platform (multi-tenant!)

---

## 🎯 Core Features

### 👥 **For Parents**
- Quick signup with church selection
- Add multiple students
- Upload documents (waivers, permission slips)
- Track trip payments
- Ask questions, get answers
- View trip calendar and info

### 🏫 **For Church Admins**
- One-click user promotion (goodbye SQL!)
- Create events and calendar
- Manage documents (approve/reject)
- Build FAQs and helpful content
- Answer parent questions
- Track student details and payments
- Approve submitted memories

### 👦 **For Students**
- View trip events and schedule
- Submit trip memories and photos
- Browse FAQs and resources
- See what to bring (packing lists)

### 🌐 **For Super Admins**
- Create and manage multiple churches
- Promote users to admin
- Platform overview and statistics
- Multi-tenant management

---

## 🚀 Quick Start

### Prerequisites
- Node.js or Python 3 (for local server)
- A Supabase account (free tier works!)
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/weonamission.git
cd weonamission
```

2. **Create config file**
```bash
cp config.example.js config.js
# Edit config.js with your Supabase credentials
```

3. **Set up Supabase**
   - Create account at [supabase.com](https://supabase.com) (free)
   - Go to SQL Editor
   - Run `schema.sql` then `SIMPLE_FIX.sql`

4. **Start local server**
```bash
python -m http.server 8000
```

5. **Open in browser**
```
http://localhost:8000/landing.html
```

**Done!** Your mission trip platform is running. 🎉

---

## 📚 Documentation

### For First-Time Users
- **[Non-Technical User Guide](NON_TECHNICAL_USER_GUIDE.md)** - Simple, no jargon ⭐
- **[How to Navigate Locally](HOW_TO_NAVIGATE_TRINITY_LOCALLY.md)** - Understanding URLs

### For Testing
- **[Comprehensive Testing Guide](COMPREHENSIVE_TESTING_GUIDE.md)** - Complete 2-3 hour test
- **[Testing Admin Promotion](TESTING_ADMIN_PROMOTION.md)** - Feature verification

### For Understanding
- **[System Overview](SYSTEM_OVERVIEW.md)** - What you're building
- **[Quick Reference](QUICK_REFERENCE.md)** - Cheat sheet
- **[Church Onboarding Flow](CHURCH_ONBOARDING_FLOW.md)** - Setup process

### For Developers
- **[Multi-Tenant Architecture](MULTI_TENANT_ARCHITECTURE.md)** - Design patterns
- **[Admin Promotion Implementation](ADMIN_PROMOTION_IMPLEMENTATION_SUMMARY.md)** - How it works
- **[Claude Context](claude.md)** - AI development context

---

## 🏗️ Architecture

**Single codebase. Infinite churches. Complete data isolation.**

```
Frontend (Vanilla JS)
    ↓
10 Responsive Pages
    ├─ Landing (church discovery)
    ├─ Login/Signup (church-aware auth)
    ├─ Parent Portal
    ├─ Admin Portal
    ├─ Student Portal
    └─ + 5 more
    ↓
Supabase Backend
    ├─ PostgreSQL (12+ tables with church_id)
    ├─ Authentication (email/password)
    └─ File Storage (documents, photos, resources)
    ↓
Static Hosting (Vercel/Netlify)
```

**Why this works:**
- ✅ Multi-tenant (serve unlimited churches)
- ✅ Scalable (serverless architecture)
- ✅ Secure (RLS policies + application filtering)
- ✅ No server maintenance
- ✅ Free tier available

---

## 🌍 Multi-Tenancy

One platform serves unlimited churches with complete isolation:

```
Trinity Church
├─ Students: Sarah, John
├─ Admin: Pastor Dave
└─ Events: Peru trip 2026

Crossroads Church
├─ Students: Jake, Alex
├─ Admin: Pastor Mark
└─ Events: Jamaica trip 2026

// Trinity users see ONLY Trinity data
// Crossroads users see ONLY Crossroads data
// Same platform, same database, complete isolation
```

---

## 📁 File Structure

```
weonamission/
├─ Pages (10 .html files)
│  └─ All multi-tenant enabled
├─ Backend (api.js, auth.js, tenant.js)
├─ Styling (styles.css - 700+ lines)
├─ Config (config.js in .gitignore)
├─ Database (schema.sql, SIMPLE_FIX.sql)
└─ Documentation (20+ .md files)
```

**Lean and clean** - No bloat, just what you need!

---

## ⚡ Key Features

- ✨ **Admin Promotion UI** - No SQL commands needed!
- ✨ **Multi-Tenant** - Unlimited churches, complete isolation
- ✨ **Mobile-First** - Works great on phones
- ✨ **Question System** - Parents ask, admins answer
- ✨ **Document Management** - Upload, approve, reject
- ✨ **Payment Tracking** - Know who paid what
- ✨ **Event Calendar** - Keep everyone informed
- ✨ **Content Management** - FAQs, packing lists, guides

---

## 🔐 Security

- ✅ Row-Level Security (RLS) on all tables
- ✅ Application-level churchId filtering
- ✅ No cross-church data access possible
- ✅ Encrypted passwords (Supabase Auth)
- ✅ Private document storage
- ✅ Role-based access control

---

## 🎯 Time Savings

| Task | Before | After | Saved |
|------|--------|-------|-------|
| Promote admin to role | 5-10 min | 30 sec | 9.5 min ⚡ |
| Church onboarding | 2.5 hours | 2 hours | 30 min ⚡ |
| Setup per church | Manual SQL | UI buttons | Hours ⚡ |

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import in Vercel
3. Connect Supabase
4. Deploy (automatic)

### Netlify

Same process as Vercel

### Environment Variables

Only needed in production:
```
SUPABASE_URL
SUPABASE_ANON_KEY
```

---

## 📖 Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** Vercel or Netlify
- **Database:** PostgreSQL with Row-Level Security

**Why vanilla JS?** No build step, no dependencies, fast iteration, easy to understand.

---

## 🤝 Contributing

Found a bug? Have an idea? We'd love your help!

1. Fork the repo
2. Create a branch (`git checkout -b feature/amazing-feature`)
3. Make changes
4. Commit (`git commit -m 'Add amazing feature'`)
5. Push (`git push origin feature/amazing-feature`)
6. Open a Pull Request

**Before contributing:**
- Read the documentation
- Follow existing code style
- Test your changes
- Update docs

---

## 📞 Support

**Need help?**

1. **Check the docs** - We have comprehensive guides!
2. **Use in-app questions** - Ask admins directly
3. **Create a GitHub issue** - Report bugs
4. **Email support** - admin@weonamission.org

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🎉 Get Started

```bash
# Clone
git clone https://github.com/yourusername/weonamission.git
cd weonamission

# Configure
cp config.example.js config.js
# Edit with your Supabase credentials

# Run
python -m http.server 8000

# Visit
http://localhost:8000/landing.html
```

**That's it!** You now have a complete mission trip platform. 🚀

---

## ⭐ Features at a Glance

- ✅ Multi-tenant architecture
- ✅ Complete data isolation by church
- ✅ Admin promotion (UI, no SQL!)
- ✅ Parent signup and student management
- ✅ Document upload and approval
- ✅ Payment tracking
- ✅ Question/answer system
- ✅ Event calendar
- ✅ FAQ and content management
- ✅ Mobile responsive
- ✅ Secure (RLS policies)
- ✅ Scalable (serverless)
- ✅ Maintainable (vanilla JS)
- ✅ Production ready

---

**Made with ❤️ for churches everywhere**

**Questions?** Start with [Non-Technical User Guide](NON_TECHNICAL_USER_GUIDE.md)

[Get Started →](landing.html)
