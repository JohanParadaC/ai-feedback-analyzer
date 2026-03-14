import { Router } from 'express';
import { testConnection, analyzeFeedback, getFeedbacks } from '../controllers/ai.controller.js';
// ✨ IMPORTAMOS A NUESTRO GUARDIA DE SEGURIDAD ✨
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Endpoint de prueba (Este lo dejamos público por si quieres revisar que el servidor viva)
router.get('/test', testConnection);

// ✨ LAS PUERTAS VIP: Le ponemos el guardia "protect" en medio ✨
// Ahora Express ejecutará "protect" primero. Si todo sale bien, pasará a "analyzeFeedback".
router.post('/analyze', protect, analyzeFeedback);

router.get('/feedbacks', protect, getFeedbacks);

export default router;