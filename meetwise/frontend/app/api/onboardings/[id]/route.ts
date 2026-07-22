import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Onboarding from '@/models/Onboarding';
import { getUserFromHeader } from '@/lib/jwt';

// GET /api/onboardings/[id]
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const decoded = getUserFromHeader(req.headers.get('Authorization'));
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await connectDB();

        const data = await Onboarding.findOne({ _id: id, userId: decoded.userId }).lean();
        if (!data) {
            return NextResponse.json({ error: 'Onboarding not found' }, { status: 404 });
        }

        return NextResponse.json({
            ...(data as any),
            id: (data as any)._id.toString(),
            user_id: (data as any).userId.toString(),
            created_at: (data as any).createdAt,
            action_items: (data as any).action_items?.map((item: any) => ({
                ...item,
                task: item.task || item.description,
            })),
        });
    } catch (error: any) {
        console.error('Get Onboarding Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to get onboarding' }, { status: 500 });
    }
}

// DELETE /api/onboardings/[id]
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const decoded = getUserFromHeader(req.headers.get('Authorization'));
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        await connectDB();

        const result = await Onboarding.deleteOne({ _id: id, userId: decoded.userId });
        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Onboarding not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete Onboarding Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to delete onboarding' }, { status: 500 });
    }
}

// PATCH /api/onboardings/[id] — update action items
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const decoded = getUserFromHeader(req.headers.get('Authorization'));
        if (!decoded) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const { action_items } = await req.json();

        await connectDB();

        const updated = await Onboarding.findOneAndUpdate(
            { _id: id, userId: decoded.userId },
            { action_items },
            { new: true, lean: true }
        );

        if (!updated) {
            return NextResponse.json({ error: 'Onboarding not found' }, { status: 404 });
        }

        return NextResponse.json({
            ...(updated as any),
            id: (updated as any)._id.toString(),
            user_id: (updated as any).userId.toString(),
            created_at: (updated as any).createdAt,
        });
    } catch (error: any) {
        console.error('Update Onboarding Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to update onboarding' }, { status: 500 });
    }
}
