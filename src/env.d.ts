/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_SHEETS_WEBHOOK_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
