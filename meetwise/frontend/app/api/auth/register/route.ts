import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/jwt';

export async function POST(req: Request) {
    try {
        const { username, email, password, plan } = await req.json();

        if (!username || !email || !password) {
            return NextResponse.json({ error: 'Username, email, and password are required' }, { status: 400 });
        }

        await connectDB();

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return NextResponse.json(
                { error: existingUser.email === email ? 'Email already registered' : 'Username already taken' },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            username,
            email: email.toLowerCase(),
            password: hashedPassword,
            plan: plan || 'free',
        });

        // Generate JWT
        const token = signToken({ userId: user._id.toString(), email: user.email });

        // Trigger welcome email (fire-and-forget)
        fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/welcome`, {
            method: 'POST',
            body: JSON.stringify({ email, username }),
            headers: { 'Content-Type': 'application/json' },
        }).catch((err) => console.error('Failed to trigger welcome email:', err));

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
        console.error('Register Error:', error);
        return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
    }
}
