# Ecommerce — Catálogo con contacto por WhatsApp

Catálogo de productos (categorías, marcas, búsqueda) con panel administrativo
para gestión de productos e imágenes. Las consultas y pedidos se hacen por
WhatsApp: no hay pasarela de pagos.

Configurado actualmente como **RETROID** (consolas retro importadas), pero el
branding es de configuración: nombre, número de WhatsApp e Instagram salen de
variables de entorno (`src/lib/site-config.ts`), y la paleta de colores es un
único bloque de tokens CSS en `src/app/globals.css` — pensado para poder
reusarse en otro catálogo cambiando esos dos lugares, no el código de las
páginas.

## Stack

- [Next.js 15](https://nextjs.org/docs) (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- [shadcn/ui](https://ui.shadcn.com/) (variante Base UI) + [lucide-react](https://lucide.dev/) para íconos
- [Prisma ORM](https://www.prisma.io/docs) + PostgreSQL
- [Auth.js (NextAuth)](https://authjs.dev/) para el login del panel administrativo
- [Cloudinary](https://cloudinary.com/) para las imágenes de productos (upload firmado directo desde el navegador)
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) para tests
- Hosting: [Vercel](https://vercel.com/)
- Base de datos: [Neon](https://neon.tech/) (Postgres serverless)
- CI: [GitHub Actions](./.github/workflows/ci.yml) (lint, tipos, tests en cada PR)

## Estado actual

- Login (Auth.js, Credentials) con panel protegido por middleware. Sin
  roles/permisos a propósito: solo dos personas acceden al panel y ambas
  necesitan acceso completo — no hay RBAC a medio implementar, ver
  decisión documentada en `prisma/schema.prisma` (modelo `User`).
- CRUD completo de categorías, marcas y productos, con gestión de imágenes
  (subida, reorden, imagen principal) vía Cloudinary.
- Catálogo público: home, listado con filtros/búsqueda/paginación y detalle
  de producto, todo en `src/app/(public)/`.
- Contacto comercial por WhatsApp (botones en cards, detalle y header/footer)
  con mensajes armados server-side en `src/lib/whatsapp.ts`.
- Identidad visual dark-first (sin selector claro/oscuro) con paleta propia
  y tipografía Geist.
- Estados de carga y error nativos de Next.js (`loading.tsx`/`error.tsx`/
  `not-found.tsx`) en el catálogo público y el panel admin.
- Seguridad: rate limiting respaldado en Postgres (login y alta pública de
  reseñas, ver `src/lib/rate-limit.ts` y el modelo `RateLimitBucket`) — no
  en memoria, para que el límite real sea el mismo sin importar cuántas
  instancias serverless de Vercel atiendan los requests o cuántas veces se
  reciclen. CSP con nonce por request + headers de seguridad adicionales
  (`src/middleware.ts`), CHECK constraint a nivel de base de datos en
  `Review.rating` además de la validación de Zod.
- Tests: validaciones de Zod, una acción pública completa (`createReviewAction`,
  incluyendo honeypot y rate limiting), shaping de queries de Prisma y un
  componente de UI — ver `npm run test`.

## Estructura de carpetas

```
.github/
  workflows/ci.yml   lint + tipos + tests en cada PR/push a main

prisma/
  schema.prisma   modelos de datos y configuración de Prisma
  migrations/     historial de migraciones (generado por Prisma)

src/
  app/
    (public)/     catálogo público: home, /productos, /productos/[slug]
                   (con loading.tsx/error.tsx/not-found.tsx propios)
    administracion/ panel admin (protegido): dashboard, CRUD, usuarios
                   (con loading.tsx/error.tsx propios)
    login/        login del panel
    api/auth/     route handler de Auth.js
  components/   UI genérica reutilizable (Button, Table, etc. de shadcn +
                 wrappers propios como SubmitButton/DeleteButton/FieldError)
  features/     módulos de dominio: categories/, brands/, products/ (forms,
                 tablas, cards, galería), admin/ (sidebar)
  lib/          inicialización de librerías externas y config centralizada
                 (Prisma, Cloudinary, Auth.js, WhatsApp, site-config,
                 rate-limit, nonce para CSP)
  hooks/        custom React hooks reutilizables (reservado, aún sin uso)
  services/     acceso a datos vía Prisma — únicas funciones que hacen
                 queries; actions/ y componentes las consumen, no al revés
  types/        tipos TypeScript compartidos
  utils/        funciones puras sin dependencias de negocio (precio, slug)
  actions/      Next.js Server Actions, una carpeta por entidad — el schema
                 de Zod vive en un archivo aparte (schema.ts) donde hay
                 tests, porque un módulo "use server" solo puede exportar
                 funciones async
  auth.ts / auth.config.ts   configuración de Auth.js (split Edge-safe,
                 ver comentarios en el código para el porqué)
  middleware.ts protección de rutas del panel admin + nonce y cabecera CSP
                 por request para todo el sitio
```

Archivos `*.test.ts(x)` conviven junto al código que testean (no una carpeta
`__tests__` aparte). Correr la suite con `npm run test` (una vez) o
`npm run test:watch` (modo watch).

Cada carpeta de `src/` tiene un `README.md` corto explicando su
responsabilidad. Alias de importación configurado: `@/` apunta a `src/` (ver
`tsconfig.json`).

### Identidad visual

La app es **dark-first sin selector de tema** (`<html class="dark">` fijo en
`src/app/layout.tsx`). Todos los colores viven como variables CSS en un único
bloque `.dark { ... }` de `src/app/globals.css`, consumidas por componentes
vía clases de Tailwind (`bg-background`, `text-primary`, etc.) — para
re-themear el sitio alcanza con cambiar esos valores ahí, no hace falta tocar
componentes.

## Desarrollo local

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

Variables de entorno: copiar `.env.example` a `.env.local` y completar
`DATABASE_URL` (Neon), las de Auth.js, las de Cloudinary y las de WhatsApp
(`WHATSAPP_NUMBER`, `COMPANY_NAME`, `INSTAGRAM_URL` opcional). Ver
`.env.example` para el formato esperado de cada una.

Usuario admin de prueba (creado por `prisma/seed.ts`): `admin@admin.com` /
`123456`. Cambiar esa contraseña antes de ir a producción.

Antes de un PR: `npm run lint`, `npx tsc --noEmit` y `npm run test` (lo mismo
que corre `.github/workflows/ci.yml`).

## Despliegue

Ver [`DEPLOY.md`](./DEPLOY.md). En resumen: deploy automático en Vercel al
hacer `git push`, con la base de datos en Neon y las variables de entorno
gestionadas desde el dashboard de Vercel.

## Rate limiting — decisiones de diseño

`src/lib/rate-limit.ts` implementa el límite de intentos (login y alta
pública de reseñas) contra una tabla Postgres (`RateLimitBucket`: una fila
por key — IP + ruta — no una fila por intento), en vez de un `Map` en
memoria. Tres decisiones concretas, y por qué:

- **Atomicidad bajo concurrencia**: el incremento (o el reset, si la
  ventana ya venció) se hace con un único `INSERT ... ON CONFLICT DO
UPDATE` en SQL crudo, no con "leer el contador, decidir, escribir" en
  pasos separados. Postgres toma un lock de fila durante esa sentencia, así
  que dos requests concurrentes para la misma key se serializan ahí — verificado
  con 25 requests genuinamente concurrentes contra la base real con límite
  10: el resultado fue siempre exactamente 10 permitidos / 15 bloqueados,
  nunca de más ni de menos (ver el test "bajo solicitudes concurrentes..."
  en `rate-limit.test.ts` para la versión mockeada de la misma prueba).
- **Limpieza de buckets vencidos**: sin cron ni job aparte — una fracción
  baja y aleatoria (1%) de los checks dispara un `deleteMany` de buckets
  vencidos hace más de una hora. Fire-and-forget: no se espera (no le suma
  latencia al request que lo disparó) y sus propios errores no afectan el
  resultado del check.
- **Si la base no responde**: fail-open (se permite el request). El login
  busca el usuario en esa misma base y la reseña se guarda en esa misma
  base — si la base está caída, esas operaciones van a fallar solas de
  todos modos; bloquear acá no reduce ningún riesgo real, solo agrega un
  modo de fallo más confuso encima del real. Se loguea con `console.error`
  para que quede visible en logs/monitoreo.

## Próximos pasos

No implementado todavía, a propósito: carrito/checkout, pagos online, Google
Analytics / Meta Pixel, gestión CRUD de usuarios (por ahora
`/administracion/usuarios` es solo lectura — alta de usuarios vía
`prisma/seed.ts` o acceso directo a la base).
