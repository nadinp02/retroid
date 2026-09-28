import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";

// Prisma.sql normalmente arma un objeto interno con el texto de la query y
// los valores interpolados; acá se reemplaza por un pass-through que solo
// expone `values` en el orden del template — desacopla el mock de la forma
// interna real de ese objeto (que no es API pública) y de la posición
// exacta de cada parámetro dentro del SQL, que es un detalle de
// implementación de checkRateLimit().
vi.mock("@prisma/client", () => ({
  Prisma: {
    sql: (_strings: TemplateStringsArray, ...values: unknown[]) => ({ values }),
  },
}));

// Fake mínimo de la tabla rate_limit_buckets: una fila por key, igual que
// el modelo real. Reimplementa a mano la misma semántica del UPSERT
// atómico (reset si venció, si no incrementa) para poder probar la lógica
// de checkRateLimit() sin una base de datos real. La key y las dos fechas
// (now/windowEnd) se identifican por tipo, no por posición — más robusto
// ante cambios en el SQL que por casualidad conserven el mismo resultado.
type Bucket = { count: number; resetAt: Date };
let buckets: Map<string, Bucket>;

const queryRawMock = vi.fn(async (query: { values: unknown[] }) => {
  const key = query.values.find((v): v is string => typeof v === "string")!;
  const dates = query.values.filter((v): v is Date => v instanceof Date);
  const now = new Date(Math.min(...dates.map((d) => d.getTime())));
  const windowEnd = new Date(Math.max(...dates.map((d) => d.getTime())));

  const existing = buckets.get(key);
  const bucket: Bucket =
    !existing || existing.resetAt <= now
      ? { count: 1, resetAt: windowEnd }
      : { count: existing.count + 1, resetAt: existing.resetAt };

  buckets.set(key, bucket);
  return [{ count: bucket.count }];
});

const deleteManyMock = vi.fn(async () => ({ count: 0 }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: queryRawMock,
    rateLimitBucket: { deleteMany: deleteManyMock },
  },
}));

const { checkRateLimit, getClientIp } = await import("./rate-limit");

describe("checkRateLimit", () => {
  beforeEach(() => {
    buckets = new Map();
    queryRawMock.mockClear();
    deleteManyMock.mockClear();
    vi.spyOn(Math, "random").mockReturnValue(0.5); // > CLEANUP_PROBABILITY: no dispara limpieza por defecto
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("permite hasta el límite configurado dentro de la ventana", async () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      expect(await checkRateLimit(key, { limit: 3, windowMs: 60_000 })).toBe(true);
    }
  });

  it("bloquea el intento que supera el límite", async () => {
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      await checkRateLimit(key, { limit: 3, windowMs: 60_000 });
    }
    expect(await checkRateLimit(key, { limit: 3, windowMs: 60_000 })).toBe(false);
  });

  it("resetea el contador una vez que pasa la ventana de tiempo", async () => {
    vi.useFakeTimers();
    const key = `test-${Math.random()}`;
    for (let i = 0; i < 3; i++) {
      await checkRateLimit(key, { limit: 3, windowMs: 1000 });
    }
    expect(await checkRateLimit(key, { limit: 3, windowMs: 1000 })).toBe(false);

    vi.advanceTimersByTime(1001);

    expect(await checkRateLimit(key, { limit: 3, windowMs: 1000 })).toBe(true);
  });

  it("usa contadores independientes por key", async () => {
    const keyA = `test-a-${Math.random()}`;
    const keyB = `test-b-${Math.random()}`;
    await checkRateLimit(keyA, { limit: 1, windowMs: 60_000 });
    expect(await checkRateLimit(keyA, { limit: 1, windowMs: 60_000 })).toBe(false);
    expect(await checkRateLimit(keyB, { limit: 1, windowMs: 60_000 })).toBe(true);
  });

  it("bajo solicitudes concurrentes para la misma key, deja pasar exactamente el límite (sin perder incrementos)", async () => {
    const key = `concurrent-${Math.random()}`;
    const limit = 5;

    // 8 llamadas disparadas en simultáneo (Promise.all), no una detrás de
    // otra — es el escenario que un Map en memoria + lectura/decisión/
    // escritura en pasos separados podría contar mal.
    const results = await Promise.all(
      Array.from({ length: 8 }, () => checkRateLimit(key, { limit, windowMs: 60_000 })),
    );

    const allowedCount = results.filter(Boolean).length;
    expect(allowedCount).toBe(limit);
    expect(results.filter((r) => !r)).toHaveLength(3);
  });

  it("si la base falla, permite el request (fail-open) sin lanzar", async () => {
    queryRawMock.mockRejectedValueOnce(new Error("connection refused"));

    const allowed = await checkRateLimit(`db-down-${Math.random()}`, {
      limit: 1,
      windowMs: 60_000,
    });

    expect(allowed).toBe(true);
    expect(console.error).toHaveBeenCalled();
  });

  it("no permite pasar por alto el límite aunque la base falle en la siguiente llamada", async () => {
    // El fail-open es por-fallo, no un interruptor global: si la base
    // vuelve a responder, el límite ya alcanzado se sigue respetando.
    const key = `flaky-${Math.random()}`;
    await checkRateLimit(key, { limit: 1, windowMs: 60_000 });
    expect(await checkRateLimit(key, { limit: 1, windowMs: 60_000 })).toBe(false);

    queryRawMock.mockRejectedValueOnce(new Error("timeout"));
    expect(await checkRateLimit(key, { limit: 1, windowMs: 60_000 })).toBe(true); // fail-open real

    // Vuelve a responder: el bucket sigue en count=1/resetAt vigente, así
    // que se sigue bloqueando normalmente.
    expect(await checkRateLimit(key, { limit: 1, windowMs: 60_000 })).toBe(false);
  });

  it("dispara la limpieza de buckets vencidos solo una fracción baja de las veces", async () => {
    const key = `cleanup-${Math.random()}`;

    vi.spyOn(Math, "random").mockReturnValue(0.5); // no dispara (> CLEANUP_PROBABILITY)
    await checkRateLimit(key, { limit: 5, windowMs: 60_000 });
    expect(deleteManyMock).not.toHaveBeenCalled();

    vi.spyOn(Math, "random").mockReturnValue(0.001); // sí dispara (< CLEANUP_PROBABILITY)
    await checkRateLimit(key, { limit: 5, windowMs: 60_000 });
    expect(deleteManyMock).toHaveBeenCalledTimes(1);
    expect(deleteManyMock.mock.calls[0][0]).toMatchObject({
      where: { resetAt: { lt: expect.any(Date) } },
    });
  });

  it("un fallo en la limpieza no afecta el resultado del check", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.001);
    deleteManyMock.mockRejectedValueOnce(new Error("boom"));

    const allowed = await checkRateLimit(`cleanup-fails-${Math.random()}`, {
      limit: 5,
      windowMs: 60_000,
    });

    expect(allowed).toBe(true);
    // La limpieza es fire-and-forget: darle una vuelta al microtask queue
    // alcanza para que el .catch() del rechazo ya haya corrido.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining("limpieza"),
      expect.any(Error),
    );
  });
});

describe("getClientIp", () => {
  it("toma la primera IP de x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(getClientIp(headers)).toBe("1.2.3.4");
  });

  it("devuelve 'unknown' si no hay cabecera", () => {
    const headers = new Headers();
    expect(getClientIp(headers)).toBe("unknown");
  });
});
