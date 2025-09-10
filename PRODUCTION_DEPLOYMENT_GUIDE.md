# 🚀 Production Deployment Guide
## MUJ Food Club - Production Ready Setup

### 📋 **Pre-Deployment Checklist**

#### ✅ **Environment Setup**
- [ ] Copy `env.example` to `.env.local`
- [ ] Set all required environment variables
- [ ] Verify Supabase production credentials
- [ ] Configure PrintNode API keys
- [ ] Set up Twilio WhatsApp credentials
- [ ] Configure monitoring services (Sentry, Analytics)

#### ✅ **Security Configuration**
- [ ] Run security hardening migration
- [ ] Verify Row Level Security is enabled
- [ ] Test database access policies
- [ ] Validate security headers
- [ ] Check rate limiting configuration

#### ✅ **Performance Optimization**
- [ ] Run performance optimization migration
- [ ] Verify database indexes are created
- [ ] Test materialized views
- [ ] Check bundle size optimization
- [ ] Validate caching configuration

---

## 🚀 **Deployment Steps**

### **Step 1: Environment Configuration**

```bash
# 1. Copy environment template
cp env.example .env.local

# 2. Set production environment variables
export VITE_SUPABASE_URL="your-production-supabase-url"
export VITE_SUPABASE_ANON_KEY="your-production-supabase-key"
export VITE_PRINTNODE_API_KEY="your-printnode-api-key"
export VITE_TWILIO_ACCOUNT_SID="your-twilio-account-sid"
export VITE_TWILIO_AUTH_TOKEN="your-twilio-auth-token"
export VITE_SENTRY_DSN="your-sentry-dsn"
export VITE_APP_ENV="production"
```

### **Step 2: Database Migration**

```bash
# 1. Apply security hardening migration
supabase db push

# 2. Run production performance optimization
psql -h your-supabase-host -U postgres -d postgres -f supabase/migrations/20250127000004_production_security_hardening.sql
psql -h your-supabase-host -U postgres -d postgres -f supabase/migrations/20250127000005_production_performance_optimization.sql

# 3. Verify database security
SELECT * FROM public.check_security_status();
```

### **Step 3: Production Build**

```bash
# 1. Install dependencies
npm ci

# 2. Run security audit
npm run security:audit

# 3. Run linting
npm run lint:fix

# 4. Create production build
npm run build:prod

# 5. Run production setup script
npm run setup:prod
```

### **Step 4: Deploy to Vercel**

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy to production
vercel --prod

# 4. Verify deployment
curl -I https://your-app.vercel.app
```

### **Step 5: Post-Deployment Verification**

```bash
# 1. Test critical user flows
npm run test:production

# 2. Check security headers
curl -I https://your-app.vercel.app | grep -E "(X-Frame-Options|X-Content-Type-Options|Strict-Transport-Security)"

# 3. Verify SSL certificate
openssl s_client -connect your-app.vercel.app:443 -servername your-app.vercel.app

# 4. Test database connectivity
curl https://your-app.vercel.app/api/health
```

---

## 🔒 **Security Verification**

### **Database Security**
```sql
-- Check RLS status
SELECT * FROM public.security_audit_summary;

-- Verify policies
SELECT * FROM public.audit_security_policies();

-- Test access controls
SELECT * FROM public.check_security_status();
```

### **Application Security**
```bash
# Check security headers
curl -I https://your-app.vercel.app

# Test rate limiting
for i in {1..10}; do curl https://your-app.vercel.app/api/test; done

# Verify HTTPS
curl -I https://your-app.vercel.app | grep "Strict-Transport-Security"
```

---

## 📊 **Performance Monitoring**

### **Database Performance**
```sql
-- Check query performance
SELECT * FROM public.analyze_query_performance();

-- Monitor index usage
SELECT * FROM public.get_index_usage_stats();

-- Check system performance
SELECT * FROM public.performance_monitoring;
```

### **Application Performance**
```bash
# Monitor bundle size
ls -la dist/assets/

# Check loading times
curl -w "@curl-format.txt" -o /dev/null -s https://your-app.vercel.app

