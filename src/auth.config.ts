import type { NextAuthConfig } from "next-auth";

// Config compatible con Edge Runtime: sin providers que dependan de Node
// (Prisma, bcryptjs). Los agrega "@/auth", que es el que se usa en Server
// Components/Actions y en el route handler (todos corren en Node runtime).
// Este archivo es el que consume "@/middleware", que sí corre en Edge.
//
// Sin callback "authorized": ese modo declarativo solo se activa con
// "export default auth" a secas en el middleware. Como el middleware
// necesita generar un nonce de CSP por request (ver src/middleware.ts), usa
// la variante "auth((req) => ...)" con la protección de /administracion
// escrita a mano ahí mismo — este archivo queda solo para lo que se
// comparte entre el middleware (Edge) y "@/auth" (Node).
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
} satisfies NextAuthConfig;
