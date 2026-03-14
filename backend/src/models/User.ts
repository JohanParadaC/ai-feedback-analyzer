import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    companyName: string;
    email: string;
    password: string; // Aquí guardaremos la contraseña encriptada
}

const UserSchema: Schema = new Schema({
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // ¡Importante! No pueden existir 2 cuentas con el mismo correo
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);