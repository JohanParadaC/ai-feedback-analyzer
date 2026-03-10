import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.routes.js';
// Carga las variables de entorno (API Key)
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de seguridad y parseo
app.use(cors());
app.use(express.json());

// Montamos todas nuestras rutas bajo el prefijo "/api"
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Servidor Backend corriendo de forma limpia en http://localhost:${PORT}`);
});