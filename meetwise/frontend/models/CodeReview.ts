import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICodeReview extends Document {
    _id: mongoose.Types.ObjectId;
    onboardingId: mongoose.Types.ObjectId;
    filename: string;
    code_snippet: string;
    review_feedback: any;
    createdAt: Date;
}

const CodeReviewSchema = new Schema<ICodeReview>(
    {
        onboardingId: { type: Schema.Types.ObjectId, ref: 'Onboarding', required: true, index: true },
        filename: { type: String, required: true },
        code_snippet: { type: String, default: '' },
        review_feedback: { type: Schema.Types.Mixed, default: {} },
    },
    { timestamps: true }
);

const CodeReview: Model<ICodeReview> =
    mongoose.models.CodeReview || mongoose.model<ICodeReview>('CodeReview', CodeReviewSchema);

export default CodeReview;
