# EasyMedPro

EasyMedPro is a mobile-first healthcare platform for India built with React, Vite and Tailwind CSS. It supports patient, doctor, ASHA and administrator workflows, multilingual experiences, telehealth foundations, AI-assisted health experiences, and planned ABDM/ABHA integrations.

## Architecture

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Vercel Functions under `/api`
- **Database:** MongoDB
- **Authentication:** Twilio Verify for OTP + secure HttpOnly session cookies
- **AI:** OpenAI accessed only from server-side API functions
- **Deployment:** Vercel
- **Node:** 22.x

## Security model

Server-only secrets must never use the `VITE_` prefix. OpenAI, Twilio, MongoDB, ABDM credentials, administrator credentials and session secrets are read only by server functions.

Authentication sessions use an HttpOnly, Secure, SameSite cookie. Patient/doctor/ASHA records are intended to be accessed through authenticated server APIs rather than directly from browser-side database clients.

## Local development

1. Install Node 22.x.
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env.local` and configure the required server variables.
4. Start the app:

```bash
npm run dev
```

5. Run the typecheck:

```bash
npm run typecheck
```

## Production deployment

Connect the repository to Vercel and configure the environment variables from `.env.example` in the Vercel project settings. Do not commit real credentials.

The frontend is built to `dist`; API functions are deployed from `api/`.

## Healthcare data

EasyMedPro handles potentially sensitive health information. Production rollout requires appropriate authorization controls, audit logging, encryption, consent/data-retention controls, secure file storage, incident response, and applicable Indian privacy/digital-health compliance review.

## Development principles

1. No secrets in client bundles.
2. No client-side OTP generation.
3. No hardcoded administrator passwords.
4. No direct browser connections to MongoDB.
5. Healthcare data access must be authenticated and authorized server-side.
6. Keep demo/mock implementations isolated from production services.
7. Add tests and CI quality gates before production release.
