<div align="center">

# 🧠 Intelligence Hub.

**Convierte el feedback desordenado de tus clientes en datos accionables.**

Plataforma full-stack multi-tenant que analiza reseñas con IA: detecta sentimiento,
calcula el NPS, agrupa las quejas recurrentes y redacta borradores de respuesta.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

</div>

---

## El problema

Las empresas acumulan miles de reseñas, tickets y comentarios que nadie llega a leer.
La información útil (qué falla, qué gusta, si mejoramos o empeoramos) queda enterrada
en texto libre.

**Intelligence Hub** usa un LLM como *pipeline de datos*, no como chatbot: recibe
texto sin estructura y devuelve siempre el mismo JSON validado, listo para graficar.

## Características

- **Análisis estructurado con IA** — Usa *Structured Outputs* de OpenAI
  (`response_format: json_schema`, `strict: true`), así que el modelo está obligado a
  devolver siempre las mismas claves. Sin parseos frágiles ni alucinaciones de formato.
- **Multi-tenant real** — Cada empresa solo ve sus datos. El aislamiento se aplica en
  la consulta a base de datos a partir del ID del token, no en el frontend.
- **NPS en tiempo real** — Promotores (9–10) menos detractores (1–6), recalculado
  sobre el conjunto filtrado.
- **Tendencia temporal** — Evolución diaria del volumen por sentimiento, con rangos
  de 1 mes, 3, 6 meses y 1 año.
- **Áreas de mejora** — Ranking de las quejas más repetidas, tipificadas por la IA
  en categorías fijas.
- **Respuestas asistidas** — Genera un borrador de respuesta adaptado al tono de
  la reseña.
- **Carga masiva por CSV** — Arrastra un archivo y analiza en lote, con progreso visible.
- **Exportación** — Volcado completo a CSV (compatible con Excel) e informe PDF
  multipágina con gráficos.
- **Modo oscuro** y interfaz accesible por teclado y lector de pantalla.

## Stack

**Frontend** — React 19 + TypeScript, Vite, Tailwind CSS v4, Recharts,
`html-to-image` + `jsPDF` para el informe, PapaParse para CSV.

**Backend** — Node.js + Express 5 + TypeScript, MongoDB con Mongoose,
OpenAI (`gpt-4o-mini`), Zod para validación, JWT + bcrypt, rate limiting.

## Puesta en marcha

### Requisitos

