-- Barra promocional (AnnouncementMarquee) configurable desde el admin en
-- vez de hardcodeada en el componente. Se siembran acá las 4 frases que ya
-- estaban en el código, en el mismo orden, para no cambiar el
-- comportamiento visible al aplicar esta migración.
-- CreateTable
CREATE TABLE "marquee_items" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marquee_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "marquee_items_isActive_position_idx" ON "marquee_items"("isActive", "position");

-- SeedData
INSERT INTO "marquee_items" ("id", "text", "position", "isActive", "createdAt", "updatedAt") VALUES
  ('seed_marquee_0', 'Envíos a toda Argentina', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed_marquee_1', 'Importados desde Japón', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed_marquee_2', 'Productos únicos', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('seed_marquee_3', 'Soporte después de la compra', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
