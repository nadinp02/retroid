import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

function buildCsp(nonce: string) {
  // El Fast Refresh / HMR de "next dev" usa eval() internamente (webpack
  // devtool eval-source-map) — sin 'unsafe-eval' en dev, cualquier página
  // tira un CSP violation apenas hidrata y JS deja de responder: el menú,
  // los selects, la galería, todo lo que dependa de un handler de React
  // queda roto. next build/start no lo necesita — esto NO relaja nada en
  // producción, solo en desarrollo local.
  const scriptSrc =
    process.env.NODE_ENV === "development"
      ? `script-src 'self' 'unsafe-eval' 'nonce-${nonce}'`
      : `script-src 'self' 'nonce-${nonce}'`;

  return [
    "default-src 'self'",
    // 'self' cubre los chunks propios de Next; el nonce cubre tanto los
    // scripts inline que genera el propio Next (bootstrap/hydration, los
    // detecta automáticamente vía esta misma cabecera) como los JSON-LD que
    // escribimos a mano (ver src/lib/nonce.ts).
    scriptSrc,
    // Sin nonce para estilos: Tailwind/los componentes usan bastante
    // style="..." inline, y un CSP nonce-based para eso no vale la
    // complejidad acá — 'unsafe-inline' en style-src es un trade-off
    // aceptado, no un descuido.
    "style-src 'self' 'unsafe-inline'",
    // Cloudinary sirve las imágenes ya subidas (res.*); data: para blur
    // placeholders/inline de next/image.
    "img-src 'self' https://res.cloudinary.com data:",
    "font-src 'self'",
    // api.cloudinary.com (no res.*): el browser sube imágenes ahí en forma
    // directa desde el admin (ver product-images/image-manager.tsx), con
    // firma generada server-side — nunca con credenciales expuestas.
    "connect-src 'self' https://api.cloudinary.com",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export default auth((req) => {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const csp = buildCsp(nonce);

  // Reemplaza el callback "authorized" declarativo que tenía auth.config.ts:
  // ese modo solo se activa con "export default auth" a secas, no cuando se
  // le pasa una función propia (necesaria acá para generar el nonce en cada
  // request). La lógica de la protección es la misma que antes.
  const isProtectedRoute = req.nextUrl.pathname.startsWith("/administracion");
  if (isProtectedRoute && !req.auth?.user) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
});

export const config = {
  // Todo excepto assets estáticos de Next y archivos con extensión (íconos,
  // imágenes públicas, etc.) — esas respuestas no rendean HTML, no
  // necesitan nonce ni CSP.
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
