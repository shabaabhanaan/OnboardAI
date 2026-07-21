import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE || 'sandbox';

const PAYPAL_API = PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken() {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(`PayPal Auth Error: ${errData.error_description || response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
}

export async function POST(req: Request) {
    try {
        const { orderId, isMock } = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        // 1. Verify User Session Token
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
        }
        const token = authHeader.replace("Bearer ", "");

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
        
        // Auth client to verify user identity
        const authSupabase = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { user }, error: authError } = await authSupabase.auth.getUser(token);
        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Service client to update database bypass RLS
        const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

        // 2. Handle Mock Order
        if (isMock || !PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            if (typeof orderId === 'string' && orderId.startsWith('MOCK-PAYPAL-')) {
                // Perform database update for mock mode
                const { error: updateError } = await serviceSupabase
                    .from('profiles')
                    .update({ plan: 'pro' })
                    .eq('id', user.id);

                if (updateError) {
                    console.error("Mock Upgrade Error:", updateError);
                    throw new Error(`Database update failed: ${updateError.message}`);
                }

                console.log(`User ${user.id} upgraded to Pro via PayPal Mock Mode`);
                return NextResponse.json({ success: true, status: "COMPLETED", isMock: true });
            } else {
                return NextResponse.json({ error: "Invalid mock transaction" }, { status: 400 });
            }
        }

        // 3. Handle Real Order
        const accessToken = await getPayPalAccessToken();

        const captureRes = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!captureRes.ok) {
            const errData = await captureRes.json();
            throw new Error(`PayPal Order Capture Error: ${errData.message || captureRes.statusText}`);
        }

        const captureData = await captureRes.json();

        if (captureData.status === 'COMPLETED') {
            // Verify custom_id matches user.id to prevent spoofing
            const purchaseUnit = captureData.purchase_units?.[0];
            const customId = purchaseUnit?.payments?.captures?.[0]?.custom_id || purchaseUnit?.custom_id;

            if (customId !== user.id) {
                console.error(`User ID mismatch: order custom_id=${customId}, session user.id=${user.id}`);
                return NextResponse.json({ error: "Payment verification failed: User mismatch" }, { status: 400 });
            }

            // Upgrade User Plan in database
            const { error: dbError } = await serviceSupabase
                .from('profiles')
                .update({ plan: 'pro' })
                .eq('id', user.id);

            if (dbError) {
                console.error("DB Upgrade Error:", dbError);
                throw new Error(`Payment captured but user upgrade failed: ${dbError.message}`);
            }

            console.log(`User ${user.id} upgraded to Pro via PayPal Order ${orderId}`);
            return NextResponse.json({ success: true, status: "COMPLETED", isMock: false });
        }

        return NextResponse.json({ success: false, status: captureData.status });

    } catch (err: any) {
        console.error("PayPal Capture Order Error:", err);
        return NextResponse.json({ error: err.message || "Failed to capture PayPal order" }, { status: 500 });
    }
}
