import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOnboarding extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    title: string;
    notes: string;
    summary: string;
    key_points: string[];
    action_items: Array<{
        task: string;
        assignee?: string;
        priority?: string;
        completed: boolean;
    }>;
    health_audit: {
        score?: string;
        positives?: string[];
        friction_points?: string[];
        recommendations?: string[];
    };
    dependency_graph: string;
    createdAt: Date;
    updatedAt: Date;
}

const OnboardingSchema = new Schema<IOnboarding>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        title: { type: String, required: true },
        notes: { type: String, default: '' },
        summary: { type: String, default: '' },
        key_points: { type: [String], default: [] },
        action_items: {
            type: [
                {
                    task: { type: String },
                    assignee: { type: String },
                    priority: { type: String },
                    completed: { type: Boolean, default: false },
                },
            ],
            default: [],
        },
        health_audit: {
            type: Schema.Types.Mixed,
            default: {},
        },
        dependency_graph: { type: String, default: '' },
    },
    { timestamps: true }
);

const Onboarding: Model<IOnboarding> =
    mongoose.models.Onboarding || mongoose.model<IOnboarding>('Onboarding', OnboardingSchema);

export default Onboarding;
