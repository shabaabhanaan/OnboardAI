import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISyncLog extends Document {
    _id: mongoose.Types.ObjectId;
    onboardingId: mongoose.Types.ObjectId;
    event: string;
    branch: string;
    commitHash: string;
    status: string;
    details: string;
    createdAt: Date;
}

const SyncLogSchema = new Schema<ISyncLog>(
    {
        onboardingId: { type: Schema.Types.ObjectId, ref: 'Onboarding', required: true, index: true },
        event: { type: String, required: true },
        branch: { type: String, default: '' },
        commitHash: { type: String, default: '' },
        status: { type: String, default: 'success' },
        details: { type: String, default: '' },
    },
    { timestamps: true }
);

const SyncLog: Model<ISyncLog> =
    mongoose.models.SyncLog || mongoose.model<ISyncLog>('SyncLog', SyncLogSchema);

export default SyncLog;
