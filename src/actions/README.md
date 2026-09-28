# actions

Next.js Server Actions (`"use server"`): mutaciones invocadas desde formularios o
componentes de cliente. Delegan la lógica de datos a `services/`.

Un archivo `"use server"` solo puede exportar funciones async (regla de
Next.js) — el schema de Zod de una entidad no se puede exportar (ni testear)
si vive ahí. Donde hay tests (`products/`, `reviews/`), el schema y su
parser de `FormData` están en un `schema.ts` aparte, sin la directiva; en el
resto siguen inline en `actions.ts` por ahora.
