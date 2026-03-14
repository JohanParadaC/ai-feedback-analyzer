# 🧠 AI Feedback Analyzer SaaS (Intelligence Hub)

Una plataforma Full-Stack Enterprise (Multi-Tenant) diseñada para digitalizar, analizar y monetizar el feedback de los clientes usando Inteligencia Artificial. Con capacidades analíticas avanzadas, este SaaS ayuda a equipos de e-commerce y servicio al cliente a procesar miles de reseñas instantáneamente, identificando patrones y automatizando sus flujos de trabajo.

## 🚀 El Problema que Resuelve
Las empresas acumulan grandes volúmenes de interacciones (quejas, sugerencias, elogios) que acaban en silos de datos por la imposibilidad de leer y categorizar todo manualmente. Intelligence Hub automatiza esto convirtiendo texto libre no estructurado en **Metadata Accionable** (JSON estandarizado), calculando automáticamente métricas como el NPS (Net Promoter Score) y extrayendo insights visuales que los gerentes pueden consultar en tiempo real.

## 🛠️ Stack Tecnológico (Enterprise-Ready)
**Frontend:**
- **Core:** React (Vite) + TypeScript con Context API para la gestión del estado de sesión.
- **Estilos:** Tailwind CSS v4 estructurado bajo Theming escalable y con soporte a Modo Oscuro.
- **Data Analytics:** Recharts para la visualización de datos y agregación matemáticamente exacta.
- **Exportación de Datos:** Motores de renderizado PDF (`html-to-image` + `jsPDF`) y Data dumps exportables a formato CSV (Excel).

**Backend & Data Layer:**
- **Servidor:** Node.js + Express + TypeScript con Clean Architecture y API RESTful.
- **Base de Datos:** MongoDB (Mongoose) optimizado con Paginación Server-Side (skip/limit).
- **IA Engine:** OpenAI API (`gpt-4o-mini`) implementando *Structured Outputs* para eliminar alucinaciones.
- **Seguridad:** Autenticación de usuarios vía JWT, Rate Limiting (Brute-force protection), y Aislamiento de Datos por inquilino (Arquitectura Multi-Tenant real).

## ✨ Características Principales (Features Pro)
- [x] **Seguridad Multi-Tenant:** Sistema de registro/login empresarial. Las empresas cuentan con aislamiento absoluto de base de datos; nadie puede acceder a los datos de la competencia.
- [x] **Prompt Engineering Determinista:** Uso del parámetro `response_format: { type: "json_schema" }` forzando al LLM a devolver siempre la misma estructura de datos (Sentimiento, Score corporativo, Tipificaciones y Elogios).
- [x] **Cálculo de NPS en Tiempo Real:** Dashboard reactivo que procesa dinámicamente el volumen de usuarios Promotores vs Detractores para medir la fidelidad de marca general.
- [x] **Análisis Temporal Inteligente:** Potentes filtros de fecha para comparar la mejora o declive de la satisfacción del período actual contra la data histórica de la empresa.
- [x] **Word Cloud y Búsqueda Avanzada:** Barra de búsqueda indexada para localizar tickets por palabras clave, y generador de "Nubes de Palabras" para los *Pain Points* recurrentes.
- [x] **Automatización de Respuestas con IA:** Capacidad de generar instantáneamente borradores para contestar a los clientes basándose en su nivel de enojo y la reseña que dejaron.
- [x] **Exportación B2B Integral:** Descarga tu base de conocimientos entera a Excel/CSV en 1 clic para análisis profundos, o emite un elegante Reporte PDF visual con múltiples páginas.

## 📁 Estructura del Proyecto
```text
ai-feedback-analyzer/
│
├── backend/                  # Motor de APIs y Conexión LLM
│   ├── src/
│   │   ├── controllers/      # Controladores de negocio (IA, Auth)
│   │   ├── middleware/       # Muros de seguridad (auth.middleware.ts)
│   │   ├── models/           # Mongoose schemas (User, Feedback)
│   │   ├── routes/           # Rutas Express protegidas
│   │   └── index.ts          # Inicializador con Rate-Limiting
│   └── package.json
│
├── frontend/                 # Client-Side Application (SPA)
│   ├── src/
│   │   ├── components/       # Interface visual interactiva
│   │   ├── context/          # AuthProvider y Billetera de Tokens
│   │   ├── hooks/            # Peticiones conectadas a headers de Auth
│   │   ├── types/            # Tipos de TypeScript estrictos
│   │   ├── utils/            # Generador PDF y CSV
│   │   └── App.tsx           
│   └── package.json
```

## 🧠 ¿Cómo funciona la arquitectura de IA?
Intelligence Hub **NO** utiliza la IA como un típico "chatbot conversacional", sino como un **Data Pipeline**.
El backend recibe comentarios erráticos, los envuelve en un prompt sistémico corporativo y obliga a OpenAI a responder utilizando un formato predecible. Esto garantiza que el frontend siempre reciba llaves validadas de `sentiment`, un `score` matemático y arrays para inyectar fluidamente en los gráficos sin riesgo de crashes.

## ⚙️ Cómo iniciar el proyecto localmente

```bash
# 1. Clona el repositorio
git clone https://github.com/JohanParadaC/ai-feedback-analyzer.git

# 2. Configura e inicia el Backend (Servidor)
cd backend
npm install

# Crea un archivo .env en la raíz de la carpeta /backend y añade tus secretos:
# OPENAI_API_KEY=sk-tuapikey...
# JWT_SECRET=tu_secreto_local
# MONGO_URI=mongodb://localhost:27017/feedback_analyzer

npx tsx watch src/index.ts

# 3. Configura e inicia el Frontend (Visor)
# Abre una nueva terminal
cd frontend
npm install
npm run dev

# Accede a http://localhost:5173 para vivir la experiencia Intelligence Hub.
```
