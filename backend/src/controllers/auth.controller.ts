import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// ✨ FUNCION MAGICA: Crea la tarjeta magnética (Token) que durará 30 días
const generateToken = (id: string) => {
    // Usamos una clave secreta del .env, o una por defecto si se nos olvida ponerla
    return jwt.sign({ id }, process.env.JWT_SECRET || 'mi_secreto_super_seguro_123', {
        expiresIn: '30d',
    });
};

// 📝 REGISTRAR NUEVA EMPRESA
export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { companyName, email, password } = req.body;

        // 1. Verificamos que no nos dejen campos vacíos
        if (!companyName || !email || !password) {
            res.status(400).json({ error: 'Por favor, llena todos los campos.' });
            return;
        }

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
            token: generateToken(user._id.toString()) // ✨ CORRECCIÓN TS: Usamos .toString()
        });

    } catch (error) {
        console.error("❌ Error en el registro:", error);
        res.status(500).json({ error: 'Error del servidor al registrar la empresa.' });
    }
};

// 🚪 INICIAR SESIÓN
export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // 1. Buscamos a la empresa por su correo
        const user = await User.findOne({ email });

        // 2. Si la empresa existe, verificamos si la contraseña coincide con la encriptada
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                companyName: user.companyName,
                email: user.email,
                token: generateToken(user._id.toString()) // ✨ CORRECCIÓN TS: Usamos .toString()
            });
        } else {
            res.status(401).json({ error: 'Correo o contraseña incorrectos. 🛑' });
        }
    } catch (error) {
        console.error("❌ Error en el login:", error);
        res.status(500).json({ error: 'Error del servidor al iniciar sesión.' });
    }
};