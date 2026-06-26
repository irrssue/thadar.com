import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/server/db";
import { ok, fail, readJson } from "@/server/api";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().email().toLowerCase().max(200),
  password: z.string().min(8).max(200),
  role: z.enum(["teacher", "student"]).optional(),
});

export async function POST(req: Request) {
  const body = await readJson(req);
  if (body === undefined) {
    return fail("Invalid JSON body", 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Invalid input", 400);
  }

  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return fail("Email already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const defaultView = role === "teacher" ? "TEACHER" : "STUDENT";

  const user = await prisma.user.create({
    data: { name, email, passwordHash, status: "PENDING", defaultView },
    select: { id: true, email: true, name: true, defaultView: true },
  });

  return ok(user, 201);
}
