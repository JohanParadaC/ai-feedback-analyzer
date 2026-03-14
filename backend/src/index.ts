import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit'; // ✨ IMPORTAMOS EL GUARDIA
import apiRoutes from './routes/api.routes.js';
// ✨ NUEVO: Importamos las rutas del recepcionista (auth)
import authRoutes from './routes/auth.routes.js';
import { connectDB } from './config/db.js';

// Carga las variables de entorno (API Key y MONGO_URI)
dotenv.config();

// ✨ ENCENDEMOS LA BASE DE DATOS ANTES DE ARRANCAR EL SERVIDOR ✨
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// ✨ 1. BLINDAJE CORS: Solo aceptamos peticiones de tu frontend local
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
}));

// Middlewares de parseo
app.use(express.json());

// ✨ 2. RATE LIMITING: Máximo 50 peticiones cada 15 minutos por usuario (IP)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, // Límite de 50 peticiones
    message: { error: "Has superado el límite de peticiones. Por favor, intenta de nuevo en 15 minutos. 🛡️" },
    standardHeaders: true,
    legacyHeaders: false,
});

// Montamos todas nuestras rutas bajo el prefijo "/api" y le ponemos el escudo
app.use('/api', apiLimiter, apiRoutes);

// ✨ NUEVO: Montamos las puertas de Registro y Login en "/api/auth"
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor Backend BLINDADO corriendo de forma limpia en http://localhost:${PORT}`);
});