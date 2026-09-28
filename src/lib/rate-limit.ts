import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Probabilidad de disparar la limpieza de buckets vencidos en cada llamada
// a checkRateLimit — no en cada una, para no sumarle un DELETE extra al
// hot path la mayoría de las veces. No hace falta más precisión que esto,
// ver cleanupStaleBucketsOccasionally() más abajo.
const CLEANUP_PROBABILITY = 0.01;
// Cuánto más viejo que su propia ventana tiene que estar un bucket para
// borrarlo. Generoso a propósito: nunca borra uno que todavía podría ser
// relevante — solo evita que la tabla crezca sin límite con keys (IPs) que
// nunca vuelven a aparecer.
const STALE_AFTER_MS = 60 * 60 * 1000; // 1 hora

/**
 * Rate limiting respaldado en Postgres (tabla RateLimitBucket: una fila
 * por key, no una fila por intento). Un Map en memoria no sirve en Vercel:
 * cada instancia serverless tiene su propio proceso, así que bajo tráfico
 * concurrente cada una llevaría su propio contador, y cada deploy/reciclado
 * de instancia lo reiniciaría a cero.
 *
 * Atomicidad: el incremento (o reset, si la ventana ya venció) se hace con
 * un único UPSERT en SQL crudo (INSERT ... ON CONFLICT DO UPDATE).
 * Postgres toma un lock de fila durante esa sentencia, así que dos
 * requests concurrentes para la misma key se serializan ahí — ninguno lee
 * un estado a medio escribir del otro. Prisma no tiene forma declarativa
 * de expresar "resetear si venció, si no incrementar" en un solo upsert
 * (su `upsert()` no soporta un CASE condicional), por eso es SQL crudo acá:
 * es el patrón estándar de "contador atómico" en Postgres, no una técnica
 * rara — la alternativa sería leer-decidir-escribir en pasos separados,
 * que es exactamente la condición de carrera que esto evita.
 */
export async function checkRateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): Promise<boolean> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowMs);

  try {
    const rows = await prisma.$queryRaw<{ count: number }[]>(Prisma.sql`
      INSERT INTO "rate_limit_buckets" ("key", "count", "resetAt")
      VALUES (${key}, 1, ${windowEnd})
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE
          WHEN "rate_limit_buckets"."resetAt" <= ${now} THEN 1
          ELSE "rate_limit_buckets"."count" + 1
        END,
        "resetAt" = CASE
          WHEN "rate_limit_buckets"."resetAt" <= ${now} THEN ${windowEnd}
          ELSE "rate_limit_buckets"."resetAt"
        END
      RETURNING "count"
    `);

    cleanupStaleBucketsOccasionally();

    const count = rows[0]?.count ?? 1;
    return count <= limit;
  } catch (error) {
    // Fail-open: si la base no responde, el propio login (busca el usuario
    // en esa misma base) o la creación de la reseña ya van a fallar solos
    // — bloquear acá no reduce ningún riesgo real, solo agrega un modo de
    // fallo más confuso ("no puedo ni intentar loguearme") encima del real
    // ("la base está caída"). Se loguea para que quede visible en
    // logs/monitoreo, en vez de fallar en silencio.
    console.error("[rate-limit] no se pudo verificar el límite, se permite el request:", error);
    return true;
  }
}

/**
 * Limpieza perezosa: sin cron ni job aparte, una fracción baja y aleatoria
 * de los checks dispara un DELETE de buckets bien vencidos. Fire-and-forget
 * (no se espera — no debe sumarle latencia al request que la disparó) y
 * sus propios errores se manejan acá mismo, nunca se propagan al caller de
 * checkRateLimit ni afectan su resultado.
 */
function cleanupStaleBucketsOccasionally(): void {
  if (Math.random() >= CLEANUP_PROBABILITY) return;

  const staleBefore = new Date(Date.now() - STALE_AFTER_MS);
  prisma.rateLimitBucket.deleteMany({ where: { resetAt: { lt: staleBefore } } }).catch((error) => {
    console.error("[rate-limit] falló la limpieza de buckets vencidos:", error);
  });
}

/**
 * Primera IP de x-forwarded-for (la que puso el proxy más cercano al
 * cliente real; Vercel la agrega automáticamente). "unknown" como fallback
 * degrada a un límite compartido entre todos los requests sin esa cabecera,
 * en vez de fallar — mejor que dejar pasar sin límite alguno.
 *
 * Firma mínima (no Request completo) para aceptar tanto el `Request` que
 * recibe `authorize()` de NextAuth como el `Headers` de `next/headers()` en
 * un Server Action.
 */
export function getClientIp(headers: { get(name: string): string | null }): string {
  const forwardedFor = headers.get("x-forwarded-for");
  return forwardedFor?.split(",")[0]?.trim() || "unknown";
}
