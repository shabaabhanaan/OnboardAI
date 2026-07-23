import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

function md5(text: string): string {
    return crypto.createHash('md5').update(text).digest('hex').toUpperCase();
}

export async function POST(req: Request) {
    try {
        const contentType = req.headers.get('content-type') || '';
        let params: Record<string, string> = {};

        if (contentType.includes('application/x-www-form-urlencoded')) {
            const formData = await req.formData();
            formData.forEach((value, key) => {
                params[key] = value.toString();
            });
        } else {
            params = await req.json();
        }

        const {
            merchant_id,
            order_id,
            payhere_amount,
            payhere_currency,
            status_code,
            md5sig,
            custom_1: userId
        } = params;

        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "4515XXX";

        // 1. Verify Signature
        const secretHash = md5(merchantSecret);
        const signString = `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${secretHash}`;
        const localMd5sig = md5(signString);

        if (localMd5sig !== md5sig) {
            console.error(`PayHere IPN Signature Mismatch for Order ${order_id}`);
            return NextResponse.json({ status: "failed", message: "Invalid Signature" }, { status: 400 });
        }

        // 2. Check Payment Status (status_code "2" = Payment Success)
        if (status_code === "2" && userId) {
            await connectDB();
            const updateResult = await User.findByIdAndUpdate(
                userId,
                { plan: 'pro' },
                { new: true }
            );

            if (!updateResult) {
                console.error(`PayHere IPN: User ${userId} not found`);
                return NextResponse.json({ status: "error", message: "User not found" }, { status: 404 });
            }

            console.log(`User ${userId} upgraded to Pro via PayHere IPN (Order: ${order_id})`);
        }

        return new Response("OK", { status: 200 });
    } catch (error: any) {
        console.error("PayHere IPN Error:", error);
        return NextResponse.json({ error: error.message || "Failed to process PayHere IPN" }, { status: 500 });
    }
}
