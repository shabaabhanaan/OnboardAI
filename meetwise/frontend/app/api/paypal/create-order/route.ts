import { NextResponse } from 'next/server';
import { getUserFromHeader } from '@/lib/jwt';

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
        // 1. Verify User via JWT
        const authHeader = req.headers.get("Authorization");
        const decoded = getUserFromHeader(authHeader);
        if (!decoded) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Mock mode check
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            console.log("PayPal credentials missing. Returning mock order ID for testing.");
            return NextResponse.json({ 
                orderId: `MOCK-PAYPAL-${Date.now()}`,
                isMock: true
            });
        }

        // 2. Fetch Access Token from PayPal
        const accessToken = await getPayPalAccessToken();

        // 3. Create PayPal Order
        const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [
                    {
                        amount: {
                            currency_code: 'USD',
                            value: '19.00',
                        },
                        description: 'OnboardAI Pro Plan subscription',
                        custom_id: decoded.userId, // Store user ID in custom_id to match during capture
                    },
                ],
            }),
        });

        if (!orderRes.ok) {
            const errData = await orderRes.json();
            throw new Error(`PayPal Order Creation Error: ${errData.message || orderRes.statusText}`);
        }

        const orderData = await orderRes.json();
        return NextResponse.json({ orderId: orderData.id, isMock: false });

    } catch (err: any) {
        console.error("PayPal Create Order Error:", err);
        return NextResponse.json({ error: err.message || "Failed to create PayPal order" }, { status: 500 });
    }
}
