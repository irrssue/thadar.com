import "server-only";
import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./db";

type PlatformRole = "USER" | "ADMIN" | "SUPER_ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      defaultView: "TEACHER" | "STUDENT";
      platformRole: PlatformRole;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    defaultView?: "TEACHER" | "STUDENT";
    platformRole?: PlatformRole;
  }
}

const credentialsSchema = z.object({
  email: z.string().email().toLowerCase(),
  password: z.string().min(8).max(200),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (raw) => {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // Suspended accounts are locked out of the entire platform — student,
        // teacher and admin surfaces alike. This is how an admin "removes
        // access" from the control panel.
        if (user.status === "SUSPENDED") return null;

        // Best-effort sign-in timestamp powering the admin "last active" /
        // "active now" metrics. Never block login on this write.
        await prisma.user
          .update({ where: { id: user.id }, data: { lastSeenAt: new Date() } })
          .catch(() => undefined);

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          defaultView: user.defaultView,
          platformRole: user.platformRole,
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user, trigger, session }) => {
      if (user) {
        token.sub = user.id;
        token.defaultView = (user as { defaultView?: "TEACHER" | "STUDENT" }).defaultView;
        token.platformRole = (user as { platformRole?: PlatformRole }).platformRole ?? "USER";
      }
      if (trigger === "update" && session && typeof session === "object") {
        const next = (session as { defaultView?: "TEACHER" | "STUDENT" }).defaultView;
        if (next === "TEACHER" || next === "STUDENT") token.defaultView = next;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.defaultView = token.defaultView ?? "STUDENT";
        session.user.platformRole = token.platformRole ?? "USER";
      }
      return session;
    },
  },
});
