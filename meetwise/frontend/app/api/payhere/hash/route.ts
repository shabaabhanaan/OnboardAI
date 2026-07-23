import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserFromHeader } from '@/lib/jwt';

function md5(text: string): string {
    return crypto.createHash('md5').update(text).digest('hex').toUpperCase();
}

export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        const decoded = getUserFromHeader(authHeader);
        if (!decoded) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount, orderId } = await req.json();

        if (!amount || !orderId) {
            return NextResponse.json({ error: "Amount and orderId are required" }, { status: 400 });
        }

        const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID || "121XXXX";
        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET || "4515XXX";
        const currency = "LKR";

        // PayHere requires amount formatted with 2 decimal places (e.g. 3600.00)
        const amountFormatted = Number(amount).toFixed(2);

        // Hashing algorithm per PayHere specification:
        // hash = UPPERCASE(MD5(merchant_id + order_id + amount_formatted + currency + UPPERCASE(MD5(merchant_secret))))
        const secretHash = md5(merchantSecret);
        const hashString = `${merchantId}${orderId}${amountFormatted}${currency}${secretHash}`;
        const finalHash = md5(hashString);

        const isMock = !process.env.PAYHERE_MERCHANT_SECRET ||
            process.env.PAYHERE_MERCHANT_SECRET === '4515XXX' ||
            process.env.NEXT_PUBLIC_PAYHERE_MODE === 'mock';

        return NextResponse.json({
            hash: finalHash,
            merchantId,
            currency,
            amountFormatted,
            isMock,
            userId: decoded.userId
        });
    } catch (error: any) {
        console.error("PayHere Hash Generation Error:", error);
        return NextResponse.json({ error: error.message || "Failed to generate PayHere hash" }, { status: 500 });
    }
}
