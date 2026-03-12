import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
    text: string;
    sentiment: string;
    score: number;
    key_complaint: string | null;
    key_highlight: string | null;
    date: Date;
}

const FeedbackSchema: Schema = new Schema({
    text: { type: String, required: true },
    sentiment: { type: String, required: true, enum: ['positivo', 'neutral', 'negativo'] },
    score: { type: Number, required: true },
    key_complaint: { type: String, default: null },
    key_highlight: { type: String, default: null },
    date: { type: Date, required: true }
}, {
    timestamps: true
});

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);