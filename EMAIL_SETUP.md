# Email Configuration Guide

This guide explains how to configure email functionality for the MeetWise application using Gmail SMTP through Supabase.

## Overview

MeetWise uses Supabase for authentication, which handles sending emails for:
- **Email Verification**: Sent when users sign up
- **Password Reset**: Sent when users request password reset
- **Magic Link Login**: Alternative authentication method

## Gmail SMTP Configuration

### Prerequisites

✅ Gmail account: shababhanaan22@gmail.com  
✅ Gmail App Password created: `cczt xdiq nwog jmqx`  
✅ Supabase project access

### Supabase Dashboard Setup

Follow these steps to configure SMTP in your Supabase project:

1. **Access Supabase Dashboard**
   - Go to https://app.supabase.com
   - Select your MeetWise project

2. **Navigate to Email Settings**
   - Click **Authentication** in the left sidebar
   - Click **Providers** tab
   - Click **Email** provider

3. **Enable Custom SMTP**
   - Scroll down to **SMTP Settings** section
   - Toggle **Enable Custom SMTP** to ON

4. **Enter SMTP Configuration**
   ```
   Host:          smtp.gmail.com
   Port:          465
   Username:      shababhanaan22@gmail.com
   Password:      cczt xdiq nwog jmqx
   Sender Email:  shababhanaan22@gmail.com
   Sender Name:   Summaryfy
   ```

5. **Save Configuration**
   - Click **Save** button at the bottom
   - Wait for confirmation message

## Testing Email Functionality

### Test Sign-up Email Verification

1. Start the frontend development server (if not running):
   ```bash
   cd meetwise/frontend
   npm run dev
   ```

2. Open browser and navigate to:
   ```
   http://localhost:3000/register
   ```

3. Register a new account with a **real email address** you can access

4. Check your email inbox for verification email from:
   - **From**: Summaryfy <shababhanaan22@gmail.com>
   - **Subject**: Confirm your signup

5. Click the verification link in the email

### Test Password Reset (if implemented)

1. Navigate to login page
2. Click "Forgot Password" (if available)
3. Enter email address
4. Check inbox for password reset email

## Troubleshooting

### Emails Not Arriving

**Check Spam/Junk Folder**
- Gmail SMTP emails sometimes land in spam initially
- Mark as "Not Spam" to improve deliverability

**Verify Supabase Logs**
1. Go to Supabase Dashboard
2. Navigate to **Logs** → **Auth Logs**
3. Look for SMTP errors or failed email attempts

**Common Issues**

| Issue | Solution |
|-------|----------|
| "Invalid credentials" | Verify App Password is correct (no spaces) |
| "Connection timeout" | Check port 465 is not blocked by firewall |
| "Authentication failed" | Ensure using App Password, not regular Gmail password |
| Emails in spam | Add sender to contacts, mark as not spam |

### Gmail App Password Issues

If you need to regenerate the App Password:

1. Go to https://myaccount.google.com/apppasswords
2. Sign in to shababhanaan22@gmail.com
3. Create new App Password for "Mail"
4. Update the password in Supabase SMTP settings

## Email Templates

Supabase provides default email templates. To customize:

1. Go to **Authentication** → **Email Templates**
2. Edit templates for:
   - Confirmation email
   - Password reset
   - Magic link
   - Email change

You can use variables like:
- `{{ .ConfirmationURL }}` - Verification link
- `{{ .Token }}` - Verification token
- `{{ .SiteURL }}` - Your app URL

## Security Notes

⚠️ **Important Security Considerations:**

- The App Password (`cczt xdiq nwog jmqx`) is stored securely in Supabase
- Never commit SMTP credentials to version control
- This configuration is stored in Supabase's secure backend
- Rotate App Password periodically for security

## Current Configuration Summary

```yaml
SMTP Provider: Gmail
Host: smtp.gmail.com
Port: 465 (SSL/TLS)
Authentication: App Password
Sender: Summaryfy <shababhanaan22@gmail.com>
Use Case: Supabase Authentication Emails
```

## Next Steps

1. ✅ Configure SMTP in Supabase Dashboard (follow steps above)
2. ✅ Test email verification with new user registration
3. ✅ Verify emails are delivered successfully
4. ✅ Customize email templates (optional)
5. ✅ Monitor email deliverability in Supabase logs

## Support

If you encounter issues:
- Check Supabase documentation: https://supabase.com/docs/guides/auth/auth-smtp
- Review Gmail SMTP guide: https://support.google.com/mail/answer/7126229
- Check Supabase Auth logs for detailed error messages
