import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
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
        const { orderId, isMock } = await req.json();

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        // 1. Verify User via JWT
        const authHeader = req.headers.get("Authorization");
        const decoded = getUserFromHeader(authHeader);
        if (!decoded) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await connectDB();

        // 2. Handle Mock Order
        if (isMock || !PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            if (typeof orderId === 'string' && orderId.startsWith('MOCK-PAYPAL-')) {
                // Upgrade user plan in MongoDB
                const updateResult = await User.findByIdAndUpdate(
                    decoded.userId,
                    { plan: 'pro' },
                    { new: true }
                );

                if (!updateResult) {
                    throw new Error('User not found for plan upgrade');
                }

                console.log(`User ${decoded.userId} upgraded to Pro via PayPal Mock Mode`);
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
            // Verify custom_id matches user to prevent spoofing
            const purchaseUnit = captureData.purchase_units?.[0];
            const customId = purchaseUnit?.payments?.captures?.[0]?.custom_id || purchaseUnit?.custom_id;

            if (customId !== decoded.userId) {
                console.error(`User ID mismatch: order custom_id=${customId}, session user.id=${decoded.userId}`);
                return NextResponse.json({ error: "Payment verification failed: User mismatch" }, { status: 400 });
            }

            // Upgrade User Plan in MongoDB
            const updateResult = await User.findByIdAndUpdate(
                decoded.userId,
                { plan: 'pro' },
                { new: true }
            );

            if (!updateResult) {
                throw new Error('Payment captured but user upgrade failed: User not found');
            }

            console.log(`User ${decoded.userId} upgraded to Pro via PayPal Order ${orderId}`);
            return NextResponse.json({ success: true, status: "COMPLETED", isMock: false });
        }

        return NextResponse.json({ success: false, status: captureData.status });

    } catch (err: any) {
        console.error("PayPal Capture Order Error:", err);
        return NextResponse.json({ error: err.message || "Failed to capture PayPal order" }, { status: 500 });
    }
}
