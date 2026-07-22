import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Onboarding from '@/models/Onboarding';
import CodebaseFile from '@/models/CodebaseFile';
import User from '@/models/User';
import { getUserFromHeader } from '@/lib/jwt';

// GET /api/onboardings — list all onboardings for authenticated user
export async function GET(req: Request) {
    try {
        const decoded = getUserFromHeader(req.headers.get('Authorization'));
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const data = await Onboarding.find({ userId: decoded.userId })
            .sort({ createdAt: -1 })
            .lean();

        // Map for frontend compatibility
        const mapped = data.map((m: any) => ({
            ...m,
            id: m._id.toString(),
            user_id: m.userId.toString(),
            created_at: m.createdAt,
            action_items: m.action_items?.map((item: any) => ({
                ...item,
                task: item.task || item.description,
            })),
        }));

        return NextResponse.json(mapped);
    } catch (error: any) {
        console.error('List Onboardings Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to list onboardings' }, { status: 500 });
    }
}

// POST /api/onboardings — create new onboarding
export async function POST(req: Request) {
    try {
        const decoded = getUserFromHeader(req.headers.get('Authorization'));
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title, notes, files } = await req.json();

        await connectDB();

        // Check plan limits
        const user = await User.findById(decoded.userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (user.plan === 'free') {
            const count = await Onboarding.countDocuments({ userId: decoded.userId });
            if (count >= 1) {
                return NextResponse.json(
                    { error: 'PLAN_LIMIT_REACHED: Free plan allows only 1 onboarding. Please upgrade to Pro or Team plan for unlimited onboardings.' },
                    { status: 403 }
                );
            }
        }

        // Process with AI via backend route
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
        const onboardResponse = await fetch(`${siteUrl}/api/onboard`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, notes }),
        });

        if (!onboardResponse.ok) {
            const errData = await onboardResponse.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to generate onboarding guide from AI server');
        }

        const aiResult = await onboardResponse.json();

        // Save to MongoDB
        const onboarding = await Onboarding.create({
            userId: decoded.userId,
            title,
            notes,
            summary: aiResult.summary,
            key_points: aiResult.key_points || [],
            action_items: (aiResult.action_items || []).map((item: any) => ({ ...item, completed: false })),
            health_audit: aiResult.health_audit || {},
            dependency_graph: aiResult.dependency_graph || '',
        });

        // Save codebase files if provided
        if (files && files.length > 0) {
            const filesToInsert = files.map((file: any) => ({
                onboardingId: onboarding._id,
                path: file.path,
                content: file.content,
            }));
            await CodebaseFile.insertMany(filesToInsert);
        }

        // Return with frontend-compatible shape
        const result = onboarding.toObject();
        return NextResponse.json({
            ...result,
            id: result._id.toString(),
            user_id: result.userId.toString(),
            created_at: result.createdAt,
        });
    } catch (error: any) {
        console.error('Create Onboarding Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create onboarding' }, { status: 500 });
    }
}
