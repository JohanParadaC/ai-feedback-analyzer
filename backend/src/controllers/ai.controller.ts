import { Request, Response } from 'express';
import OpenAI from 'openai';
import { z } from 'zod';
import Feedback from '../models/Feedback.js';
import env from '../config/env.js';
import { comprobarCuota } from '../services/quota.service.js';

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

const textoResena = z.string()
    .min(5, "El texto es muy corto (mínimo 5 caracteres).")
    .max(2000, "El texto es demasiado largo. Máximo 2000 caracteres permitidos para no saturar la IA.");

const feedbackSchema = z.object({
    feedback: textoResena,
    date: z.string().optional()
});

// Endpoint de lote: una sola petición con muchas reseñas. Antes el frontend
// mandaba una petición por fila del CSV, así que cualquier archivo de más de 50
// líneas chocaba contra el rate limiting y se quedaba a medias.
const loteSchema = z.object({
    items: z.array(
        z.object({
            text: textoResena,
            date: z.string().optional(),
        })
    )
        .min(1, "El lote no contiene ninguna reseña.")
        .max(env.MAX_LOTE, `Máximo ${env.MAX_LOTE} reseñas por lote.`)
});

// generate-reply también llama a OpenAI, así que necesita los mismos topes:
// sin un máximo, un cliente puede enviar 1 MB de texto y hacernos pagar por
// cada token en cada petición.
const replySchema = z.object({
    text: z.string()
        .min(1, "No hay texto para responder.")
        .max(2000, "El texto es demasiado largo. Máximo 2000 caracteres."),
    sentiment: z.enum(['positivo', 'neutral', 'negativo']).optional()
});

// Tope de seguridad para la carga del historial.
const MAX_FEEDBACKS_POR_CONSULTA = 5000;

/** Resultado que devuelve el modelo para una reseña. */
interface AnalisisIA {
    sentiment: string;
    score: number;
    key_complaint: string | null;
    key_highlight: string | null;
}

const SYSTEM_PROMPT = `Eres un analista de datos de e-commerce. Analiza el comentario del cliente.

REGLAS ESTRICTAS DE CALIFICACIÓN:
- Puntuación 1 a 4: Sentimiento Negativo (Quejas, problemas, frustración, sarcasmo evidente).
- Puntuación 5 a 6: Sentimiento Neutral (Cumplimiento de expectativas básicas, descripciones de hechos, consultas, ausencia de adjetivos emocionales o de alta satisfacción).
- Puntuación 7 a 10: Sentimiento Positivo (Elogios claros, superación de expectativas, palabras como "excelente", "me encanta").

REGLA ESPECIAL PARA NEUTRALIDAD: Si un cliente simplemente confirma que un producto llegó, que funciona según lo previsto, o que las características son correctas (sin mostrar entusiasmo explícito), DEBES asignar obligatoriamente un score de 5 o 6 y categorizarlo como Neutral.`;

const JSON_SCHEMA = {
    name: "feedback_analysis_schema",
    strict: true,
    schema: {
        type: "object",
        properties: {
            sentiment: {
                type: "string",
                enum: ["positivo", "neutral", "negativo"],
                description: "El sentimiento general de la reseña."
            },
            score: {
                type: "integer",
                description: "Calificación del 1 al 10 basada en las reglas."
            },
            key_complaint: {
                type: ["string", "null"],
                enum: [
                    "Atención al Cliente",
                    "Falta de Respuesta",
                    "Problemas de Dinero/Reembolso",
                    "Tiempos de Envío",
                    "Producto Defectuoso/Baja Calidad",
                    "Problemas con Plataforma/Web",
                    "Publicidad Engañosa",
                    "Otro",
                    null
                ],
                description: "Categoría de la queja principal, o null si no hay ninguna queja."
            },
            key_highlight: {
                type: ["string", "null"],
                description: "Resumen de lo que más le gustó en máximo 5 palabras, o null si no hay nada destacable."
            }
        },
        required: ["sentiment", "score", "key_complaint", "key_highlight"],
        additionalProperties: false
    }
} as const;

