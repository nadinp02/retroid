import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";

async function seedAdmin() {
  const password = await hashPassword("123456");

  await prisma.user.upsert({
    where: { email: "admin@admin.com" },
    update: {},
    create: {
      email: "admin@admin.com",
      password,
      name: "Admin",
    },
  });
}

const LEGACY_PRODUCT_SLUGS = ["smart-tv-50-4k", "heladera-no-frost-300l", "remera-basica-algodon"];
const LEGACY_CATEGORY_SLUGS = ["electronica", "hogar", "indumentaria"];
const LEGACY_BRAND_SLUGS = ["samsung", "lg"];

/**
 * Borra el catálogo demo genérico de las Fases 4-8 (TV/heladera/remera).
 * Idempotente: no pasa nada si ya no existe. Hace falta borrar productos
 * antes que categorías/marcas por la FK (no hay onDelete: Cascade a
 * propósito, ver Fase 4).
 */
async function cleanupLegacyDemoData() {
  await prisma.product.deleteMany({ where: { slug: { in: LEGACY_PRODUCT_SLUGS } } });
  await prisma.category.deleteMany({ where: { slug: { in: LEGACY_CATEGORY_SLUGS } } });
  await prisma.brand.deleteMany({ where: { slug: { in: LEGACY_BRAND_SLUGS } } });
}

