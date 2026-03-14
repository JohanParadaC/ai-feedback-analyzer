import { Request, Response } from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import { z } from 'zod';
import Feedback from '../models/Feedback.js';

dotenv.config();

const openai = new OpenAI();

const feedbackSchema = z.object({
    feedback: z.string()
        .min(5, "El texto es muy corto (mínimo 5 caracteres).")
        .max(2000, "El texto es demasiado largo. Máximo 2000 caracteres permitidos para no saturar la IA."),
    date: z.string().optional()
});

export const testConnection = (req: Request, res: Response) => {
    res.json({ message: "¡Hola desde tu Backend en Node.js! La conexión es un éxito 🚀" });
};

export const analyzeFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
        // ✨ PRIVACIDAD DE DATOS (PUNTO 9): Extraemos el ID del usuario desde el Guardia de Seguridad
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

        let finalDate = new Date();
        if (date) {
            const parsedDate = new Date(date);
            if (!isNaN(parsedDate.getTime())) {
                finalDate = parsedDate;
            } else {
                console.warn(`⚠️ Fecha inválida recibida: "${date}". Usando la fecha actual.`);
            }
        }

        console.log("🧠 Analizando comentario con IA (Usando Structured Outputs):", feedback);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Eres un analista de datos de e-commerce. Analiza el comentario del cliente.
                    
                    REGLAS ESTRICTAS DE CALIFICACIÓN:
                    - Puntuación 1 a 4: Sentimiento Negativo (Quejas, problemas, frustración, sarcasmo evidente).
                    - Puntuación 5 a 6: Sentimiento Neutral (Cumplimiento de expectativas básicas, descripciones de hechos, consultas, ausencia de adjetivos emocionales o de alta satisfacción).
                    - Puntuación 7 a 10: Sentimiento Positivo (Elogios claros, superación de expectativas, palabras como "excelente", "me encanta").
                    
                    REGLA ESPECIAL PARA NEUTRALIDAD: Si un cliente simplemente confirma que un producto llegó, que funciona según lo previsto, o que las características son correctas (sin mostrar entusiasmo explícito), DEBES asignar obligatoriamente un score de 5 o 6 y categorizarlo como Neutral.`
                },
                {
                    role: "user",
                    content: feedback
                }
            ],
            response_format: {
                type: "json_schema",
                json_schema: {
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
                }
            }
        });

        const aiResponse = completion.choices[0].message.content;
        const aiData = JSON.parse(aiResponse as string);

        console.log("💾 Guardando en Base de Datos...");

        // ✨ PRIVACIDAD DE DATOS (PUNTO 9): GUARDAMOS LA RESEÑA A NOMBRE DE ESTE USUARIO ✨
        const nuevoFeedback = await Feedback.create({
            text: feedback,
            sentiment: aiData.sentiment.toLowerCase(),
            score: aiData.score,
            key_complaint: aiData.key_complaint,
            key_highlight: aiData.key_highlight,
            date: finalDate,
            userId: userId // 👈 ¡La atamos a la empresa dueña!
        });

        console.log("✅ ¡Guardado con éxito!");

        res.status(200).json(nuevoFeedback);

    } catch (error) {
        console.error("❌ Error con OpenAI o MongoDB:", error);
        res.status(500).json({ error: "Fallo al procesar o guardar el análisis." });
    }
};

export const getFeedbacks = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("📂 Frontend solicitando el historial de reseñas...");

        // ✨ PRIVACIDAD DE DATOS (PUNTO 9): Extraemos el ID y buscamos SOLO las de este usuario ✨
        const userId = (req as any).user?.id;

        if (!userId) {
            res.status(401).json({ error: "Usuario no autenticado." });
            return;
        }

        // 👈 La Base de Datos filtra automáticamente y solo devuelve la caja fuerte de este usuario
        const feedbacks = await Feedback.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json(feedbacks);
    } catch (error) {
        console.error("❌ Error obteniendo reseñas:", error);
        res.status(500).json({ error: "Fallo al obtener el historial de la base de datos." });
    }
};