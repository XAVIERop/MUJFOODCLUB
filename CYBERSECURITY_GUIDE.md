# MUJ Food Club - Cybersecurity Guide

## 🔒 Current Security Measures

### ✅ Already Implemented

1. **Environment Variables Protection**
   - API keys stored in Vercel environment variables (not in code)
   - `.env` files in `.gitignore`
   - Supabase Edge Functions for sensitive API calls

2. **Authentication & Authorization**
   - Supabase Auth with JWT tokens
   - Row Level Security (RLS) policies in database
   - User role-based access control (cafe_owner, cafe_staff, student)

3. **API Security**
   - CORS configuration
   - Supabase anon key (public but limited permissions)
   - Edge Functions for server-side operations

4. **Data Protection**
   - HTTPS enforced (Vercel)
   - Password-protected sections for sensitive operations
   - Input validation and sanitization

---

## 🛡️ Recommended Security Enhancements

### 1. **Environment Variables Security** ⚠️ CRITICAL

**Current Status:** Some API keys might be exposed in frontend code

**Actions Needed:**
- ✅ Move all sensitive API keys to Supabase Edge Functions
- ✅ Never expose PrintNode API keys in frontend
- ✅ Use Edge Functions for all third-party API calls
- ✅ Rotate API keys regularly (every 90 days)

**Files to Review:**
- `src/services/printNodeService.ts` - Check if API keys are exposed
- `src/services/whatsappService.ts` - Verify Aisensy keys are server-side only

---

### 2. **Database Security** 🔐

**Current:** Supabase RLS policies

**Enhancements Needed:**
- ✅ Review all RLS policies for proper access control
- ✅ Add database-level rate limiting
- ✅ Enable Supabase audit logs
- ✅ Regular backup verification
- ✅ Encrypt sensitive data (phone numbers, addresses)

**SQL to Run:**
```sql
-- Enable audit logging
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Review existing policies
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

---

### 3. **API Rate Limiting** 🚦

**Current:** Basic rate limiting mentioned in env.example

**Actions Needed:**
- ✅ Implement rate limiting on Supabase Edge Functions
- ✅ Add rate limiting per user/IP
- ✅ Prevent DDoS attacks
- ✅ Limit API calls per minute/hour

**Implementation:**
- Use Supabase Edge Functions with rate limiting middleware
- Add Vercel rate limiting (if using Vercel Edge Functions)

---

### 4. **Input Validation & Sanitization** 🧹

**Current:** Some validation exists

**Enhancements:**
- ✅ Validate all user inputs (Zod schemas)
- ✅ Sanitize HTML inputs to prevent XSS
- ✅ Validate file uploads (images)
- ✅ SQL injection prevention (use parameterized queries)

**Check These Files:**
- `src/pages/Checkout.tsx` - Address input validation
- `src/components/ManualOrderEntry.tsx` - Customer data validation
- All forms that accept user input

---

### 5. **HTTPS & SSL/TLS** 🔐

**Current:** ✅ Vercel provides HTTPS automatically

**Additional:**
- ✅ Verify SSL certificate is valid
- ✅ Enable HSTS (HTTP Strict Transport Security)
- ✅ Use secure cookies (HttpOnly, Secure flags)

---

### 6. **Content Security Policy (CSP)** 🛡️

**Actions Needed:**
- ✅ Add CSP headers to prevent XSS attacks
- ✅ Restrict external script sources
- ✅ Control iframe embedding

**Add to `vercel.json`:**
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co; style-src 'self' 'unsafe-inline';"
        }
      ]
    }
  ]
}
```

---

### 7. **Authentication Security** 🔑

**Enhancements:**
- ✅ Implement 2FA (Two-Factor Authentication) for cafe owners
- ✅ Session timeout (auto-logout after inactivity)
- ✅ Password strength requirements
- ✅ Account lockout after failed login attempts
- ✅ Email verification for new accounts

**Supabase Settings:**
- Enable email confirmation
- Set session timeout
- Configure password requirements

---

### 8. **Payment Security** 💳

**If you add payments:**
- ✅ Never store credit card numbers
- ✅ Use PCI-compliant payment processors (Stripe, Razorpay)
- ✅ Tokenize payment data
- ✅ Encrypt payment information in transit

---

### 9. **Logging & Monitoring** 📊

**Current:** Basic console logging

