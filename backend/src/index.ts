import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Carga las variables de entorno (API Key)
dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Inicializa el cliente de OpenAI
// Automáticamente buscará process.env.OPENAI_API_KEY
const openai = new OpenAI();

// Endpoint de prueba anterior (lo dejamos para verificar)
app.get('/api/test', (req: Request, res: Response) => {
    res.json({ message: "¡Hola desde tu Backend en Node.js! La conexión es un éxito 🚀" });
});

// El Endpoint que hace la magia de la IA
app.post('/api/analyze', async (req: Request, res: Response): Promise<void> => {
    try {
        // Recibe el texto que envíe el frontend
        const { feedback } = req.body;

        if (!feedback) {
            res.status(400).json({ error: "Por favor envía un texto para analizar." });
            return;
        }

        console.log("Analizando comentario:", feedback);

        // Llama a la IA forzando un formato JSON y aplicando las reglas de Neutralidad
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Modelo rápido, barato y eficiente
            messages: [
                {
                    role: "system",
                    content: `Eres un analista de datos de e-commerce. Analiza el comentario del cliente. Responde ÚNICAMENTE con un objeto JSON válido con las propiedades: 'sentiment' (Positivo, Negativo, Neutral), 'score' (número del 1 al 10), 'key_complaint' (resumen de la queja en máximo 5 palabras, o null si no hay), y 'key_highlight' (resumen de lo que más le gustó en máximo 5 palabras, o null si no hay nada destacable).
                    
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
            response_format: { type: "json_object" }, // La clave para integraciones de software
        });

        const aiResponse = completion.choices[0].message.content;

        // Devuelve el JSON estructurado al frontend
        res.status(200).json(JSON.parse(aiResponse as string));

    } catch (error) {
        console.error("Error con OpenAI:", error);
        res.status(500).json({ error: "Fallo al procesar el análisis con IA." });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor Backend corriendo en http://localhost:${PORT}`);
});