import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
    text: string;
    sentiment: string;
    score: number;
    key_complaint: string | null;
    key_highlight: string | null;
    date: Date;
    // ✨ NUEVO: Agregamos el ID del usuario para saber de qué empresa es esta reseña
    userId: mongoose.Types.ObjectId;
}

const FeedbackSchema: Schema = new Schema({
    text: { type: String, required: true },
    sentiment: { type: String, required: true, enum: ['positivo', 'neutral', 'negativo'] },
    score: { type: Number, required: true },
    key_complaint: { type: String, default: null },
    key_highlight: { type: String, default: null },
    date: { type: Date, required: true },

    // ✨ NUEVO: Relacionamos la reseña de forma estricta con un Usuario en la base de datos ✨
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', // 🔗 Hace referencia directa al modelo 'User' que creamos
        required: true // Nadie puede guardar una reseña si no está logueado
    }
}, {
    timestamps: true
});

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);