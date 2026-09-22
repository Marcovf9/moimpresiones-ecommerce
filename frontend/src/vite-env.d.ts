/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base de la API. Vacia en desarrollo: Vite hace proxy de /api. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
