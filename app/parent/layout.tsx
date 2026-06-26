import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";

export const metadata: Metadata = {
  title: "Thadar — Parent Portal",
};

// Auth gate for the whole parent portal. A parent is any signed-in user with at
// least one ACTIVE ParentLink. Unauthenticated visitors go to login; signed-in
// users with no linked children are bounced to their own home (they aren't
// guardians). View-only access is enforced again per-request in the API.
export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const link = await prisma.parentLink.findFirst({
    where: { parentId: session.user.id, status: "ACTIVE" },
    select: { id: true },
  });
  if (!link) redirect("/home");

  return <>{children}</>;
}
