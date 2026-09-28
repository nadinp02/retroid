import { headers } from "next/headers";

/**
 * Nonce por request generado en middleware.ts (header "x-nonce"), para los
 * <script> JSON-LD propios — Next.js le pone su propio nonce automáticamente
 * a los scripts que genera él (lee el "nonce-" de la cabecera
 * Content-Security-Policy), pero no a los que escribimos a mano acá.
 */
export async function getNonce() {
  const headersList = await headers();
  return headersList.get("x-nonce") ?? undefined;
}
