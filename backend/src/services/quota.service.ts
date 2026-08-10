import Feedback from '../models/Feedback.js';
import env from '../config/env.js';

/**
 * Cuotas por cuenta.
 *
 * El rate limiting por IP no basta: quien rota IPs lo esquiva y cada análisis
 * es una llamada de pago a OpenAI con la clave del dueño del proyecto. Estas
 * cuotas se cuentan por cuenta, así que rotar IPs no sirve de nada.
 *
 * Se calculan sobre la propia colección de reseñas en vez de mantener un
 * contador aparte: un contador separado puede desincronizarse (por ejemplo si
 * se borran reseñas), mientras que contar documentos siempre refleja la verdad.
 */

export interface ResultadoCuota {
    permitido: boolean;
    /** Cuántas reseñas más admite ahora mismo la cuenta. */
    disponibles: number;
    motivo?: string;
}

/** Medianoche de hoy en hora del servidor: inicio de la ventana diaria. */
const inicioDelDia = (): Date => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

/**
 * Comprueba si una cuenta puede analizar `cantidad` reseñas más.
 *
 * Devuelve también `disponibles` para que el llamante pueda procesar
 * parcialmente un lote en vez de rechazarlo entero.
 */
export const comprobarCuota = async (
    userId: string,
    cantidad: number
): Promise<ResultadoCuota> => {
    const [totalCuenta, analisisHoy] = await Promise.all([
        Feedback.countDocuments({ userId }),
        Feedback.countDocuments({ userId, createdAt: { $gte: inicioDelDia() } }),
    ]);

    const margenTotal = env.MAX_RESENAS_POR_CUENTA - totalCuenta;
    const margenDiario = env.MAX_ANALISIS_DIARIOS - analisisHoy;
    const disponibles = Math.max(0, Math.min(margenTotal, margenDiario));

    if (margenTotal <= 0) {
        return {
            permitido: false,
            disponibles: 0,
            motivo: `Has alcanzado el máximo de ${env.MAX_RESENAS_POR_CUENTA} reseñas almacenadas en esta cuenta. Exporta y elimina reseñas antiguas para seguir.`,
        };
    }

    if (margenDiario <= 0) {
        return {
            permitido: false,
            disponibles: 0,
            motivo: `Has alcanzado el límite de ${env.MAX_ANALISIS_DIARIOS} análisis diarios. Vuelve a intentarlo mañana.`,
        };
    }

    return { permitido: disponibles >= cantidad, disponibles };
};
