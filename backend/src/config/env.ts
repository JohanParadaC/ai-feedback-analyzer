import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Esquema de variables de entorno.
 *
 * La aplicación NO arranca si falta algo o si un valor es inseguro. Preferimos
 * fallar en el arranque, con un mensaje claro, antes que arrancar con valores
 * por defecto inseguros que solo se descubren cuando alguien ya explotó el fallo.
 */
const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('development'),

    PORT: z.coerce.number().int().positive().default(3000),

    MONGO_URI: z
        .string()
        .min(1, 'MONGO_URI es obligatoria (ej: mongodb://localhost:27017/feedback_analyzer)'),

    OPENAI_API_KEY: z
        .string()
        .min(1, 'OPENAI_API_KEY es obligatoria. Consíguela en https://platform.openai.com/api-keys'),

    // Un secreto corto es un secreto adivinable: cualquiera que lo rompa puede
    // firmar tokens y suplantar a cualquier empresa del sistema.
    JWT_SECRET: z
        .string()
        .min(32, 'JWT_SECRET debe tener al menos 32 caracteres. Genera uno con: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'),

    JWT_EXPIRES_IN: z.string().default('30d'),

    // Orígenes permitidos por CORS, separados por coma.
    CORS_ORIGIN: z.string().default('http://localhost:5173'),

    // Número de proxies de confianza delante de la aplicación.
    // 0 = ninguno (desarrollo local). Detrás de Render, Railway o nginx suele ser 1.
    // Importa porque el rate limiting usa la IP: con 0 detrás de un proxy, todos
    // los usuarios comparten el mismo contador; con un valor demasiado alto,
    // cualquiera puede falsear su IP y saltarse el límite.
    TRUST_PROXY: z.coerce.number().int().min(0).max(10).default(0),

    // ── Cuotas por cuenta ──
    // El límite por IP no protege de verdad: quien rota IPs lo esquiva. Estas
    // cuotas se cuentan por cuenta, que es lo que realmente acota el gasto en
    // OpenAI y el crecimiento de la base de datos.
    MAX_ANALISIS_DIARIOS: z.coerce.number().int().positive().default(200),
    MAX_RESENAS_POR_CUENTA: z.coerce.number().int().positive().default(5000),

    // Máximo de reseñas por petición en el endpoint de lote.
    MAX_LOTE: z.coerce.number().int().positive().max(200).default(50),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    const detalles = parsed.error.issues
        .map((issue) => `  ✗ ${issue.path.join('.')}: ${issue.message}`)
        .join('\n');

    console.error(
        '\n❌ Configuración de entorno inválida. Revisa tu archivo backend/.env\n' +
        '   (puedes partir de backend/.env.example)\n\n' +
        detalles +
        '\n'
    );
    process.exit(1);
}

const env = parsed.data;

/**
 * Lista de orígenes permitidos por CORS, ya normalizada.
 */
export const corsOrigins = env.CORS_ORIGIN.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

export const isProduction = env.NODE_ENV === 'production';

export default env;
