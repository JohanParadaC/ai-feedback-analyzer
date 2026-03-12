import { Router } from 'express';
// ✨ IMPORTAMOS LA NUEVA FUNCIÓN 'getFeedbacks' ✨
import { testConnection, analyzeFeedback, getFeedbacks } from '../controllers/ai.controller.js';

const router = Router();

// Endpoint de prueba: GET /api/test
router.get('/test', testConnection);

// Endpoint principal para analizar y guardar: POST /api/analyze
router.post('/analyze', analyzeFeedback);

// ✨ NUEVO ENDPOINT: Para pedir el historial: GET /api/feedbacks ✨
router.get('/feedbacks', getFeedbacks);

export default router;