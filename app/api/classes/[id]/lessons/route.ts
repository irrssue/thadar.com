import { z } from "zod";
import { prisma } from "@/server/db";
import { ok, fail, requireUser, readJson } from "@/server/api";
import { isClassTeacher, isClassMember } from "@/server/access";

export const runtime = "nodejs";

/**
 * List lessons for a class. Teachers see all (incl. unpublished) with view
 * counts; students see only published lessons plus whether they've viewed each.
 */
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  const teacher = await isClassTeacher(gate.userId, id);

  if (!teacher) {
    if (!(await isClassMember(gate.userId, id))) return fail("Not found", 404);
    const lessons = await prisma.lesson.findMany({
      where: { classId: id, published: true },
      orderBy: { order: "asc" },
      select: {
        id: true,
        title: true,
        content: true,
        videoUrl: true,
        order: true,
        views: {
          where: { userId: gate.userId },
          select: { viewedAt: true },
        },
      },
    });
    return ok(
      lessons.map((l) => ({
        id: l.id,
        title: l.title,
        content: l.content,
        videoUrl: l.videoUrl,
        order: l.order,
        viewed: l.views.length > 0,
      })),
    );
  }

  const lessons = await prisma.lesson.findMany({
    where: { classId: id },
    orderBy: { order: "asc" },
    select: {
      id: true,
      title: true,
      content: true,
      videoUrl: true,
      order: true,
      published: true,
      _count: { select: { views: true } },
    },
  });
  return ok(lessons);
}

// Allow an empty string (no video) or a valid http(s) URL — typically an
// unlisted YouTube link that students open to watch the lesson video.
const videoUrlSchema = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || /^https?:\/\/.+/i.test(v), "Invalid video URL");

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().max(50000).optional(),
  videoUrl: videoUrlSchema.optional(),
  published: z.boolean().default(false),
});

/** Create a lesson, appended to the end of the class order. Teacher only. */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const gate = await requireUser();
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  if (!(await isClassTeacher(gate.userId, id))) return fail("Not found", 404);

  const body = await readJson(req);
  if (body === undefined) return fail("Invalid JSON body");
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid lesson data");

  const last = await prisma.lesson.findFirst({
    where: { classId: id },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const created = await prisma.lesson.create({
    data: {
      classId: id,
      title: parsed.data.title,
      content: parsed.data.content ?? "",
      videoUrl: parsed.data.videoUrl ?? "",
      published: parsed.data.published,
      order: (last?.order ?? -1) + 1,
    },
    select: { id: true, title: true, content: true, videoUrl: true, order: true, published: true },
  });

  return ok(created, 201);
}
