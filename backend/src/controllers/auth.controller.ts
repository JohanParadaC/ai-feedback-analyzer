import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import env from '../config/env.js';

const registerSchema = z.object({
    companyName: z.string().trim().min(2, 'El nombre de la empresa debe tener al menos 2 caracteres.').max(100),
    email: z.string().trim().toLowerCase().email('El correo electrónico no es válido.'),
    // 8 caracteres es el mínimo razonable; sin esto se aceptaban contraseñas de
    // un solo carácter y el hash con bcrypt no aporta nada frente a eso.
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.').max(128),
});

const loginSchema = z.object({
    email: z.string().trim().toLowerCase().email('El correo electrónico no es válido.'),
    password: z.string().min(1, 'La contraseña es obligatoria.'),
});

// Crea el token de sesión. El secreto viene de la config validada al arrancar:
// nunca hay un valor por defecto, porque un secreto por defecto en un repo
// público permite a cualquiera firmar tokens válidos.
const generateToken = (id: string) => {
    return jwt.sign({ id }, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
};

// 📝 REGISTRAR NUEVA EMPRESA
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Validamos formato y longitudes antes de tocar la base de datos
        const validData = registerSchema.safeParse(req.body);
        if (!validData.success) {
            res.status(400).json({ error: validData.error.issues[0]?.message || 'Datos de registro inválidos.' });
            return;
        }

        const { companyName, email, password } = validData.data;

        // 2. Verificamos que el correo no esté registrado ya
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ error: 'Esta empresa ya está registrada.' });
            return;
        }

        // 3. Encriptamos la contraseña (Seguridad nivel banco 🏦)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Guardamos a la empresa en la Base de Datos
        const user = await User.create({
            companyName,
            email,
            password: hashedPassword
        });

        // 5. Le devolvemos un saludo y su Token (llave)
        res.status(201).json({
            _id: user._id,
            companyName: user.companyName,
            email: user.email,
            // ✨ CORRECCIÓN TS: Usamos .toString() para convertir el ObjectId correctamente
            token: generateToken(user._id.toString())
        });

    } catch (error) {
        console.error("❌ Error en el registro:", error);
        res.status(500).json({ error: 'Error del servidor al registrar la empresa.' });
    }
};

// 🚪 INICIAR SESIÓN
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const validData = loginSchema.safeParse(req.body);
        if (!validData.success) {
            res.status(401).json({ error: 'Correo o contraseña incorrectos. 🛑' });
            return;
        }

        const { email, password } = validData.data;

        // 1. Buscamos a la empresa por su correo
        const user = await User.findOne({ email });

        // 2. Si la empresa existe, verificamos si la contraseña coincide con la encriptada
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                companyName: user.companyName,
                email: user.email,
                // ✨ CORRECCIÓN TS: Usamos .toString() aquí también
                token: generateToken(user._id.toString())
            });
        } else {
            res.status(401).json({ error: 'Correo o contraseña incorrectos. 🛑' });
        }
    } catch (error) {
        console.error("❌ Error en el login:", error);
        res.status(500).json({ error: 'Error del servidor al iniciar sesión.' });
    }
};