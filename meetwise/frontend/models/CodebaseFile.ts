import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICodebaseFile extends Document {
    _id: mongoose.Types.ObjectId;
    onboardingId: mongoose.Types.ObjectId;
    path: string;
    content: string;
    createdAt: Date;
}

const CodebaseFileSchema = new Schema<ICodebaseFile>(
    {
        onboardingId: { type: Schema.Types.ObjectId, ref: 'Onboarding', required: true, index: true },
        path: { type: String, required: true },
        content: { type: String, default: '' },
    },
    { timestamps: true }
);

const CodebaseFile: Model<ICodebaseFile> =
    mongoose.models.CodebaseFile || mongoose.model<ICodebaseFile>('CodebaseFile', CodebaseFileSchema);

export default CodebaseFile;
