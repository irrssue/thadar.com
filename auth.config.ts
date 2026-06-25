import type { NextAuthConfig } from "next-auth";

// NB: /signup/* and /login are PUBLIC — gating them sends logged-out users who
// tap "Create one" into a /login?callbackUrl=/signup/intent bounce loop (the
// link appears dead, then login lands them back on the sign-up flow).
const PROTECTED_PREFIXES = ["/home", "/classes", "/profile", "/inbox", "/teacher"];

export default {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized: ({ request, auth }) => {
      const { pathname } = request.nextUrl;
      const needsAuth = PROTECTED_PREFIXES.some(
        (p) => pathname === p || pathname.startsWith(p + "/"),
      );
      if (!needsAuth) return true;
      return !!auth?.user;
    },
  },
} satisfies NextAuthConfig;
