import mongoose from 'mongoose';
import env from './env.js';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(env.MONGO_URI);
        console.log(`🍃 MongoDB conectado: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error);
        process.exit(1);
    }
};
