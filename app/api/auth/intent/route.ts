import { z } from "zod";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { ok, fail, readJson } from "@/server/api";

export const runtime = "nodejs";

const intentSchema = z.object({
  intent: z.enum(["teacher", "student"]),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return fail("Unauthorized", 401);
  }

  const body = await readJson(req);
  if (body === undefined) {
    return fail("Invalid JSON body", 400);
  }

  const parsed = intentSchema.safeParse(body);
  if (!parsed.success) {
    return fail("Invalid intent", 400);
  }

  const defaultView = parsed.data.intent === "teacher" ? "TEACHER" : "STUDENT";

  await prisma.user.update({
    where: { id: session.user.id },
    data: { defaultView },
  });

  const redirect = defaultView === "TEACHER" ? "/teacher" : "/home";
  return ok({ redirect });
}
