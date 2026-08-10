import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';

// ✨ TRUCO TYPESCRIPT: Extendemos la petición (Request) para poder inyectarle el ID del usuario
export interface AuthRequest extends Request {
    user?: {
        id: string;
    };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    // 1. El header debe existir y venir en formato "Bearer <token>".
    //    Exigimos el espacio para no aceptar cabeceras tipo "BearerXYZ".
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'No autorizado. Necesitas iniciar sesión primero. 🛑' });
        return;
    }

    const token = authHeader.slice('Bearer '.length).trim();

    // 2. "Bearer " sin nada detrás no es un intento válido de autenticación.
    if (!token) {
        res.status(401).json({ error: 'No autorizado. Necesitas iniciar sesión primero. 🛑' });
        return;
    }

    try {
        // 3. Verificamos firma y expiración.
        const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };

        // 4. Si es válido, inyectamos el ID de la empresa en la petición.
        req.user = { id: decoded.id };

        next();
    } catch {
        // No logueamos el token ni el error completo: acabaría en los logs material
        // que sirve para replicar el intento.
        res.status(401).json({ error: 'No autorizado. Tu sesión ha expirado o el token es inválido. 🛑' });
    }
};