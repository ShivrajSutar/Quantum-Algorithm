# Email Configuration for QuantumAlgo Platform

## Quick Start with .env File

Create a `.env` file in the project root:

```env
# Email Settings (required for verification emails)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Optional (defaults shown)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
JWT_SECRET=your-random-secret-key-change-in-production
PORT=3000
```

Then restart the server:
```bash
node server.js
```

## Email Verification Flow

1. **User Registration** → Receives 6-digit code via email
2. **Enter Code** → Verification modal appears
3. **Verify Email** → Account activated, can login
4. **Login Protection** → Unverified users can't login until verified

## Setup Gmail App Password (Easiest)

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Click "2-Step Verification" and follow setup

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select app: "Mail"
3. Select device: "Other" → Name it "QuantumAlgo"
4. Click "Generate"
5. Copy the 16-character password (xxxx xxxx xxxx xxxx)

### Step 3: Add to .env
```env
EMAIL_USER=youremail@gmail.com
EMAIL_PASSWORD=xxxxxxxxxxxxxxxx
```

## Testing Without Real Email (Development)

Use **Ethereal Email** - a fake SMTP service for testing:

1. Visit https://ethereal.email/
2. Click "Create Ethereal Account"
3. Copy credentials to `.env`:
```env
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
EMAIL_USER=generated-username@ethereal.email
EMAIL_PASSWORD=generated-password
```

4. View sent emails at: https://ethereal.email/messages

Emails won't be delivered to real inboxes, but you can see them in the Ethereal dashboard.

## Other Email Providers

### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=SG.your-api-key
```

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
EMAIL_USER=postmaster@yourdomain.mailgun.org
EMAIL_PASSWORD=your-mailgun-smtp-password
```

## Security Notes

- ⚠️ `.env` is in `.gitignore` - never commit it
- Use App Passwords, not your main email password
- Change `JWT_SECRET` to a strong random value for production
- In production, use environment variables, not `.env` files

## Troubleshooting

**"Invalid login" with Gmail:**
- Enable 2FA first
- Use App Password (16 characters), not regular password
- Disable "Less secure apps" (use App Password instead)

**Emails not sending:**
- Check SMTP credentials are correct
- Verify port 587 isn't blocked by firewall
- Check server console for error messages
- Test with Ethereal first to isolate the issue

**"Email not verified" on login:**
- Check spam/junk folder for verification email
- Click "Resend Code" in the verification modal
- Verification codes expire after 15 minutes
