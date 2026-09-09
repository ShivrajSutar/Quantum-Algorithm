# How to Fix Email Sending - 3 Options

## ✅ Current Status
Your server is running, but emails are **disabled** because no email credentials are configured in `.env`.

**Verification codes are shown in the terminal instead** - this works for testing!

---

## Choose Your Email Setup:

### **OPTION 1: Use Console Only (Easiest - Already Working!)**

**Current setup - no changes needed!**

When users register:
1. Verification code appears in your **terminal/console**
2. User enters the code manually
3. Perfect for testing

**To see codes:** Look at your terminal running `node server.js`

---

### **OPTION 2: Ethereal Email (Fake SMTP - Best for Testing)**

Emails visible in browser, but not delivered to real inboxes.

**Setup:**
1. Visit: https://ethereal.email/
2. Click **"Create Ethereal Account"**
3. Copy the username and password shown
4. Edit `.env` file:
```env
EMAIL_USER=the-username-they-gave-you@ethereal.email
EMAIL_PASSWORD=the-password-they-gave-you
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
```
5. Restart: `node server.js`
6. View sent emails at: https://ethereal.email/messages

---

### **OPTION 3: Gmail (Real Email)**

Sends actual emails to real addresses.

**Setup:**
1. **Enable 2-Factor Authentication:**
   - Go to: https://myaccount.google.com/security
   - Enable "2-Step Verification"

2. **Create App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - App: "Mail"
   - Device: "Other" → name it "QuantumAlgo"
   - Copy the 16-character password (format: xxxx xxxx xxxx xxxx)

3. **Edit `.env` file:**
```env
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=abcdabcdabcdabcd
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

4. **Restart:** `node server.js`

---

## Testing Right Now (Console Mode)

**Your system is already working!** Try this:

1. Open `index.html` in browser
2. Click "🔐 Login" → "Sign up"
3. Register with any email
4. **Check your terminal** - you'll see:
   ```
   🔐 VERIFICATION CODE FOR TESTING:
      User: testuser (test@example.com)
      Code: 123456
   ```
5. Enter that code in the verification modal
6. You're verified! ✅

---

## Which Option Should You Choose?

- **Testing locally?** → Console mode (current setup) ✅
- **Want to see email layout?** → Ethereal (Option 2)
- **Production/Real users?** → Gmail (Option 3)

**The system is working right now in console mode. Want me to help you set up Ethereal or Gmail instead?**
