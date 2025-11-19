# 🧪 Security Testing Guide

Quick guide to test all security features are working properly.

## ⚡ Quick Test (5 Minutes)

### 1. Rate Limiting Test

**Test Login Rate Limit:**
```
1. Go to: http://localhost:8080/admin
2. Try logging in with wrong password 6 times
3. Expected: "Too many login attempts" after 5th attempt
✅ Pass if: Blocked after 5 attempts
```

**Test Contact Form Rate Limit:**
```
1. Go to: http://localhost:8080/contact
2. Submit the form 11 times quickly
3. Expected: Rate limit error after 10th submission
✅ Pass if: Blocked after 10 submissions
```

### 2. Input Validation Test

**Test Invalid Email:**
```
1. Go to: http://localhost:8080/contact
2. Enter email: "not-an-email"
3. Submit form
4. Expected: "Invalid email format" error
✅ Pass if: Form rejected
```

**Test Invalid ZIP:**
```
1. Enter ZIP: "1234" (only 4 digits)
2. Submit form
3. Expected: "Invalid ZIP code format" error
✅ Pass if: Form rejected
```

**Test XSS Attempt:**
```
1. Enter name: "<script>alert('XSS')</script>"
2. Submit form
3. Check admin panel
4. Expected: See escaped text, not script execution
✅ Pass if: No alert popup, text is escaped
```

### 3. Authentication Test

**Test Protected Routes:**
```
1. Open new incognito window
2. Try to access: http://localhost:8080/api/admin/contacts
3. Expected: 401 Unauthorized error
✅ Pass if: Access denied without login
```

**Test Login:**
```
1. Go to: http://localhost:8080/admin
2. Login with: admin / admin123
3. Expected: Redirect to dashboard
✅ Pass if: Dashboard loads successfully
```

**Test Logout:**
```
1. Click logout button
2. Try to access: http://localhost:8080/admin.html
3. Expected: Redirect to login page
✅ Pass if: Redirected to login
```

### 4. File Upload Security Test

**Test Invalid File Type:**
```
1. Go to: http://localhost:8080/contact
2. Try to upload a .txt or .pdf file
3. Expected: File rejected
✅ Pass if: Only image files accepted
```

**Test File Size Limit:**
```
1. Try to upload an image larger than 5MB
2. Expected: Browser alert or rejection
✅ Pass if: Large files rejected
```

**Test File Count Limit:**
```
1. Try to select 6+ images
2. Expected: Browser alert "Maximum 5 images allowed"
✅ Pass if: Limited to 5 files
```

### 5. Session Security Test

**Test Session Persistence:**
```
1. Login to admin panel
2. Close browser tab
3. Open new tab, go to: http://localhost:8080/admin
4. Expected: Still logged in (within 24 hours)
✅ Pass if: Session persists
```

**Test Session Expiration:**
```
1. Login to admin panel
2. Wait 24 hours (or change maxAge to 1 minute for testing)
3. Try to access admin dashboard
4. Expected: Redirect to login
✅ Pass if: Session expired
```

## 🔍 Advanced Testing

### Check Security Headers

**Using curl:**
```bash
curl -I http://localhost:8080/
```

**Should see:**
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'...
```

✅ Pass if: All security headers present

### Check npm Vulnerabilities

```bash
cd /Users/jawednur/Desktop/Junk2Clean
npm audit
```

✅ Pass if: "found 0 vulnerabilities"

### Test Password Hashing

**Verify hash:**
```bash
node -e "
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('admin123', 10);
const isValid = bcrypt.compareSync('admin123', hash);
console.log('Hash valid:', isValid);
"
```

✅ Pass if: "Hash valid: true"

## 🎯 Security Test Checklist

### Authentication & Authorization:
- [ ] Rate limiting works on login
- [ ] Wrong credentials rejected
- [ ] Correct credentials accepted
- [ ] Protected routes require auth
- [ ] Logout clears session
- [ ] Session expires after 24 hours

### Input Validation:
- [ ] Invalid email rejected
- [ ] Invalid phone rejected
- [ ] Invalid ZIP rejected
- [ ] Invalid date rejected
- [ ] XSS attempts escaped
- [ ] SQL injection attempts blocked (N/A - using JSON)

### File Upload:
- [ ] Invalid file types rejected
- [ ] Large files rejected
- [ ] Too many files rejected
- [ ] Valid images accepted
- [ ] Files accessible only to admin

### Rate Limiting:
- [ ] Login rate limit works
- [ ] Contact form rate limit works
- [ ] API rate limit works
- [ ] Limits reset after window

### Session Security:
- [ ] HTTP-only cookies set
- [ ] Secure flag set (production)
- [ ] SameSite attribute set
- [ ] Session regenerates on login
- [ ] Session destroyed on logout

### Error Handling:
- [ ] No console logs in production
- [ ] Generic error messages
- [ ] No stack traces exposed
- [ ] Graceful degradation

### Security Headers:
- [ ] Helmet headers present
- [ ] CSP configured
- [ ] HSTS enabled (production)
- [ ] X-Frame-Options set

## 🚨 Expected Results

### All Tests Passing:

```
✅ Rate Limiting: PASS
✅ Input Validation: PASS
✅ Authentication: PASS
✅ File Upload: PASS
✅ Session Security: PASS
✅ Error Handling: PASS
✅ Security Headers: PASS
✅ npm Audit: 0 vulnerabilities

OVERALL SECURITY: 🟢 A+
```

## 🐛 If Tests Fail

### Rate Limiting Not Working:
1. Check if express-rate-limit is installed
2. Verify middleware is applied before routes
3. Check if rate limits are configured correctly
4. Try from different IP or clear browser

### Input Validation Failing:
1. Check if validator is installed
2. Verify validation functions are called
3. Check error responses in Network tab
4. Ensure inputs are being validated server-side

### Authentication Issues:
1. Check session middleware is configured
2. Verify requireAuth middleware is applied
3. Check cookie settings in browser
4. Clear cookies and try again

### File Upload Issues:
1. Check multer is installed
2. Verify file filter configuration
3. Check upload directory permissions
4. Ensure size/count limits are set

## 📱 Browser Testing

### Test in Multiple Browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

All should have same security behavior.

## 🔒 Security Verification Tools

### Online Tools:

1. **Security Headers Check:**
   - https://securityheaders.com/

2. **SSL Test (Production):**
   - https://www.ssllabs.com/ssltest/

3. **Website Security Scanner:**
   - https://observatory.mozilla.org/

4. **npm Audit:**
   ```bash
   npm audit
   ```

## ✅ Production Readiness

After all tests pass:

- [ ] All security tests passed
- [ ] Changed admin credentials
- [ ] Set SESSION_SECRET
- [ ] Enabled HTTPS
- [ ] Configured firewall
- [ ] Set up monitoring
- [ ] Created backups
- [ ] Documented procedures

## 🎊 Success Criteria

Your application is secure if:

✅ All tests pass
✅ npm audit shows 0 vulnerabilities
✅ Security headers are present
✅ Rate limiting works
✅ Input validation works
✅ Authentication is secure
✅ Files are protected
✅ No console logs in production
✅ Error handling is secure
✅ Sessions are secure

## 📞 Support

If security tests fail, review:
1. `SECURITY.md` - Detailed security docs
2. `CODE_CLEANUP_AND_SECURITY.md` - Implementation details
3. Server console output for errors
4. Browser console for client errors

---

**Test Suite Version:** 1.0
**Last Updated:** November 2025
**Status:** ✅ Ready for Testing



