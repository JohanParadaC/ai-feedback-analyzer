# 🧠 AI Feedback Analyzer SaaS (Intelligence Hub)

Una herramienta Full-Stack de nivel empresarial construida para ayudar a e-commerces y negocios locales a procesar cientos de reseñas de clientes en segundos usando Inteligencia Artificial. No solo analiza el texto, sino que acumula datos históricos, genera métricas visuales en tiempo real y exporta reportes paginados en PDF.

## 🚀 El Problema que Resuelve
Los negocios reciben mucho feedback en texto plano (quejas, sugerencias, elogios), pero leer y clasificar cada uno toma demasiado tiempo. Esta aplicación automatiza el proceso convirtiendo texto no estructurado en **datos estructurados (JSON)** listos para la toma de decisiones, permitiendo a los gerentes ver tendencias de satisfacción de un solo vistazo.

## 🛠️ Stack Tecnológico
**Frontend:**
- **Core:** React (Vite) + TypeScript.
- **Estilos:** Tailwind CSS v4 (Arquitectura moderna sin archivos de configuración pesados).
- **Data Visualization:** Recharts (Gráficas interactivas).
- **Reportes:** `html-to-image` + `jsPDF` (Generación de PDF con paginación inteligente).

**Backend & IA:**
- **Servidor:** Node.js + Express + TypeScript.
- **Motor de IA:** OpenAI API (Modelo `gpt-4o-mini`).
- **Arquitectura:** Cliente-Servidor separando responsabilidades para proteger las API Keys.

## ✨ Características (Features)
- [x] Interfaz de usuario intuitiva estilo Dashboard corporativo.
- [x] Integración segura con LLM desde el backend (Zero exposición de llaves en el cliente).
- [x] **Prompt Engineering Avanzado:** Uso de `response_format: { type: "json_object" }` para garantizar que la IA devuelva estructuras predecibles.
- [x] **Agregación de Datos:** Acumulación de historial de reseñas con cálculo de promedios de satisfacción (Score Global) en tiempo real.
- [x] **Visualización de Datos:** Gráficas de dona para volumen de sentimientos y barras dinámicas de progreso.
- [x] **Exportación Enterprise:** Generación de reportes PDF descargables con paginación automática y vistas de impresión optimizadas.

## 📁 Estructura del Proyecto (Clean Architecture)
```text
ai-feedback-analyzer/
│
├── backend/                  # (Node.js + Express)
│   ├── src/
│   │   ├── controllers/      # Lógica de conexión con OpenAI
│   │   │   └── ai.controller.ts
│   │   ├── routes/           # Endpoints de la API
│   │   │   └── api.routes.ts
│   │   └── index.ts          # Punto de entrada del servidor
│   ├── .env                  # Variables de entorno protegidas
│   └── package.json
│
├── frontend/                 # Interfaz visual interactiva
│   ├── src/
│   │   ├── types/            # Interfaces TypeScript globales (Sentiment, AnalysisResult)
│   │   ├── utils/            # Lógica aislada (ej. Motor de exportación PDF)
│   │   ├── hooks/            # Custom hooks para manejar estados y peticiones API
│   │   ├── components/       # Componentes visuales modulares y reutilizables
│   │   │   ├── Header.tsx
│   │   │   ├── FeedbackForm.tsx
│   │   │   ├── MetricsPanel.tsx
│   │   │   ├── HistoryTable.tsx
│   │   │   └── PrintTemplate.tsx
│   │   ├── App.tsx           # Orquestador principal
│   │   └── main.tsx
│   └── package.json
│
├── .gitignore                
└── README.md
```
## 🧠 ¿Cómo funciona la integración de IA?
En lugar de usar la IA como un simple chatbot, se utiliza como un motor de procesamiento de datos. El backend recibe el texto, lo envuelve en un contexto de sistema estricto y fuerza a la API a devolver un JSON con: Sentimiento, Score del 1 al 10, y extracción de "Pain Points" (Puntos de dolor) o "Highlights" (Puntos a destacar). El frontend consume esto para alimentar las gráficas reactivas.


## ⚙️ Cómo correr el proyecto localmente
Clona el repositorio:
git clone https://github.com/JohanParadaC/ai-feedback-analyzer.git

# Configura y levanta el Backend:

cd backend
npm install
# Crea un archivo .env en la raíz de /backend y añade tu OPENAI_API_KEY
npx tsx watch src/index.ts
# Configura y levanta el Frontend 
cd frontend
npm install
npm run dev

