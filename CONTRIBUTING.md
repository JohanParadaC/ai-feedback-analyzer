# Contribuir a AI Feedback Analyzer

Gracias por dedicarle un rato. Este documento explica cómo levantar el entorno,
qué se espera de un cambio y cómo proponerlo.

## Antes de empezar

- **¿Has encontrado un fallo?** Abre un issue con los pasos para reproducirlo.
- **¿Quieres proponer una funcionalidad?** Abre un issue antes de escribir código.
  Así evitamos que dediques tiempo a algo que no encaje en el proyecto.
- **¿Es una vulnerabilidad de seguridad?** No abras un issue público. Escribe en
  privado a la dirección del perfil de [@JohanParadaC](https://github.com/JohanParadaC).

## Entorno de desarrollo

Necesitas Node.js 20+, una instancia de MongoDB y una clave de la API de OpenAI.

```bash
git clone https://github.com/<tu-usuario>/ai-feedback-analyzer.git
cd ai-feedback-analyzer

# Backend
cd backend
npm install
cp .env.example .env    # rellena MONGO_URI, OPENAI_API_KEY y JWT_SECRET
npm run dev

# Frontend (en otra terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

Genera tu `JWT_SECRET` con:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Antes de abrir un pull request

Estos comandos son los mismos que ejecuta la integración continua, así que
pásalos en local primero:

```bash
cd backend && npm run typecheck
```

```bash
cd frontend && npm run lint && npm run build
```

## Estilo de código

- **TypeScript en todo.** Evita `any`; si no queda otra, deja un comentario
  explicando por qué.
- **Valida en el servidor.** Toda entrada que llegue del cliente pasa por un
  esquema de Zod antes de tocar la base de datos o la API de OpenAI.
- **Comenta el porqué, no el qué.** El código ya dice lo que hace. Un comentario
  útil explica la decisión: por qué ese límite, qué caso raro cubre esa guarda.
- **Escribe en el idioma del entorno.** Los textos de la interfaz y los mensajes
  de error van en español, igual que el resto de la aplicación.
- **Accesibilidad.** Todo control interactivo necesita nombre accesible; los
  botones que solo llevan icono, un `aria-label`. El color nunca puede ser la
  única forma de transmitir información.

## Seguridad: reglas que no se negocian

- Nunca subas un archivo `.env` ni ningún secreto real. Si añades una variable
  nueva, documéntala en `.env.example` con un valor de ejemplo.
- Nunca introduzcas valores por defecto para secretos. Si falta configuración,
  la aplicación debe fallar al arrancar, no seguir con un valor conocido.
- Cualquier endpoint que consulte datos de una empresa filtra por el ID que viene
  del token verificado, nunca por un ID enviado por el cliente.

## Mensajes de commit

Se usa [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat: añade filtro por rango de fechas personalizado
fix: evita doble respuesta HTTP en el middleware de auth
docs: corrige el ejemplo de CSV en el README
refactor: extrae los estilos de sentimiento a lib/sentiment
```

## Proceso del pull request

1. Haz un fork y crea una rama descriptiva (`feat/filtro-fechas`).
2. Haz cambios enfocados: un PR que arregla una cosa se revisa; uno que toca
   veinte, no.
3. Comprueba que typecheck, lint y build pasan.
4. Describe en el PR **qué** cambia y **por qué**. Si es visual, adjunta captura.

## Código de conducta

Trata a los demás con respeto. Se moderará cualquier comportamiento de acoso,
descalificación personal o discriminación.
