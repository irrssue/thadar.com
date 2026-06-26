import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

const schema = z.object({
  token: z.string().min(1).max(200),
  password: z.string().min(8).max(200),
});

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid input" },
      { status: 400 },
    );
  }

  const { token, password } = parsed.data;

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record || record.expiresAt < new Date()) {
    // Delete expired token if found
    if (record) {
      await prisma.passwordResetToken.delete({ where: { tokenHash } });
    }
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "This reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.delete({ where: { tokenHash } }),
  ]);

  return NextResponse.json<ApiResponse<{ ok: boolean }>>(
    { success: true, data: { ok: true } },
  );
}
