import { Router } from 'express';
import { testConnection, analyzeFeedback } from '../controllers/ai.controller.js';
const router = Router();

// Endpoint de prueba: GET /api/test
router.get('/test', testConnection);

// Endpoint principal: POST /api/analyze
router.post('/analyze', analyzeFeedback);

export default router;