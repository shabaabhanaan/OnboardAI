# PayHere Gateway Setup Guide

To get the payment gateway working, you need to deploy the Supabase Edge Functions and configure your PayHere credentials.

## 1. Get PayHere Credentials
1.  Log in to your [PayHere Dashboard](https://www.payhere.lk/) (Sandbox or Live).
2.  Go to **Settings** -> **Merchants**.
3.  Copy your **Merchant ID**.
4.  Copy your **Merchant Secret**.

## 2. Configure Supabase Secrets
Run these commands in your terminal (using Supabase CLI) to set the environment variables in the cloud:

```bash
supabase secrets set PAYHERE_MERCHANT_ID=your_merchant_id
supabase secrets set PAYHERE_MERCHANT_SECRET=your_merchant_secret
```

## 3. Deploy Edge Functions
Deploy the functions included in the `supabase/functions` directory:

```bash
supabase functions deploy payhere-hash
supabase functions deploy payhere-notify
```

## 4. Why "Failed to start payment processing" appears?
This error usually happens because:
- **Function not deployed**: The app is trying to call `https://your-project.supabase.co/functions/v1/payhere-hash` but it doesn't exist yet.
- **Incorrect URL**: Ensure `NEXT_PUBLIC_SUPABASE_URL` in `.env.local` is correct.
- **CORS Issues**: The function must allow requests from your frontend domain.

## 5. Testing without a Gateway (Mock Mode)
I have updated the `PayHereButton.tsx` to support a "Mock Mode" for testing. You can hold `Shift` while clicking the button to simulate a successful payment if you haven't set up the gateway yet.
