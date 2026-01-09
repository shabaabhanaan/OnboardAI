# Email Verification Testing Guide

## Quick Test Instructions

Your Supabase SMTP is now configured! Follow these steps to test email verification:

### 1. Open Registration Page

Open your browser and go to:
```
http://localhost:3000/register
```

### 2. Register a New User

Fill in the form with:
- **Username**: Any username (e.g., "testuser")
- **Email**: **Use a REAL email address you can access**
- **Password**: At least 6 characters (e.g., "testpass123")

### 3. Submit the Form

Click **"Create Account"** button

### 4. Check What Happens

Supabase has two possible behaviors:

**Option A: Email Confirmation Required**
- You'll see a message about checking your email
- Check your inbox for email from: **Summaryfy** <shababhanaan22@gmail.com>
- Click the verification link in the email
- You'll be redirected and logged in

**Option B: Auto-Login (if email confirmation disabled)**
- You'll be automatically logged in
- Redirected to `/dashboard`
- No email verification needed

### 5. Check Your Email

Look for an email from:
- **From**: Summaryfy <shababhanaan22@gmail.com>
- **Subject**: "Confirm your signup" (or similar)

**Check spam folder if not in inbox!**

### 6. Verify Email Settings in Supabase

If you want to **require email verification**:

1. Go to https://app.supabase.com
2. Navigate to **Authentication** → **Providers** → **Email**
3. Find **"Confirm email"** setting
4. Toggle it **ON** if you want users to verify their email before logging in
5. Save changes

## Testing Sign-in

After registration (and email verification if required):

1. Go to http://localhost:3000/login
2. Enter the email and password you registered with
3. Click **"Sign In"**
4. You should be redirected to `/dashboard`

## Testing Google Sign-in

On either login or register page:

1. Click **"Continue with Google"** button
2. You'll be redirected to Google OAuth
3. Select your Google account
4. Grant permissions
5. You'll be redirected back to `/dashboard`

**Note**: Google OAuth must be configured in Supabase dashboard for this to work.

## Troubleshooting

### Emails Not Arriving

1. **Check spam/junk folder** - Gmail SMTP emails often land in spam initially
2. **Check Supabase logs**:
   - Go to Supabase Dashboard → Logs → Auth Logs
   - Look for email sending errors
3. **Verify SMTP settings**:
   - Authentication → Providers → Email → SMTP Settings
   - Confirm all credentials are correct

### Login Fails After Registration

- If email confirmation is required but you didn't verify, you can't log in
- Check your email for the verification link
- Or disable email confirmation in Supabase settings

### Google Sign-in Not Working

- Google OAuth must be configured in Supabase
- Go to Authentication → Providers → Google
- Add your Google OAuth credentials

## Expected Results

✅ **Registration works** - Form submits successfully  
✅ **Email arrives** - From Summaryfy <shababhanaan22@gmail.com>  
✅ **Email verification link works** - Clicking link verifies account  
✅ **Login works** - Can sign in with email/password  
✅ **Dashboard loads** - Redirected to `/dashboard` after login

## Current Server Status

Your dev server is running on:
- **URL**: http://localhost:3000
- **Status**: ✅ Running
- **Recent requests**: /register, /login pages are loading successfully

## Next Steps

1. Test registration with a real email
2. Check your inbox for verification email
3. Report back if emails are arriving correctly
4. If issues, check Supabase Auth logs for errors