/** Llama al modelo y devuelve el análisis estructurado de un texto. */
const analizarTexto = async (texto: string): Promise<AnalisisIA> => {
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: texto }
        ],
        response_format: { type: "json_schema", json_schema: JSON_SCHEMA }
    });

    const contenido = completion.choices[0].message.content;
    if (!contenido) {
        throw new Error('El modelo devolvió una respuesta vacía.');
    }

    return JSON.parse(contenido) as AnalisisIA;
};

/** Convierte la fecha recibida a Date, cayendo a "ahora" si no es válida. */
const resolverFecha = (date?: string): Date => {
    if (!date) return new Date();
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
};

export const testConnection = (req: Request, res: Response) => {
    res.json({ message: "¡Hola desde tu Backend en Node.js! La conexión es un éxito 🚀" });
};

export const analyzeFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ error: "Usuario no autenticado." });
            return;
        }

        const validData = feedbackSchema.safeParse(req.body);

        if (!validData.success) {
            const errorMessage = validData.error.issues[0]?.message || "Error de validación en el texto.";
            res.status(400).json({ error: errorMessage });
            return;
        }

        const { feedback, date } = validData.data;

        // La cuota se comprueba ANTES de llamar a OpenAI: si no, la llamada ya
        // se ha pagado aunque después rechacemos guardar el resultado.
        const cuota = await comprobarCuota(userId, 1);
        if (!cuota.permitido) {
            res.status(429).json({ error: cuota.motivo });
            return;
        }

        const aiData = await analizarTexto(feedback);

        const nuevoFeedback = await Feedback.create({
            text: feedback,
            sentiment: aiData.sentiment.toLowerCase(),
            score: aiData.score,
            key_complaint: aiData.key_complaint,
            key_highlight: aiData.key_highlight,
            date: resolverFecha(date),
            userId
        });

        res.status(200).json(nuevoFeedback);

    } catch (error) {
        console.error("❌ Error con OpenAI o MongoDB:", error);
        res.status(500).json({ error: "Fallo al procesar o guardar el análisis." });
    }
};

/**
 * Analiza varias reseñas en una sola petición (carga masiva por CSV).
 *
 * Procesa con concurrencia limitada: en serie tarda demasiado para 50 reseñas y
 * la petición expira, y todas a la vez dispara los límites de OpenAI.
 * Una fila que falle no tumba el lote entero.
 */
export const analyzeFeedbackBatch = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ error: "Usuario no autenticado." });
            return;
        }

        const validData = loteSchema.safeParse(req.body);

        if (!validData.success) {
            const errorMessage = validData.error.issues[0]?.message || "Error de validación en el lote.";
            res.status(400).json({ error: errorMessage });
            return;
        }

        const { items } = validData.data;

        const cuota = await comprobarCuota(userId, items.length);
        if (cuota.disponibles === 0) {
            res.status(429).json({ error: cuota.motivo });
            return;
        }

        // Si el lote supera lo que queda de cuota, procesamos lo que cabe en vez
        // de rechazarlo entero, y avisamos de cuántas se quedaron fuera.
        const aProcesar = items.slice(0, cuota.disponibles);
        const descartadas = items.length - aProcesar.length;

        const CONCURRENCIA = 5;
        const guardadas: unknown[] = [];
        let fallidas = 0;

        for (let i = 0; i < aProcesar.length; i += CONCURRENCIA) {
            const tanda = aProcesar.slice(i, i + CONCURRENCIA);

            const resultados = await Promise.allSettled(
                tanda.map(async (item) => {
                    const aiData = await analizarTexto(item.text);
                    return Feedback.create({
                        text: item.text,
                        sentiment: aiData.sentiment.toLowerCase(),
                        score: aiData.score,
                        key_complaint: aiData.key_complaint,
                        key_highlight: aiData.key_highlight,
                        date: resolverFecha(item.date),
                        userId
                    });
                })
            );

            resultados.forEach((r) => {
                if (r.status === 'fulfilled') {
                    guardadas.push(r.value);
                } else {
                    fallidas++;
                    console.error('❌ Fila del lote fallida:', r.reason);
                }
            });
        }

        res.status(200).json({
            guardadas,
            resumen: {
                recibidas: items.length,
                analizadas: guardadas.length,
                fallidas,
                descartadasPorCuota: descartadas,
            }
        });

    } catch (error) {
        console.error("❌ Error procesando el lote:", error);
        res.status(500).json({ error: "Fallo al procesar el lote de reseñas." });
    }
};

