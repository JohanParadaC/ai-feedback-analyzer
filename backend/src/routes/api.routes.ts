import { Router } from 'express';
// ✨ IMPORTAMOS LA NUEVA FUNCIÓN 'generateReply'
import {
    testConnection,
    analyzeFeedback,
    analyzeFeedbackBatch,
    getFeedbacks,
    generateReply,
} from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Endpoint de prueba (Este lo dejamos público por si quieres revisar que el servidor viva)
router.get('/test', testConnection);

// ✨ LAS PUERTAS VIP: Le ponemos el guardia "protect" en medio ✨
router.post('/analyze', protect, analyzeFeedback);

// Carga masiva: una sola petición con hasta MAX_LOTE reseñas.
router.post('/analyze/batch', protect, analyzeFeedbackBatch);

router.get('/feedbacks', protect, getFeedbacks);

// ✨ NUEVA PUERTA: Endpoint para redactar respuestas mágicas
router.post('/generate-reply', protect, generateReply);

export default router;