# Repository Gap Analysis

## Deployment configuration
- `vercel.json` previously contained invalid JSON (missing comma before `root`) and used the unsupported `root` key. The configuration now conforms to Vercel's Vite defaults by specifying build/install commands, `dist` output, and removing the invalid field.

## Operational gaps
- **Environment variables**: MongoDB and OpenAI integrations rely on `MONGODB_URI`, `DB_NAME`, `OPENAI_API_KEY`, and `VITE_OPENAI_API_KEY`, but the repository does not provide `.env.example` guidance or runtime validation. Without proper environment configuration, data fetching and AI features will fail.
- **Backend usage**: `src/translations/db/mongo.ts` and `src/translations/db/openai.ts` pull in server-only dependencies (`mongodb`, `openai`) from the client bundle. These modules should either be moved to serverless functions or guarded to avoid client-side execution errors during static deployment.
- **Testing/quality gates**: No automated tests or linting scripts are present beyond Vite build, leaving regressions undetected. Adding unit tests and CI linting would improve reliability.

## Documentation opportunities
- Add setup instructions for required environment variables and any backend API endpoints.
- Clarify the deployment model (static vs serverless functions) to guide Vercel configuration and secure secret handling.
