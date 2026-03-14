import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/auth.controller.js';

const router = Router();

// Endpoint para registrarse: POST /api/auth/register
router.post('/register', registerUser);

// Endpoint para iniciar sesión: POST /api/auth/login
router.post('/login', loginUser);

export default router;