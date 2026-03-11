import { Request, Response } from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';


// 1. CARGAMOS LAS VARIABLES AQUÍ MISMO ANTES DE INICIALIZAR LA IA
dotenv.config();

// 2. AHORA SÍ, INICIALIZAMOS OPENAI (Ya encontrará la llave en el .env)
const openai = new OpenAI();

export const testConnection = (req: Request, res: Response) => {
    res.json({ message: "¡Hola desde tu Backend en Node.js! La conexión es un éxito 🚀" });
};

export const analyzeFeedback = async (req: Request, res: Response): Promise<void> => {
    try {
        const { feedback } = req.body;

        if (!feedback) {
            res.status(400).json({ error: "Por favor envía un texto para analizar." });
            return;
        }

        console.log("Analizando comentario:", feedback);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Modelo rápido, barato y eficiente
            messages: [
                {
                    role: "system",
                    // 👇 AQUÍ ESTÁ EL CAMBIO MÁGICO: Actualizamos el Prompt 👇
                    content: `Eres un analista de datos de e-commerce. Analiza el comentario del cliente. Responde ÚNICAMENTE con un objeto JSON válido con las propiedades: 'sentiment' (Positivo, Negativo, Neutral), 'score' (número del 1 al 10), 'key_complaint' (una de las categorías predefinidas o null), y 'key_highlight' (resumen de lo que más le gustó en máximo 5 palabras, o null si no hay nada destacable).
                    
                    🚨 REGLA ESTRICTA PARA 'key_complaint' (EVITAR DUPLICADOS EN GRÁFICAS):
                    Si hay una queja o problema, DEBES categorizarla eligiendo EXACTAMENTE UNA de estas opciones predefinidas (escribe el texto tal cual, respetando mayúsculas):
                    - "Atención al Cliente"
                    - "Falta de Respuesta"
                    - "Problemas de Dinero/Reembolso"
                    - "Tiempos de Envío"
                    - "Producto Defectuoso/Baja Calidad"
                    - "Problemas con Plataforma/Web"
                    - "Publicidad Engañosa"
                    - "Otro" (solo si es muy específico y no encaja en las anteriores)
                    Si no hay ninguna queja, devuelve null.

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
            response_format: { type: "json_object" },
        });

        const aiResponse = completion.choices[0].message.content;
        res.status(200).json(JSON.parse(aiResponse as string));

    } catch (error) {
        console.error("Error con OpenAI:", error);
        res.status(500).json({ error: "Fallo al procesar el análisis con IA." });
    }
};