async function seedCatalog() {
  const [consolas, accesorios, estuches, cartuchos] = await Promise.all([
    prisma.category.upsert({
      where: { slug: "consolas" },
      update: {},
      create: { name: "Consolas", slug: "consolas" },
    }),
    prisma.category.upsert({
      where: { slug: "accesorios" },
      update: {},
      create: { name: "Accesorios", slug: "accesorios" },
    }),
    prisma.category.upsert({
      where: { slug: "estuches" },
      update: {},
      create: { name: "Estuches", slug: "estuches" },
    }),
    prisma.category.upsert({
      where: { slug: "cartuchos" },
      update: {},
      create: { name: "Cartuchos", slug: "cartuchos" },
    }),
  ]);

  const nintendo = await prisma.brand.upsert({
    where: { slug: "nintendo" },
    update: {},
    create: { name: "Nintendo", slug: "nintendo" },
  });

  // brandId: null en los flashcarts (no son producto oficial de Nintendo) y
  // en los estuches Travel Case (accesorio de terceros, no un producto
  // Nintendo). El resto son hardware/software oficial Nintendo.
  const products = [
    {
      name: "Nintendo DS Fat Azul",
      slug: "nintendo-ds-fat-azul",
      description: "Nintendo DS original, modelo Fat, color azul. Reacondicionada y testeada.",
      price: "55000.00",
      stock: 3,
      sku: "NDS-FAT-AZ",
      categoryId: consolas.id,
      brandId: nintendo.id,
    },
    {
      name: "Nintendo DS Lite Negra",
      slug: "nintendo-ds-lite-negra",
      description: "Nintendo DS Lite negra, pantallas sin quemados, bisagra firme.",
      price: "65000.00",
      stock: 4,
      sku: "NDS-LITE-NG",
      categoryId: consolas.id,
      brandId: nintendo.id,
    },
    {
      name: "Nintendo DSi Blanca",
      slug: "nintendo-dsi-blanca",
      description: "Nintendo DSi blanca, con cámaras y DSi Shop. Batería reemplazada.",
      price: "75000.00",
      stock: 2,
      sku: "NDSI-BL",
      categoryId: consolas.id,
      brandId: nintendo.id,
    },
    {
      name: "Nintendo DSi XL Bordó",
      slug: "nintendo-dsi-xl-bordo",
      description:
        "Nintendo DSi XL bordó, pantallas grandes, ideal para lectura y juego prolongado.",
      price: "90000.00",
      stock: 2,
      sku: "NDSI-XL-BD",
      categoryId: consolas.id,
      brandId: nintendo.id,
    },
    {
      name: "Nintendo 3DS Aqua Blue",
      slug: "nintendo-3ds-aqua-blue",
      description: "Nintendo 3DS Aqua Blue, efecto 3D funcionando, carcasa sin rayones profundos.",
      price: "105000.00",
      stock: 2,
      sku: "N3DS-AQUA",
      categoryId: consolas.id,
      brandId: nintendo.id,
    },
    {
      name: "Nintendo 3DS Cosmo Black",
      slug: "nintendo-3ds-cosmo-black",
      description: "Nintendo 3DS Cosmo Black, completa con cargador original.",
      price: "105000.00",
      stock: 1,
      sku: "N3DS-COSMO",
      categoryId: consolas.id,
      brandId: nintendo.id,
    },
    {
      name: "New Nintendo 3DS Negra",
      slug: "new-nintendo-3ds-negra",
      description: "New Nintendo 3DS negra, con joystick C adicional y mejor rendimiento 3D.",
      price: "140000.00",
      stock: 2,
      sku: "NEW3DS-NG",
      categoryId: consolas.id,
      brandId: nintendo.id,
    },
    {
      name: "New Nintendo 3DS XL Negra",
      slug: "new-nintendo-3ds-xl-negra",
      description: "New Nintendo 3DS XL negra, pantallas grandes, ranura microSD.",
      price: "165000.00",
      stock: 1,
      sku: "NEW3DS-XL-NG",
      categoryId: consolas.id,
      brandId: nintendo.id,
    },
    {
      name: "Lápiz Stylus Nintendo DS",
      slug: "lapiz-stylus-nintendo-ds",
      description: "Stylus de repuesto compatible con toda la línea Nintendo DS/3DS.",
      price: "3500.00",
      stock: 25,
      sku: "ACC-STYLUS",
      categoryId: accesorios.id,
      brandId: nintendo.id,
    },
    {
      name: "Cargador Nintendo DS / 3DS",
      slug: "cargador-nintendo-ds-3ds",
      description: "Cargador original, compatible con toda la línea DS, DSi y 3DS.",
      price: "9000.00",
      stock: 15,
      sku: "ACC-CHARGER",
      categoryId: accesorios.id,
      brandId: nintendo.id,
    },
    {
      name: "Cartucho R4 Gold",
      slug: "cartucho-r4-gold",
      description: "Flashcart R4 Gold para Nintendo DS, requiere microSD (no incluida).",
      price: "16000.00",
      stock: 8,
      sku: "R4-GOLD",
      categoryId: cartuchos.id,
      brandId: null,
    },
    {
      name: "Cartucho R4 Dual Core",
      slug: "cartucho-r4-dual-core",
      description: "Flashcart R4 Dual Core, compatible DS y 3DS en modo compatibilidad.",
      price: "17500.00",
      stock: 6,
      sku: "R4-DUALCORE",
      categoryId: cartuchos.id,
      brandId: null,
    },
    {
      name: "Travel Case Retroid Amarilla",
      slug: "travel-case-retroid-amarilla",
      description:
        "Estuche de viaje rígido, línea Retroid, color amarillo. Guarda consola + cartuchos.",
      price: "13000.00",
      stock: 10,
      sku: "CASE-RETROID-AM",
      categoryId: estuches.id,
      brandId: null,
    },
    {
      name: "Travel Case Retroid Negra",
      slug: "travel-case-retroid-negra",
      description:
        "Estuche de viaje rígido, línea Retroid, color negro. Guarda consola + cartuchos.",
      price: "13000.00",
      stock: 10,
      sku: "CASE-RETROID-NG",
      categoryId: estuches.id,
      brandId: null,
    },
    {
      name: "Mario Kart DS Original",
      slug: "mario-kart-ds-original",
      description: "Cartucho original de Mario Kart DS, funcionamiento y guardado testeados.",
      price: "32000.00",
      stock: 3,
      sku: "MKDS-ORIG",
      categoryId: cartuchos.id,
      brandId: nintendo.id,
    },
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData,
    });
  }
  // Las imágenes ya no se siembran acá: se suben de verdad a Cloudinary
  // desde el panel administrativo (Fase 7).
}

async function main() {
  await seedAdmin();
  await cleanupLegacyDemoData();
  await seedCatalog();
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
