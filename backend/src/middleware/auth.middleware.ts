import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ✨ TRUCO TYPESCRIPT: Extendemos la petición (Request) para poder inyectarle el ID del usuario
export interface AuthRequest extends Request {
    user?: {
        id: string;
    };
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
    let token;

    // 1. Verificamos si el Frontend nos mandó el token en la cabecera (Headers)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // El token viene así: "Bearer eyJhbGciOiJIUzI1NiIsInR..." (separamos por el espacio y tomamos el 2do elemento)
            token = req.headers.authorization.split(' ')[1];

            // 2. Verificamos que el token sea original y no haya caducado
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'mi_secreto_super_seguro_123') as { id: string };

            // 3. ¡Magia! Si es válido, le pegamos el ID de la empresa a la petición y lo dejamos pasar
            req.user = { id: decoded.id };

            next(); // 👉 "Puedes pasar a la cocina"
        } catch (error) {
            console.error("❌ Intento de acceso denegado (Token inválido):", error);
            res.status(401).json({ error: 'No autorizado. Tu sesión ha expirado o el token es inválido. 🛑' });
        }
    }

    // Si ni siquiera traía token...
    if (!token) {
        res.status(401).json({ error: 'No autorizado. Necesitas iniciar sesión primero. 🛑' });
    }
};