# Test API response times
time curl https://your-app.vercel.app/api/health
```

---

## 🚨 **Monitoring & Alerting**

### **Error Tracking**
- Sentry integration for error monitoring
- Custom error tracking for business logic
- Performance monitoring for slow queries

### **Health Checks**
```bash
# Application health
curl https://your-app.vercel.app/api/health

# Database health
curl https://your-app.vercel.app/api/db-health

# External services health
curl https://your-app.vercel.app/api/services-health
```

### **Alerting Rules**
- Error rate > 5%
- Response time > 500ms
- Database query time > 1000ms
- Memory usage > 80%
- Disk usage > 90%

---

## 🔄 **Backup & Recovery**

### **Database Backups**
```sql
-- Automated daily backups (configure in Supabase)
-- Point-in-time recovery enabled
-- Cross-region replication
```

### **Application Backups**
```bash
# Code repository backup
git push origin main

# Environment variables backup
vercel env pull .env.backup

# Configuration backup
cp vercel.json vercel.json.backup
```

---

## 📈 **Scaling Considerations**

### **Database Scaling**
- Read replicas for analytics queries
- Connection pooling for high concurrency
- Partitioning for large tables
- Archiving old data

### **Application Scaling**
- CDN for static assets
- Edge functions for global performance
- Caching strategies
- Load balancing

---

## 🛠️ **Maintenance**

### **Daily Tasks**
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify backup completion
- [ ] Review security logs

### **Weekly Tasks**
- [ ] Update dependencies
- [ ] Review slow queries
- [ ] Test disaster recovery
- [ ] Security audit

### **Monthly Tasks**
- [ ] Performance optimization review
- [ ] Capacity planning
- [ ] Security penetration testing
- [ ] Documentation updates

---

## 📞 **Emergency Procedures**

### **Incident Response**
1. **Identify the issue**
   - Check monitoring dashboards
   - Review error logs
   - Test user flows

2. **Contain the issue**
   - Rollback if necessary
   - Disable affected features
   - Notify stakeholders

3. **Resolve the issue**
   - Fix the root cause
   - Test the fix
   - Deploy to production

4. **Post-incident review**
   - Document the incident
   - Identify improvements
   - Update procedures

### **Rollback Procedure**
```bash
# Rollback to previous deployment
vercel rollback

# Rollback database changes
supabase db reset --linked

# Verify rollback
curl https://your-app.vercel.app/api/health
```

---

## 📚 **Documentation**

### **Technical Documentation**
- [Database Schema](./docs/database-schema.md)
- [API Documentation](./docs/api-documentation.md)
- [Security Policies](./docs/security-policies.md)
- [Performance Guidelines](./docs/performance-guidelines.md)

### **Operational Documentation**
- [Deployment Procedures](./docs/deployment-procedures.md)
- [Monitoring Runbooks](./docs/monitoring-runbooks.md)
- [Incident Response](./docs/incident-response.md)
- [Maintenance Schedules](./docs/maintenance-schedules.md)

---

## ✅ **Go-Live Checklist**

### **Technical Readiness**
- [ ] All security vulnerabilities fixed
- [ ] Performance optimizations applied
- [ ] Monitoring and alerting configured
- [ ] Backup and recovery procedures tested
- [ ] Load testing completed
- [ ] Security audit passed

### **Business Readiness**
- [ ] All features tested and working
- [ ] User acceptance testing completed
- [ ] Staff training completed
- [ ] Support procedures established
- [ ] Communication plan executed
- [ ] Go-live approval obtained

### **Final Deployment**
- [ ] Production deployment completed
- [ ] Post-deployment verification passed
- [ ] Monitoring alerts configured
- [ ] Team notified of go-live
- [ ] Documentation updated
- [ ] Success metrics established

---

**Deployment Date**: ___________  
**Deployed By**: ___________  
**Approved By**: ___________  
**Go-Live Time**: ___________  

---

*This guide ensures a secure, performant, and reliable production deployment for MUJ Food Club.*


