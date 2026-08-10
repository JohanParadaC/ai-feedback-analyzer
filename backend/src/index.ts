import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// La configuración se valida al importarse: si falta una variable, el proceso
// termina aquí con un mensaje claro en vez de fallar más tarde en runtime.
import env, { corsOrigins } from './config/env.js';
import apiRoutes from './routes/api.routes.js';
import authRoutes from './routes/auth.routes.js';
import { connectDB } from './config/db.js';

const app = express();

// Detrás de un proxy (Render, Railway, nginx…) la IP del socket es la del
// proxy, así que sin esto TODOS los usuarios comparten el mismo contador de
// rate limiting. Se configura con un número exacto de saltos en vez de `true`:
// confiar en toda la cadena permitiría a cualquiera falsear su IP con una
// cabecera X-Forwarded-For y saltarse el límite.
if (env.TRUST_PROXY > 0) {
    app.set('trust proxy', env.TRUST_PROXY);
}

// 1. CORS: solo los orígenes declarados en CORS_ORIGIN.
app.use(cors({
    origin: corsOrigins,
    methods: ['GET', 'POST'],
}));

// Limitamos el tamaño del body: sin esto, un POST de varios MB llega a la capa
// de validación y consume memoria por cada petición concurrente.
app.use(express.json({ limit: '100kb' }));

// 2. Rate limiting general de la API.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 50,
    message: { error: 'Has superado el límite de peticiones. Por favor, intenta de nuevo en 15 minutos. 🛡️' },
    standardHeaders: true,
    legacyHeaders: false,
});

// 3. Rate limiting específico para login/registro. El límite general de 50 es
//    demasiado holgado para un endpoint de contraseñas: 10 intentos por ventana
//    hace inviable la fuerza bruta sin estorbar a un usuario real.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Demasiados intentos de autenticación. Espera 15 minutos e intenta de nuevo. 🛡️' },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Solo penalizamos los intentos fallidos.
});

// Las rutas de auth se montan antes que /api para que apliquen su propio límite.
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api', apiLimiter, apiRoutes);

// Healthcheck para plataformas de despliegue y monitorización.
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
});

// Manejador de errores final: evita que un throw inesperado tumbe el proceso
// o filtre un stack trace al cliente.
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('❌ Error no controlado:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
});

const startServer = async () => {
    // Conectamos a Mongo ANTES de aceptar tráfico: si arrancamos primero,
    // las peticiones que lleguen durante la conexión fallan de forma confusa.
    await connectDB();

    app.listen(env.PORT, () => {
        console.log(`🚀 Servidor backend escuchando en http://localhost:${env.PORT} [${env.NODE_ENV}]`);
        console.log(`🔓 CORS habilitado para: ${corsOrigins.join(', ')}`);
    });
};

startServer();
