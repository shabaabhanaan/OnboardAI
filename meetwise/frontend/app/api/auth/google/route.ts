import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';

export async function POST(req: Request) {
    try {
        const { credential } = await req.json();

        if (!credential) {
            return NextResponse.json({ error: 'Google credential ID token is required' }, { status: 400 });
        }

        // Verify the ID token with Google's tokeninfo API
        const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        if (!googleRes.ok) {
            const errData = await googleRes.json();
            return NextResponse.json({ error: errData.error_description || 'Invalid Google token' }, { status: 401 });
        }

        const googleUser = await googleRes.json();
        const { email, name } = googleUser;

        if (!email) {
            return NextResponse.json({ error: 'Email not provided by Google' }, { status: 400 });
        }

        await connectDB();

        // Find or create user
        let user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Generate unique username from Google name or email
            let baseUsername = (name || email.split('@')[0]).replace(/[^a-zA-Z0-9_]/g, '');
            if (!baseUsername) baseUsername = 'user';
            
            let username = baseUsername;
            let counter = 1;
            while (await User.findOne({ username })) {
                username = `${baseUsername}${counter}`;
                counter++;
            }

            user = await User.create({
                username,
                email: email.toLowerCase(),
                plan: 'free',
            });
        }

        // Generate JWT session token
        const token = signToken({ userId: user._id.toString(), email: user.email });

        return NextResponse.json({
            token,
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                plan: user.plan,
            },
        });
    } catch (error: any) {
        console.error('Google Auth Error:', error);
        return NextResponse.json({ error: error.message || 'Google authentication failed' }, { status: 500 });
    }
}