- Node.js 20 o superior
- Una instancia de MongoDB (local o [Atlas](https://www.mongodb.com/atlas))
- Una clave de API de [OpenAI](https://platform.openai.com/api-keys)

### 1. Clonar

```bash
git clone https://github.com/JohanParadaC/ai-feedback-analyzer.git
cd ai-feedback-analyzer
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Abre `backend/.env` y rellena los valores. Genera el secreto de JWT con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

| Variable | Obligatoria | Descripción |
|---|---|---|
| `MONGO_URI` | Sí | Cadena de conexión de MongoDB |
| `OPENAI_API_KEY` | Sí | Clave de la API de OpenAI |
| `JWT_SECRET` | Sí | Secreto de firma, mínimo 32 caracteres |
| `PORT` | No | Puerto del servidor (por defecto `3000`) |
| `JWT_EXPIRES_IN` | No | Duración de la sesión (por defecto `30d`) |
| `CORS_ORIGIN` | No | Orígenes permitidos, separados por coma |
| `NODE_ENV` | No | `development`, `test` o `production` |
| `TRUST_PROXY` | No | Nº de proxies delante de la app (por defecto `0`) |
| `MAX_ANALISIS_DIARIOS` | No | Análisis por cuenta y día (por defecto `200`) |
| `MAX_RESENAS_POR_CUENTA` | No | Reseñas almacenadas por cuenta (por defecto `5000`) |
| `MAX_LOTE` | No | Reseñas por petición en carga masiva (por defecto `50`) |

Arranca el servidor:

```bash
npm run dev
```

> El backend valida la configuración al arrancar. Si falta una variable o el
> `JWT_SECRET` es demasiado corto, el proceso se detiene indicando exactamente
> qué corregir, en lugar de arrancar en un estado inseguro.

### 3. Frontend

En otra terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Abre <http://localhost:5173>, crea una cuenta y empieza a analizar.

### Formato del CSV

Una reseña por fila. La primera columna es el texto; la segunda, opcional, la fecha:

```csv
"El pedido llegó tarde y nadie avisó",2026-03-01
"Excelente atención, muy rápidos",2026-03-04
"El producto funciona como se describe"
```

## Cómo funciona el análisis

El backend envuelve cada comentario en un prompt de sistema con reglas explícitas de
puntuación y fuerza al modelo a responder contra un JSON Schema estricto:

```jsonc
{
  "sentiment": "positivo" | "neutral" | "negativo",
  "score": 1-10,
  "key_complaint": "Tiempos de Envío" | ... | null,
  "key_highlight": "resumen breve" | null
}
```

Como `key_complaint` está restringido a un enum cerrado, las quejas se agrupan solas
y el gráfico de áreas de mejora es consistente entre ejecuciones.

## Estructura

```text
ai-feedback-analyzer/
├── backend/
│   ├── src/
│   │   ├── config/       # Validación de entorno (env.ts) y conexión a Mongo
│   │   ├── controllers/  # Lógica de negocio (IA, autenticación)
│   │   ├── middleware/   # Verificación del JWT
│   │   ├── models/       # Esquemas de Mongoose
│   │   ├── routes/       # Rutas de Express
│   │   └── index.ts      # Arranque, CORS y rate limiting
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/   # Componentes de interfaz
    │   │   └── ui/       # Primitivos reutilizables (Button, iconos…)
    │   ├── context/      # Sesión y tema
    │   ├── hooks/        # Estado del feedback
    │   ├── lib/          # Cliente HTTP y estilos de sentimiento
    │   ├── types/        # Tipos compartidos
    │   └── utils/        # Exportación a PDF
    └── .env.example
```

## Seguridad

- Las contraseñas se almacenan con `bcrypt` (10 rondas de sal) y exigen 8 caracteres mínimo.
- Las rutas de análisis exigen un JWT válido y filtran por el ID del token.
- El servidor no arranca sin un `JWT_SECRET` propio de al menos 32 caracteres.

**Protección contra abuso.** Cada análisis es una llamada de pago a OpenAI con tu
clave, así que hay dos capas:

| Capa | Alcance | Por defecto |
|---|---|---|
| Rate limiting general | Por IP | 50 peticiones / 15 min |
| Rate limiting de autenticación | Por IP | 10 intentos fallidos / 15 min |
| Cuota diaria de análisis | **Por cuenta** | 200 / día |
| Tope de reseñas almacenadas | **Por cuenta** | 5000 |

El límite por IP se esquiva rotando de IP; las cuotas por cuenta, no. Por eso el
gasto en OpenAI y el crecimiento de la base de datos se acotan por cuenta.

> Si despliegas detrás de un proxy (Render, Railway, nginx…), ajusta `TRUST_PROXY`
> al número real de saltos. Con `0` detrás de un proxy, todos tus usuarios
> comparten un único contador de rate limiting.

Ten en cuenta que **el registro es público**: cualquiera puede crear una cuenta y
consumir su propia cuota. Si vas a publicar una demo, baja `MAX_ANALISIS_DIARIOS`.

Si encuentras una vulnerabilidad, no abras un issue público: escribe a la dirección
del perfil de [@JohanParadaC](https://github.com/JohanParadaC).

## Contribuir

Las contribuciones son bienvenidas. Lee [CONTRIBUTING.md](CONTRIBUTING.md) para el
flujo de trabajo, el estilo de código y cómo levantar el entorno.

## Licencia

[MIT](LICENSE) © Johan Parada
