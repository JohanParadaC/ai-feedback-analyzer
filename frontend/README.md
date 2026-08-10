# Frontend — AI Feedback Analyzer

Interfaz en React 19 + TypeScript + Vite, con Tailwind CSS v4 y Recharts.

La documentación completa (requisitos, instalación, variables de entorno y
arquitectura) está en el [README del proyecto](../README.md).

## Comandos

```bash
npm run dev        # servidor de desarrollo en http://localhost:5173
npm run build      # comprobación de tipos + build de producción
npm run typecheck  # solo comprobación de tipos
npm run lint       # ESLint
npm run preview    # sirve el build de producción
```

## Configuración

Copia `.env.example` a `.env`. La única variable es `VITE_API_URL`, la URL base
del backend. Recuerda que todo lo que lleve el prefijo `VITE_` acaba en el
paquete público: nunca pongas secretos aquí.
