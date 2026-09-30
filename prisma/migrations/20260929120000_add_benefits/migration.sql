-- Franja de beneficios (BenefitsStrip / ProductTrustStrip) configurable
-- desde el admin en vez de hardcodeada en el componente. Se siembran acá los
-- 3 beneficios que ya estaban en el código, en el mismo orden, para no
-- cambiar el comportamiento visible al aplicar esta migración.
-- CreateTable
CREATE TABLE "benefits" (
    "id" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "benefits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "benefits_isActive_position_idx" ON "benefits"("isActive", "position");

-- SeedData
INSERT INTO "benefits" ("id", "icon", "title", "text", "position", "isActive", "createdAt", "updatedAt") VALUES
  ('seed_benefit_0', 'truck', 'Envíos a todo el país', 'Recibí tu compra estés donde estés.', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed_benefit_1', 'sparkles', 'Productos únicos', 'Elegimos cada pieza por su estado, calidad y rareza.', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed_benefit_2', 'headset', 'Soporte real, no solo venta', '¿Dudas con juegos, configuración o instalación? Te acompañamos después de la compra.', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