export const getFeedbacks = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user?.id;
        // ✨ NUEVO: Extraemos el parámetro de tiempo que envía el Frontend
        const { timeframe } = req.query;

        if (!userId) {
            res.status(401).json({ error: "Usuario no autenticado." });
            return;
        }

        console.log(`📂 Frontend solicitando historial. Filtro: ${timeframe || 'Todo'}`);

        // ✨ NUEVO: Preparamos la búsqueda base (Solo reseñas de ESTE usuario)
        const query: any = { userId };

        // ✨ MAGIA DE FECHAS: Calculamos los límites de tiempo si piden filtro
        if (timeframe === '7d') {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            query.date = { $gte: sevenDaysAgo }; // $gte = Greater Than or Equal (Mayor o igual)
        } else if (timeframe === '30d') {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            query.date = { $gte: thirtyDaysAgo };
        }

        // Ejecutamos la búsqueda en MongoDB con el filtro de fechas aplicado.
        // El dashboard agrega métricas sobre todo el historial del inquilino, así
        // que devolvemos el conjunto completo, pero con un tope para que una
        // cuenta muy grande no genere una respuesta ilimitada.
        const feedbacks = await Feedback.find(query)
            .sort({ date: -1, createdAt: -1 })
            .limit(MAX_FEEDBACKS_POR_CONSULTA)
            .lean();

        res.status(200).json(feedbacks);
    } catch (error) {
        console.error("❌ Error obteniendo reseñas:", error);
        res.status(500).json({ error: "Fallo al obtener el historial de la base de datos." });
    }
};

export const generateReply = async (req: Request, res: Response): Promise<void> => {
    try {
        const validData = replySchema.safeParse(req.body);

        if (!validData.success) {
            const errorMessage = validData.error.issues[0]?.message || "Error de validación en el texto.";
            res.status(400).json({ error: errorMessage });
            return;
        }

        const { text, sentiment } = validData.data;

        console.log(`🤖 Generando respuesta para una reseña ${sentiment ?? 'sin clasificar'}...`);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Eres un experto en Customer Experience. Tu tarea es redactar una respuesta directa, profesional y empática para una reseña de un cliente. 
                    
                    LINEAMIENTOS ESTRICTOS:
                    - Si es POSITIVA: Agradece con entusiasmo, invita a volver y sé breve.
                    - Si es NEGATIVA: Pide disculpas sinceramente, demuestra que entiendes el problema y ofrece seguimiento. No des excusas.
                    - Si es NEUTRAL: Sé cordial y agradece el feedback para mejorar.
                    - Importante: Devuelve SOLO el texto de la respuesta, sin saludos iniciales como "Estimado cliente" (porque el dueño lo personalizará).
                    - Firma como: "El equipo de Atención al Cliente".
                    - Idioma: Español.`
                },
                {
                    role: "user",
                    content: `Reseña del cliente (${sentiment ?? 'sin clasificar'}): "${text}"`
                }
            ],
            // Un borrador de respuesta no necesita más: acota coste y latencia.
            max_tokens: 400
        });

        const reply = completion.choices[0].message.content;
        res.status(200).json({ reply });

    } catch (error) {
        console.error("❌ Error generando respuesta:", error);
        res.status(500).json({ error: "No se pudo generar la respuesta." });
    }
};