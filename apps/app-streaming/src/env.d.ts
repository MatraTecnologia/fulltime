/// <reference types="astro/client" />
interface ImportMetaEnv {
  readonly API_URL?: string
  readonly PUBLIC_API_URL?: string
}
interface ImportMeta { readonly env: ImportMetaEnv }

declare namespace App {
  interface Locals {
    user: { id: string; name: string; email: string; role: string; image: string | null } | null
  }
}
