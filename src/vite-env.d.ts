/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Admin API base. Defaults to /admin/api/v1, same origin as the panel. */
  readonly VITE_API_BASE?: string;
  /** Bot username for the Telegram Login Widget, without the leading @. */
  readonly VITE_TELEGRAM_BOT_USERNAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
