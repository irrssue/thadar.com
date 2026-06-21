"use client";

// Carries the signed-in admin's identity + privilege level down to the client
// pages, so they can label the UI and gate super-admin-only actions without
// re-fetching the session.

import { createContext, useContext } from "react";

export type AdminCtx = { name: string; role: string; isSuper: boolean };

const Ctx = createContext<AdminCtx>({ name: "Admin", role: "Admin", isSuper: false });

export const useAdminCtx = () => useContext(Ctx);

export function AdminProvider({ value, children }: { value: AdminCtx; children: React.ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
