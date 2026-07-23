import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromHeader } from '@/lib/jwt';

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

        // 2. Upgrade user plan in MongoDB
        const updateResult = await User.findByIdAndUpdate(
            decoded.userId,
            { plan: 'pro' },
            { new: true }
        );

        if (!updateResult) {
            return NextResponse.json({ error: "User not found for plan upgrade" }, { status: 404 });
        }

        console.log(`User ${decoded.userId} upgraded to Pro via PayHere (Order: ${orderId}, isMock: ${!!isMock})`);
        return NextResponse.json({ success: true, status: "COMPLETED", isMock: !!isMock });

    } catch (err: any) {
        console.error("PayHere Verification Error:", err);
        return NextResponse.json({ error: err.message || "Failed to verify PayHere order" }, { status: 500 });
    }
}
