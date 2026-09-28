import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

const LOGIN_RATE_LIMIT = { limit: 5, windowMs: 60_000 };

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        // Por IP, no por email: así también frena a un atacante que prueba
        // muchos emails distintos desde el mismo lugar, no solo fuerza bruta
        // sobre una cuenta puntual.
        if (!(await checkRateLimit(`login:${getClientIp(request.headers)}`, LOGIN_RATE_LIMIT))) {
          return null;
        }

        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          return null;
        }

        const isValid = await verifyPassword(password, user.password);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
});

// El middleware ya protege /administracion/:path* por pathname, y las
// Server Actions viajan como POST a ese mismo pathname — pero esa protección
// es indirecta. Esto agrega una verificación explícita, en el propio archivo
// de la action, para no depender exclusivamente de dónde se invoque desde.
export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autorizado");
  }
  return session;
}
