# Deployment & Security Pre-Launch Checklist

## Quick Checklist (Before Going Live)

### Domain & SSL Setup
- [ ] Create Vercel account
- [ ] Import GitHub repo to Vercel
- [ ] Get temporary domain (vercel.app)
- [ ] Add Supabase env vars to Vercel
- [ ] Deploy successfully to Vercel
- [ ] Get DNS configuration from Vercel (nameservers or CNAME)
- [ ] Send DNS info to your brother
- [ ] Wait 24-48 hours for DNS propagation
- [ ] Verify SSL certificate issued (green lock in browser)
- [ ] Update config with live domain

### Security Configuration
- [ ] Review CORS settings in vercel.json
- [ ] Update CORS origin to your domain (not `*`)
- [ ] Verify config.js is in .gitignore
- [ ] Verify .env files are in .gitignore
- [ ] Never commit Supabase credentials to GitHub
- [ ] Check that config.example.js exists (for documentation)

### Testing Before Launch
- [ ] Test multi-tenant isolation (Trinity vs Crossroads data separate)
- [ ] Test role permissions (parent can't approve docs)
- [ ] Test admin promotion workflow
- [ ] Test file uploads (documents and trip photos)
- [ ] Test payment tracking
- [ ] Test question submission and admin responses
- [ ] Test on mobile devices (responsive design)
- [ ] Test cross-browser (Chrome, Firefox, Safari, Edge)
- [ ] Test on both WiFi and cellular connections

### Data Privacy & Compliance
- [ ] Write privacy policy
- [ ] Write terms of service
- [ ] Get parent/guardian consent for data collection
- [ ] Document FERPA compliance measures
- [ ] Understand your legal obligations (church lawyer review)
- [ ] Create data retention policy (how long to keep student data)
- [ ] Plan for data deletion after trip ends
- [ ] Document admin responsibilities and training

### Documentation & Communication
- [ ] All admins read NON_TECHNICAL_USER_GUIDE.md
- [ ] All admins read ADMIN_PROMOTION_GUIDE.md
- [ ] All admins read HOW_TO_NAVIGATE_TRINITY_LOCALLY.md (for live domain)
- [ ] Create training video or walkthrough for admins
- [ ] Create FAQ for parents
- [ ] Share login credentials securely (not via email)

### Monitoring & Support
- [ ] Set up error monitoring (optional: Sentry, LogRocket)
- [ ] Create a contact form for bug reports
- [ ] Plan response time for critical issues
- [ ] Set up automated backups (Supabase has built-in)
- [ ] Document who to contact for production issues

---

## SSL/HTTPS Setup (Step by Step)

### What Your Brother Needs to Do

Your brother needs to update the domain registrar (GoDaddy, Namecheap, etc.) with DNS records.

**Two options**:

**Option A: Nameservers (Easiest)**
```
Replace existing nameservers with:
- ns1.vercel-dns.com
- ns2.vercel-dns.com
- ns3.vercel-dns.com
- ns4.vercel-dns.com
```

**Option B: CNAME Record (If nameserver change not possible)**
```
Add CNAME record:
Hostname: cname
Points to: cname.vercel-dns.com
```

**Then wait 24-48 hours for propagation.**

### How to Check If DNS is Working

1. Open terminal
2. Run: `nslookup yourdomain.com`
3. Should return Vercel's IP addresses
4. Once updated, Vercel automatically issues SSL certificate
5. You'll see ✅ on domain in Vercel dashboard

---

## CORS Configuration Fix

Current `vercel.json` has:
```json
"Access-Control-Allow-Origin": "*"
```

Should be changed to:
```json
"Access-Control-Allow-Origin": "https://yourdomain.com, https://www.yourdomain.com"
```

This restricts API calls to your domain only (defense in depth).

---

## Environment Variables for Vercel

In Vercel dashboard → Project → Settings → Environment Variables:

```
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_ANON_KEY = eyJ0eXAi... (your anon key)
```

⚠️ Never commit these to GitHub

---

## Post-Deployment Security Tests

### Test 1: Verify HTTPS
```bash
# Open browser
https://yourdomain.com
# Should show green lock (✅ secure)

# Check certificate
openssl s_client -connect yourdomain.com:443
# Should show: Issuer: Let's Encrypt
# Should show: Valid dates within 90 days
```

### Test 2: Verify Multi-Tenant Isolation
1. Create two test accounts: one for Trinity, one for Crossroads
2. In Trinity account, add a student "Alice"
3. Switch to Crossroads account
4. Verify you cannot see "Alice" ✅

### Test 3: Verify Role Enforcement
1. Create parent account (default role)
2. As parent, try to approve a document
3. Should show "You do not have permission" ✅
4. Have admin promote you to admin
5. Try again - should work ✅

### Test 4: Verify Admin Promotion Works
1. Super admin creates new test user
2. User signs up with test account
3. User logs in, sees parent portal
4. Super admin promotes user to admin
5. User logs out, logs back in
6. User now sees admin portal ✅

### Test 5: Verify File Uploads
1. Upload a document
2. Check Supabase Storage → documents bucket
3. File should exist ✅
4. Try to access file from different church
5. Should fail (403 Forbidden) ✅

---

## Common Deployment Issues & Solutions

### Issue: Domain shows "Invalid Configuration"
**Solution**: Wait 24-48 hours, DNS propagates slowly

### Issue: SSL certificate not issued after 48 hours
**Solution**:
1. Check Vercel domain settings
2. Verify nameservers actually updated: `nslookup yourdomain.com`
3. If nameservers wrong, have your brother fix them

### Issue: Site works on vercel.app but not yourdomain.com
**Solution**:
1. Verify DNS updated: `nslookup yourdomain.com`
2. Check for DNS conflicts (multiple A records)
3. Remove and re-add domain in Vercel dashboard

### Issue: Mixed content warning (green lock but warning)
**Solution**:
1. Find any `http://` URLs in code
2. Change to `https://`
3. Most common: CDN links in HTML headers

### Issue: 403 Forbidden errors on some pages
**Solution**:
1. Usually means you're accessing Trinity data with Crossroads church context
2. Verify ?church= parameter matches the data you're trying to access

---

## Data Privacy Checklist

### Before Collecting Student Data

- [ ] **Privacy Policy Written**: Clear statement of what data you collect
- [ ] **Parent Consent**: Parents opt-in before data collected
- [ ] **Data Retention**: Policy on how long you keep data (e.g., 30 days after trip)
- [ ] **Data Deletion**: Plan for permanent deletion when no longer needed
- [ ] **Access Control**: Only admins can see student data
- [ ] **Secure Storage**: Data encrypted in transit (HTTPS ✅) and at rest
- [ ] **Backup Policy**: Data backed up regularly and securely
- [ ] **Incident Plan**: What to do if data is breached

### Legal Compliance

**FERPA** (Student Education Records):
- Student data is protected
- Parents have right to see/correct data
- School official exception applies to trip leaders

**COPPA** (Children's Online Privacy):
- If student under 13, parental consent required
- Cannot collect unnecessary personal info
- Cannot sell/share data

**GDPR** (EU Residents):
- If any EU residents: GDPR applies
- "Right to be forgotten" - must delete on request
- Data processing agreement required

**Recommendation**: Have church lawyer review before launch

---

## Post-Launch Monitoring

### Daily
- Check error monitoring dashboard (if set up)
- Monitor Vercel deployment logs

### Weekly
- Review admin activity logs
- Check for unusual payment patterns
- Monitor file uploads for spam

### Monthly
- Review access logs
- Check data backup integrity
- Update security practices if needed

### Quarterly
- Audit who has admin access
- Review permission changes
- Verify data isolation still working

### Annually
- Security audit
- Penetration testing (recommended)
- Compliance review

---

## Support & Escalation

### Who to Contact

**Technical Issues**:
- Check docs/COMPREHENSIVE_TESTING_GUIDE.md first
- Check GitHub issues
- Contact developer (you)

**Account/Login Issues**:
- Password reset link in login page
- Contact admin to check database

**Data/Privacy Issues**:
- Escalate to church leadership
- May require legal team
- Document all issues for incident response

**Security Concerns**:
- Do NOT share on public channels
- Contact developer immediately
- Follow incident response plan

---

## Final Pre-Launch Sign-Off

Before launching to production:

- [ ] **Developer**: Code reviewed, security audit passed
- [ ] **Administrator**: Trained on platform and data responsibility
- [ ] **Church Leader**: Reviewed privacy policy and legal implications
- [ ] **Technical**: Domain DNS working, SSL certificate issued
- [ ] **Testing**: All user journeys tested and working
- [ ] **Documentation**: Available to all users
- [ ] **Support**: Plan in place for issues/questions

**Launch Approved By**: ___________________  Date: ___________

---

## Quick Links

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Let's Encrypt**: https://letsencrypt.org
- **DNS Checker**: https://dnschecker.org
- **OWASP Top 10**: https://owasp.org/Top10/