**Enhancements:**
- ✅ Implement security event logging
- ✅ Monitor failed login attempts
- ✅ Track API usage patterns
- ✅ Set up alerts for suspicious activity
- ✅ Use Sentry for error tracking (already in env.example)

---

### 10. **Dependency Security** 📦

**Actions:**
- ✅ Run `npm audit` regularly
- ✅ Update dependencies monthly
- ✅ Remove unused dependencies
- ✅ Use `npm audit fix` for vulnerabilities

**Commands:**
```bash
npm audit
npm audit fix
npm outdated
```

---

### 11. **Secrets Management** 🔐

**Current:** Environment variables in Vercel

**Best Practices:**
- ✅ Use Vercel Secrets (encrypted)
- ✅ Rotate secrets every 90 days
- ✅ Never commit secrets to Git
- ✅ Use different secrets for dev/staging/production

---

### 12. **API Key Security** 🔑

**For Your APIs:**
- ✅ PrintNode API keys - Move to Edge Functions
- ✅ Aisensy API keys - Already in Edge Functions ✅
- ✅ Google Maps API key - Restrict by domain
- ✅ Supabase keys - Use service role key only server-side

**Google Maps API Key Restrictions:**
1. Go to Google Cloud Console
2. Restrict API key to specific domains:
   - `mujfoodclub.in`
   - `*.vercel.app` (for preview deployments)
3. Restrict to specific APIs only (Maps, Places, Geocoding)

---

## 🌐 What is Cloudflare?

**Cloudflare** is a global CDN (Content Delivery Network) and security service that sits between your website and visitors.

### Key Features:

1. **DDoS Protection** 🛡️
   - Protects against distributed denial-of-service attacks
   - Blocks malicious traffic automatically

2. **CDN (Content Delivery Network)** 🌍
   - Caches your website content globally
   - Faster loading times worldwide
   - Reduces server load

3. **SSL/TLS Encryption** 🔐
   - Free SSL certificates
   - Automatic HTTPS
   - Encrypts data in transit

4. **Web Application Firewall (WAF)** 🔥
   - Blocks malicious requests
   - Protects against SQL injection, XSS attacks
   - Custom security rules

5. **Rate Limiting** ⏱️
   - Prevents abuse
   - Limits requests per IP
   - Protects APIs

6. **Bot Protection** 🤖
   - Blocks malicious bots
   - Allows good bots (Google, etc.)
   - Prevents scraping

### Should You Use Cloudflare?

**For MUJ Food Club:**

**Pros:**
- ✅ Free DDoS protection
- ✅ Faster global loading
- ✅ Better security
- ✅ Free SSL
- ✅ Analytics

**Cons:**
- ⚠️ Additional layer (can complicate debugging)
- ⚠️ Vercel already provides CDN
- ⚠️ May need configuration for Supabase WebSockets

**Recommendation:**
- **Not immediately necessary** - Vercel already provides:
  - Global CDN
  - DDoS protection
  - SSL certificates
  - Edge network

- **Consider Cloudflare if:**
  - You need advanced WAF rules
  - You want more granular control
  - You need bot management
  - You're experiencing DDoS attacks

---

## 🚨 Immediate Action Items

### Priority 1 (Critical):
1. ✅ Move PrintNode API keys to Edge Functions
2. ✅ Review and strengthen RLS policies
3. ✅ Add input validation to all forms
4. ✅ Enable Supabase audit logging

### Priority 2 (Important):
1. ✅ Implement rate limiting
2. ✅ Add CSP headers
3. ✅ Set up security monitoring
4. ✅ Rotate API keys

### Priority 3 (Nice to have):
1. ✅ Add 2FA for cafe owners
2. ✅ Implement session timeout
3. ✅ Set up automated security scans
4. ✅ Consider Cloudflare (if needed)

---

## 📚 Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security)
- [Vercel Security](https://vercel.com/docs/security)
- [Cloudflare Documentation](https://developers.cloudflare.com/)

---

## 🔍 Security Audit Checklist

Run this monthly:

- [ ] Review environment variables (no secrets in code)
- [ ] Check npm dependencies (`npm audit`)
- [ ] Review Supabase RLS policies
- [ ] Test authentication flows
- [ ] Verify HTTPS is working
- [ ] Check for exposed API keys
- [ ] Review access logs
- [ ] Test input validation
- [ ] Verify backups are working
- [ ] Rotate API keys (quarterly)

---

**Last Updated:** December 2025
**Next Review:** January 2026

