import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import CodeReview from '@/models/CodeReview';
import { getUserFromHeader } from '@/lib/jwt';

// GET /api/onboardings/[id]/reviews
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const decoded = getUserFromHeader(req.headers.get('Authorization'));
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await connectDB();

        const reviews = await CodeReview.find({ onboardingId: id })
            .sort({ createdAt: -1 })
            .lean();

        const mapped = reviews.map((r: any) => ({
            ...r,
            id: r._id.toString(),
            onboarding_id: r.onboardingId.toString(),
            created_at: r.createdAt,
        }));

        return NextResponse.json(mapped);
    } catch (error: any) {
        console.error('Get Code Reviews Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to get code reviews' }, { status: 500 });
    }
}

// POST /api/onboardings/[id]/reviews
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const decoded = getUserFromHeader(req.headers.get('Authorization'));
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { filename, code_snippet, review_feedback } = await req.json();

        await connectDB();

        const review = await CodeReview.create({
            onboardingId: id,
            filename,
            code_snippet,
            review_feedback,
        });

        const result = review.toObject();
        return NextResponse.json({
            ...result,
            id: result._id.toString(),
            onboarding_id: result.onboardingId.toString(),
            created_at: result.createdAt,
        });
    } catch (error: any) {
        console.error('Create Code Review Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create code review' }, { status: 500 });
    }
}
