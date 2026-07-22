import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import SyncLog from '@/models/SyncLog';
import { getUserFromHeader } from '@/lib/jwt';

// GET /api/onboardings/[id]/sync-logs
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const decoded = getUserFromHeader(req.headers.get('Authorization'));
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await connectDB();

        const logs = await SyncLog.find({ onboardingId: id })
            .sort({ createdAt: -1 })
            .lean();

        const mapped = logs.map((l: any) => ({
            ...l,
            id: l._id.toString(),
            onboarding_id: l.onboardingId.toString(),
            commit_hash: l.commitHash,
            created_at: l.createdAt,
        }));

        return NextResponse.json(mapped);
    } catch (error: any) {
        console.error('Get Sync Logs Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to get sync logs' }, { status: 500 });
    }
}
