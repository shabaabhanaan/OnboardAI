import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getUserFromHeader } from '@/lib/jwt';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        const decoded = getUserFromHeader(authHeader);

        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                plan: user.plan,
            },
        });
    } catch (error: any) {
        console.error('Get User Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to get user' }, { status: 500 });
    }
}
