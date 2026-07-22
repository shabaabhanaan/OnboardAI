import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CodebaseFile from '@/models/CodebaseFile';
import { getUserFromHeader } from '@/lib/jwt';

// GET /api/onboardings/[id]/files
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const decoded = getUserFromHeader(req.headers.get('Authorization'));
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await connectDB();

        const files = await CodebaseFile.find({ onboardingId: id })
            .select('path content')
            .lean();

        const mapped = files.map((f: any) => ({
            ...f,
            id: f._id.toString(),
            onboarding_id: f.onboardingId?.toString(),
        }));

        return NextResponse.json(mapped);
    } catch (error: any) {
        console.error('Get Codebase Files Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to get codebase files' }, { status: 500 });
    }
}
