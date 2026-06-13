import { z } from "zod";
import { prisma } from "@/server/db";
import { ok, fail, requireUser, readJson } from "@/server/api";
import { isClassTeacher, isClassMember } from "@/server/access";

export const runtime = "nodejs";

async function loadLesson(lessonId: string) {
  return prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, classId: true, title: true, content: true, videoUrl: true, order: true, published: true },
  });
}

/** Lesson detail. Students may only read published lessons in their class. */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  const lesson = await loadLesson(id);
  if (!lesson) return fail("Not found", 404);

  const teacher = await isClassTeacher(gate.userId, lesson.classId);
  if (!teacher) {
    if (!lesson.published || !(await isClassMember(gate.userId, lesson.classId))) {
      return fail("Not found", 404);
    }
  }
  return ok(lesson);
}

const patchSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().max(50000).optional(),
  videoUrl: z
    .string()
    .trim()
    .max(2000)
    .refine((v) => v === "" || /^https?:\/\/.+/i.test(v), "Invalid video URL")
    .optional(),
  published: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

/** Edit / reorder / publish a lesson. Teacher only. */
export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  const lesson = await loadLesson(id);
  if (!lesson) return fail("Not found", 404);
  if (!(await isClassTeacher(gate.userId, lesson.classId))) return fail("Not found", 404);

  const body = await readJson(req);
  if (body === undefined) return fail("Invalid JSON body");
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid lesson data");

  const updated = await prisma.lesson.update({
    where: { id },
    data: {
      ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
      ...(parsed.data.content !== undefined ? { content: parsed.data.content } : {}),
      ...(parsed.data.videoUrl !== undefined ? { videoUrl: parsed.data.videoUrl } : {}),
      ...(parsed.data.published !== undefined ? { published: parsed.data.published } : {}),
      ...(parsed.data.order !== undefined ? { order: parsed.data.order } : {}),
    },
    select: { id: true, title: true, content: true, videoUrl: true, order: true, published: true },
  });
  return ok(updated);
}

/** Delete a lesson. Teacher only. */
export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  const lesson = await loadLesson(id);
  if (!lesson) return fail("Not found", 404);
  if (!(await isClassTeacher(gate.userId, lesson.classId))) return fail("Not found", 404);

  await prisma.lesson.delete({ where: { id } });
  return ok({ id });
}
