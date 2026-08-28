/// <reference types="vite/client" />

/**
 * Typing the environment means a typo in `import.meta.env.VITE_API_UR` is a
 * compile error rather than `undefined` at runtime.
 *
 * Everything here ships inside the JavaScript bundle and is public. Secrets —
 * the PayPal client *secret*, JWT keys, the database URI — belong to the API
 * and must never appear in this file.
 */
interface ImportMetaEnv {
  /** Origin of the API, no trailing slash and no /api suffix. */
  readonly VITE_API_URL: string;
  /** PayPal client id — a public identifier, not a credential. */
  readonly VITE_PAYPAL_CLIENT_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
