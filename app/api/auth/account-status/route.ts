import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email")?.toLowerCase().trim();
  if (!email) return NextResponse.json({ status: "not_found" });

  const user = await prisma.user.findUnique({
    where: { email },
    select: { status: true },
  });

  if (!user) return NextResponse.json({ status: "not_found" });

  const status =
    user.status === "PENDING"
      ? "pending"
      : user.status === "SUSPENDED"
        ? "suspended"
        : "active";

  return NextResponse.json({ status });
}
