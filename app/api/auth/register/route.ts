import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/server/db";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().email().toLowerCase().max(200),
  password: z.string().min(8).max(200),
  role: z.enum(["teacher", "student"]).optional(),
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

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid input" },
      { status: 400 },
    );
  }

  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Email already registered" },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const defaultView = role === "teacher" ? "TEACHER" : "STUDENT";

  const user = await prisma.user.create({
    data: { name, email, passwordHash, status: "PENDING", defaultView },
    select: { id: true, email: true, name: true, defaultView: true },
  });

  return NextResponse.json<ApiResponse<typeof user>>(
    { success: true, data: user },
    { status: 201 },
  );
}
