# TODO Checklist

## ✅ Already Built (Ready to Use)

- [x] Complete database schema with all tables
- [x] Row Level Security (RLS) policies
- [x] Storage bucket policies
- [x] API wrapper functions for all operations
- [x] Authentication helpers
- [x] Login/Signup page
- [x] Parent Portal (fully functional)
- [x] Configuration system
- [x] Documentation

## 🚧 To Build (Est. 8-12 hours total)

### Student Portal (2-3 hours)
- [ ] Create `student-portal.html`
- [ ] Add photo upload interface
- [ ] Add note/reflection submission form
- [ ] Display student's submissions
- [ ] Show approval status

**Hint**: Copy structure from `parent-portal.html` and modify!

### Admin Dashboard (4-6 hours)
- [ ] Create `admin-portal.html`
- [ ] Dashboard overview (stats, counts)
- [ ] Student management table
  - [ ] View all students
  - [ ] See payment status
  - [ ] Add/edit students
- [ ] Document review section
  - [ ] List pending documents
  - [ ] Approve/reject with notes
- [ ] Trip memories review section
  - [ ] List pending photos/notes
  - [ ] Approve/reject submissions
- [ ] Payment tracking
  - [ ] Record new payments
  - [ ] View payment history
  - [ ] Export to Excel
- [ ] Event management
  - [ ] Add/edit/delete calendar events
- [ ] Resource management
  - [ ] Add/edit/delete resources

### Public Landing Page (2-3 hours)
- [ ] Adapt Josh's existing HTML
- [ ] Remove Quickbase code
- [ ] Add Supabase script tags
- [ ] Update calendar to load from `API.getEvents()`
- [ ] Update resources to load from `API.getResources()`
- [ ] Add "Login" button to navigation
- [ ] Keep all existing content (FAQs, packing lists, etc.)

### Shared Styles (Optional - 30 min)
- [ ] Create `styles.css` with common styles
- [ ] Move repeated CSS from pages to shared file

## Testing Checklist

### After Building Student Portal
- [ ] Student can log in
- [ ] Student can upload a photo
- [ ] Student can write a note
- [ ] Student can see their submissions
- [ ] Student can see approval status

### After Building Admin Portal
- [ ] Admin can see all students
- [ ] Admin can view payment summaries
- [ ] Admin can add a payment
- [ ] Admin can approve a document
- [ ] Admin can approve a trip memory
- [ ] Admin can add an event
- [ ] Admin can add a resource

### After Adapting Public Landing Page
- [ ] Calendar shows events from database
- [ ] Resources show from database
- [ ] Login button works
- [ ] Countdown timer works
- [ ] All static content displays correctly

## Deployment Checklist

- [ ] Test locally with live Supabase connection
- [ ] Create GitHub repository
- [ ] Push all code
- [ ] Deploy to Vercel
- [ ] Connect custom domain
- [ ] Test all features on production
- [ ] Create admin user in production database
- [ ] Add sample events and resources
- [ ] Share login link with first parent for testing

## Future Enhancements (After Launch)

- [ ] Email notifications (when document approved, etc.)
- [ ] SMS reminders for deadlines
- [ ] Payment integration (Stripe)
- [ ] Export trip memory book to PDF
- [ ] Mobile app (optional)
- [ ] Offline mode
- [ ] Multi-language support

## Quick Reference

### API Functions Available
See `api.js` for complete list. Key functions:
- `API.getCurrentUser()`
- `API.getMyStudents()` / `API.getAllStudents()`
- `API.uploadDocument()`
- `API.submitTripMemory()`
- `API.getPaymentSummary()`
- `API.addPayment()`
- `API.getEvents()` / `API.createEvent()`
- `API.getResources()` / `API.createResource()`

### Auth Helpers Available
See `auth.js` for complete list. Key functions:
- `Auth.initializePage(role)` - Use at start of every portal page
- `Auth.requireAuth()` - Redirect if not logged in
- `Auth.signOut()` - Log user out
- `Auth.formatDate()` - Format dates nicely
- `Auth.formatCurrency()` - Format money amounts

### Database Tables
- `users` - User accounts
- `students` - Student information
- `payments` - Payment records
- `payment_summaries` - View of payment status (auto-calculated)
- `documents` - Uploaded documents
- `trip_memories` - Student photos/notes
- `events` - Calendar events
- `resources` - Resource links

## Estimated Timeline

- **Day 1-2**: Student portal + Admin dashboard core features
- **Day 3**: Adapt public landing page
- **Day 4**: Testing and bug fixes
- **Day 5**: Deployment and first user testing

Total: **About 1 week of focused work**

## Need a Break?

You can build these incrementally:
1. First: Get parent portal working (already done!)
2. Next: Build student portal
3. Then: Build basic admin dashboard
4. Finally: Adapt public page and polish

Each piece is independent and can be tested separately!
