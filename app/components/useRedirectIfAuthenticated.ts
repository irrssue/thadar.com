"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

/**
 * Auth pages (login + signup) must never be shown to a user who is already
 * signed in. Without this, an accidental tap on a "Create one" / "Get started"
 * link funnels an existing account straight back into the registration flow —
 * the "I'm logged in but it's asking me to sign up again" loop. Bounce them to
 * their dashboard instead.
 *
 * Returns the session status so callers can render nothing while the redirect
 * is in flight (avoids a flash of the auth form).
 */
export function useRedirectIfAuthenticated(): "loading" | "authenticated" | "unauthenticated" {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;
    const dest = session?.user?.defaultView === "TEACHER" ? "/teacher" : "/home";
    router.replace(dest);
  }, [status, session, router]);

  return status;
}
