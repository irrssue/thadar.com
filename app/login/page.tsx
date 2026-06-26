"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRedirectIfAuthenticated } from "@/components/useRedirectIfAuthenticated";
import { LoginForm } from "./_components/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  // Already signed in? Don't show the login form — go to the dashboard.
  const authStatus = useRedirectIfAuthenticated();

  // While we know the user is signed in (and being redirected), render nothing
  // so the login form never flashes — and can't be interacted with.
  if (authStatus === "authenticated") return null;

  return <LoginForm callbackUrl={callbackUrl} />;
}
