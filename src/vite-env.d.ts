/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ABHA_BASE_URL: string
  readonly VITE_ABHA_CLIENT_ID: string
  readonly VITE_ABHA_CLIENT_SECRET: string
  readonly VITE_ABDM_GATEWAY_URL: string
  readonly VITE_FACILITY_ID: string
  readonly VITE_HIP_ID: string
  readonly VITE_HIU_ID: string
  readonly VITE_AI_API_BASE_URL: string
  readonly VITE_DOCTOR_NAME: string
  readonly VITE_TWILIO_ACCOUNT_SID: string
  readonly VITE_TWILIO_AUTH_TOKEN: string
  readonly VITE_TWILIO_VERIFY_SERVICE_SID: string
  readonly VITE_ABDM_BASE_URL: string
  readonly VITE_ABDM_CLIENT_ID: string
  readonly VITE_ABDM_CLIENT_SECRET: string
  readonly VITE_MONGODB_URI: string
  readonly VITE_ADMIN_EMAIL_ALLOWLIST: string
  readonly VITE_ADMIN_PHONE_ALLOWLIST: string
  readonly VITE_ADMIN_LOGIN_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
