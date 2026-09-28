# Despliegue

## Desarrollo

```bash
npm install
npm run dev
```

Antes de un PR, correr localmente lo mismo que corre CI:

```bash
npm run lint
npx tsc --noEmit
npm run test
```

## Producción

El deploy es automático vía la integración GitHub ↔ Vercel: cada
`git push` a `main` dispara un build y deploy en Vercel. No hay pasos
manuales de build ni subida de archivos.

```bash
git push
```

Vercel también genera un deploy de preview para cada Pull Request. Además,
cada PR corre el workflow de GitHub Actions (`.github/workflows/ci.yml`):
lint, chequeo de tipos y tests — no duplica el build de Vercel a propósito
(ver comentario en ese archivo).

## Variables de entorno

Se gestionan desde el dashboard de Vercel (Project Settings → Environment
Variables), no desde archivos locales en producción. Variables esperadas
(ver también `.env.example`, que trae el detalle de formato de cada una):

| Variable                | Descripción                                                                                                                   |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`          | Connection string **directa** (no pooled) de Neon (Postgres)                                                                  |
| `AUTH_SECRET`           | Secreto usado por Auth.js para firmar sesiones/tokens                                                                         |
| `AUTH_URL`              | URL pública del sitio (ej: `https://tu-dominio.vercel.app`) — también se reusa como URL canónica del sitio (`siteConfig.url`) |
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud de Cloudinary (gestión de imágenes de producto)                                                              |
| `CLOUDINARY_API_KEY`    | API key de Cloudinary                                                                                                         |
| `CLOUDINARY_API_SECRET` | API secret de Cloudinary — server-only, nunca se expone al cliente                                                            |
| `WHATSAPP_NUMBER`       | Número comercial en formato internacional, solo dígitos (ver `.env.example` para el detalle del formato)                      |
| `COMPANY_NAME`          | Nombre visible en header/footer                                                                                               |
| `INSTAGRAM_URL`         | Opcional — si falta, el link de Instagram no se muestra en el footer                                                          |

Si falta `WHATSAPP_NUMBER` o `CLOUDINARY_*`, la app igual arranca (no hay
`throw` en el arranque) pero los botones de WhatsApp o la subida de
imágenes quedan rotos en runtime — revisar la consola del servidor
(`[site-config]` loguea un warning si `WHATSAPP_NUMBER` falta o queda vacío
tras normalizar).

Para desarrollo local, copiar `.env.example` a `.env.local` y completar los
mismos valores apuntando a una base de Neon de desarrollo (o una rama de
Neon dedicada).
