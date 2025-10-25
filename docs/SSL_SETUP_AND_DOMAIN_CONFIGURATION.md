# SSL Setup & Domain Configuration for Vercel Deployment

## Overview
This guide walks through getting your domain connected to Vercel with automatic HTTPS/SSL certificates. Your brother owns the domain and will add DNS records you provide.

---

## Part 1: Deploy to Vercel (Prerequisites)

Before configuring DNS, you need to deploy the project to Vercel:

1. **Create Vercel Account** (if not already done)
   - Go to https://vercel.com/signup
   - Sign up with GitHub (easiest integration)
   - Authorize Vercel to access your GitHub account

2. **Import Project to Vercel**
   - Click "Add New" → "Project"
   - Select your GitHub repository (WeOnAMission)
   - Framework: Select "Other" (since we're not using a framework)
   - Root Directory: Leave as `.` (root)
   - Build Command: Leave blank or use `npm install 2>/dev/null || true` (from vercel.json)
   - Output Directory: Leave blank
   - Environment Variables: Add your Supabase credentials

3. **Add Environment Variables**
   - Click "Environment Variables"
   - Add these from your `config.js`:
     - `SUPABASE_URL` = your Supabase URL
     - `SUPABASE_ANON_KEY` = your anon key
   - **CRITICAL**: Never commit actual credentials. These environment variables keep secrets safe on Vercel.

4. **Deploy**
   - Click "Deploy"
   - Vercel will assign you a temporary domain like: `weonmission-xxxx.vercel.app`
   - Test that it works at this temporary domain

---

## Part 2: DNS Records to Send to Your Brother

Once deployed to Vercel, you'll get DNS records to add to your domain registrar. Here's what to do:

### Step 1: Access Your Vercel Project Settings

1. Go to https://vercel.com/dashboard
2. Select your "WeOnAMission" project
3. Go to "Settings" → "Domains"

### Step 2: Add Your Domain

1. Click "Add Domain"
2. Enter your domain (e.g., `weonmission.org` or whatever your brother's domain is)
3. Vercel will show you one of two options:

### Option A: Using Vercel's Nameservers (Easiest)
If your domain is with a standard registrar (GoDaddy, Namecheap, etc.):
- Vercel will show you **4 nameservers**
- **Send these 4 nameservers to your brother:**
  ```
  ns1.vercel-dns.com
  ns2.vercel-dns.com
  ns3.vercel-dns.com
  ns4.vercel-dns.com
  ```
- Your brother logs into the domain registrar and updates the **Nameservers** to point to Vercel's
- Wait 24-48 hours for DNS to propagate
- Once propagated, Vercel automatically issues an SSL certificate via Let's Encrypt

### Option B: Using CNAME Record (If Nameserver change isn't possible)
If your brother can't change nameservers:
- Vercel will show a **CNAME record** like:
  ```
  cname.vercel-dns.com
  ```
- Your brother adds a DNS CNAME record pointing to this in the domain registrar
- Vercel automatically issues an SSL certificate
- Takes 24-48 hours to propagate

### Option C: Using A Records (Advanced)
If neither option works:
- Vercel shows **A record IP addresses**
- Your brother adds these to the DNS A records
- Less common but works as fallback

---

## Part 3: What Happens After DNS is Updated

### SSL Certificate Auto-Issuance
1. Once DNS points to Vercel (24-48 hours)
2. Vercel automatically requests an SSL certificate from Let's Encrypt
3. Vercel automatically renews it every 90 days (you do nothing)
4. Your site is HTTPS by default

### Accessing Your Site
- After DNS propagates, your site is live at:
  - `https://yourdomain.com` (automatic HTTPS)
  - `https://www.yourdomain.com` (if configured)

### Multi-Tenant URLs
With your domain, multi-tenant URLs work like:
- `https://yourdomain.com/?church=trinity`
- `https://yourdomain.com/?church=crossroads`
- Or with the subdirectory routing configured in `vercel.json`:
  - `https://yourdomain.com/trinity/` → `/landing.html?church=trinity`

---

## Part 4: What to Tell Your Brother (Simple Version)

> "Hey, I deployed the platform to Vercel. They gave me some DNS records.
>
> Can you log into [GoDaddy/Namecheap/whatever] and update the nameservers for the domain to:
> - ns1.vercel-dns.com
> - ns2.vercel-dns.com
> - ns3.vercel-dns.com
> - ns4.vercel-dns.com
>
> OR if that's not possible, add a CNAME record pointing to: cname.vercel-dns.com
>
> Once you do that and it propagates (24-48 hours), the site will be live with HTTPS automatically."

---

## Part 5: Common Issues & Troubleshooting

### Issue: Domain shows "Not Configured" after adding
- **Cause**: DNS hasn't propagated yet
- **Fix**: Wait 24-48 hours and check again. Use https://dnschecker.org to verify nameservers have updated.

### Issue: SSL certificate not issued after 48 hours
- **Cause**: DNS misconfigured
- **Fix**:
  1. Go to Vercel → Settings → Domains
  2. Check the DNS configuration status
  3. Use https://dnschecker.org to verify nameservers match
  4. If wrong, contact your brother to fix the DNS

### Issue: Site works on vercel.app but not on custom domain
- **Cause**: DNS not yet propagated or configuration error
- **Fix**:
  1. Check Vercel domain settings for errors
  2. Wait longer (can take up to 48 hours)
  3. Run `nslookup yourdomain.com` in terminal to check if DNS updated

### Issue: Getting "Unable to verify domain" errors
- **Cause**: Usually DNS misconfiguration
- **Fix**:
  1. Double-check nameservers in registrar match Vercel's exactly
  2. Make sure no conflicting DNS records exist
  3. Try removing and re-adding the domain in Vercel

---

## Part 6: After DNS is Working - Environment Setup

Once your domain is live, update your configuration:

1. **Update `config.js`** to reference your domain instead of localhost:
   ```javascript
   // Before: http://localhost:8000
   // After: https://yourdomain.com
   ```

2. **Test Multi-Tenancy** at your live domain:
   - https://yourdomain.com/?church=trinity
   - https://yourdomain.com/?church=crossroads
   - Both should work with HTTPS

3. **Share with Your Brother**:
   - https://yourdomain.com - Main landing page
   - https://yourdomain.com/?church=trinity - Trinity church portal
   - https://yourdomain.com/?church=crossroads - Crossroads church portal (once created)

---

## Part 7: HTTPS/SSL Details

### What Vercel Does Automatically
- ✅ Issues free SSL certificate via Let's Encrypt
- ✅ Renews automatically every 90 days (you don't have to do anything)
- ✅ Forces HTTPS (redirects HTTP to HTTPS)
- ✅ Uses modern TLS 1.2 and 1.3

### What You Get
- **Secure connection** - All data encrypted in transit
- **Browser trust** - Green padlock in browser
- **SEO benefit** - Google favors HTTPS sites
- **No manual renewal** - Vercel handles it all

### Cost
- **Free** - Vercel's free tier includes automatic HTTPS

---

## Part 8: Checking Your SSL Certificate

### On the Web Browser
1. Visit https://yourdomain.com
2. Click the padlock icon in URL bar
3. Click "Certificate" (on Chrome/Firefox)
4. You'll see:
   - Issued by: Let's Encrypt
   - Valid from: [Date] to [Date + 90 days]
   - Domain: yourdomain.com

### Via Command Line
```bash
openssl s_client -connect yourdomain.com:443
```

This shows detailed certificate info.

---

## Part 9: What NOT to Do

❌ **Don't manually manage SSL certificates** - Vercel handles it
❌ **Don't create A records if using nameservers** - Causes conflicts
❌ **Don't change nameservers back once set** - It will break SSL
❌ **Don't add conflicting DNS records** - Can cause resolution issues
❌ **Don't commit real credentials to GitHub** - Use Vercel environment variables

---

## Summary Checklist

- [ ] Create Vercel account
- [ ] Import WeOnAMission repo to Vercel
- [ ] Add Supabase environment variables to Vercel
- [ ] Deploy to Vercel (get temporary vercel.app domain)
- [ ] Get DNS configuration from Vercel (nameservers or CNAME)
- [ ] Send DNS records to brother
- [ ] Brother updates domain registrar with nameservers/CNAME
- [ ] Wait 24-48 hours for DNS propagation
- [ ] Vercel auto-issues SSL certificate
- [ ] Test HTTPS at yourdomain.com
- [ ] Test multi-tenant URLs (?church=trinity, etc.)
- [ ] Update configuration with live domain
- [ ] Share live domain links with users

---

## Need Help?

**Vercel Docs**: https://vercel.com/docs/concepts/projects/domains/add-a-domain
**DNS Checker**: https://dnschecker.org
**Let's Encrypt**: https://letsencrypt.org/how-it-works/
