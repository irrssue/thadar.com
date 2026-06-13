/**
 * Database seed — run with `prisma db seed` (wired via prisma.config.ts) or
 * directly with `node prisma/seed.ts`.
 *
 * Creates a minimal, realistic dataset so a fresh environment is immediately
 * explorable: one verified teacher, one student, a class they share (with a
 * fixed invite code), published lessons, a published assignment, and a
 * submission. Idempotent — safe to run repeatedly; it upserts by natural keys
 * and never duplicates rows.
 *
 * Self-contained on purpose: it does not import `server/db` (that module is
 * `server-only` and is meant for the Next.js runtime, not a standalone script).
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

// Shared demo password. Override with SEED_PASSWORD when seeding a shared env.
const PASSWORD = process.env.SEED_PASSWORD ?? "password123";
const INVITE_CODE = "MYANMAR";

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@thadar.com" },
    update: {},
    create: {
      email: "teacher@thadar.com",
      name: "Daw Hla",
      passwordHash,
      defaultView: "TEACHER",
      teacherStatus: "VERIFIED",
      emailVerified: true,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@thadar.com" },
    update: {},
    create: {
      email: "student@thadar.com",
      name: "Aung Kyaw",
      passwordHash,
      defaultView: "STUDENT",
      emailVerified: true,
    },
  });

  // Class — keyed on the fixed invite code so reseeding reuses the same class.
  const klass =
    (await prisma.class.findUnique({ where: { inviteCode: INVITE_CODE } })) ??
    (await prisma.class.create({
      data: {
        ownerId: teacher.id,
        name: "English Foundations",
        description:
          "Reading, writing, and conversation — built one lesson at a time.",
        inviteCode: INVITE_CODE,
        inviteCodeEnabled: true,
      },
    }));

  // Memberships (unique on userId+classId).
  await prisma.classMembership.upsert({
    where: { userId_classId: { userId: teacher.id, classId: klass.id } },
    update: { role: "TEACHER", status: "ACTIVE" },
    create: { userId: teacher.id, classId: klass.id, role: "TEACHER", status: "ACTIVE" },
  });
  await prisma.classMembership.upsert({
    where: { userId_classId: { userId: student.id, classId: klass.id } },
    update: { role: "STUDENT", status: "ACTIVE" },
    create: { userId: student.id, classId: klass.id, role: "STUDENT", status: "ACTIVE" },
  });

  // Lessons — no natural unique key, so match on (classId, title) to stay idempotent.
  const lessonSpecs = [
    {
      title: "Welcome & how this class works",
      content:
        "# Welcome\n\nWe meet twice a week. Watch each lesson, then complete the assignment. Message me any time you're stuck.",
      order: 0,
      published: true,
    },
    {
      title: "The present simple tense",
      content:
        "## Present simple\n\nUse it for habits and facts: *I study every evening.* Practice with the worksheet below.",
      order: 1,
      published: true,
    },
    {
      title: "Reading: short stories",
      content:
        "## Reading\n\nRead the passage, then write three sentences about the main character.",
      order: 2,
      published: true,
    },
    {
      title: "Draft: past tense (not yet published)",
      content: "Coming soon.",
      order: 3,
      published: false,
    },
  ];

  const lessons: { id: string; title: string }[] = [];
  for (const spec of lessonSpecs) {
    const existing = await prisma.lesson.findFirst({
      where: { classId: klass.id, title: spec.title },
      select: { id: true, title: true },
    });
    if (existing) {
      lessons.push(existing);
    } else {
      const created = await prisma.lesson.create({
        data: { classId: klass.id, ...spec },
        select: { id: true, title: true },
      });
      lessons.push(created);
    }
  }

  // The student has viewed the first lesson (powers progress tracking).
  await prisma.lessonView.upsert({
    where: { lessonId_userId: { lessonId: lessons[0].id, userId: student.id } },
    update: {},
    create: { lessonId: lessons[0].id, userId: student.id },
  });

  // Published assignment linked to the present-simple lesson.
  const grammarLesson = lessons.find((l) => l.title === "The present simple tense");
  const assignmentTitle = "Worksheet 1 — present simple";
  let assignment = await prisma.assignment.findFirst({
    where: { classId: klass.id, title: assignmentTitle },
    select: { id: true },
  });
  if (!assignment) {
    assignment = await prisma.assignment.create({
      data: {
        classId: klass.id,
        authorId: teacher.id,
        lessonId: grammarLesson?.id ?? null,
        title: assignmentTitle,
        instructions:
          "Write five sentences in the present simple about your daily routine.",
        dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        status: "PUBLISHED",
      },
      select: { id: true },
    });
  }

  // A draft assignment for the teacher to see in their queue.
  const draftTitle = "Reading response (draft)";
  const draftExists = await prisma.assignment.findFirst({
    where: { classId: klass.id, title: draftTitle },
    select: { id: true },
  });
  if (!draftExists) {
    await prisma.assignment.create({
      data: {
        classId: klass.id,
        authorId: teacher.id,
        title: draftTitle,
        instructions: "Three sentences about the main character.",
        status: "DRAFT",
      },
    });
  }

  // The student has submitted the published assignment.
  await prisma.submission.upsert({
    where: { assignmentId_studentId: { assignmentId: assignment.id, studentId: student.id } },
    update: {},
    create: {
      assignmentId: assignment.id,
      studentId: student.id,
      content:
        "I wake up at six. I eat breakfast. I study English. I help my mother. I read before bed.",
      status: "SUBMITTED",
    },
  });

  console.log("Seed complete:");
  console.log(`  teacher  teacher@thadar.com / ${PASSWORD}`);
  console.log(`  student  student@thadar.com / ${PASSWORD}`);
  console.log(`  class    "${klass.name}"  invite code: ${INVITE_CODE}`);
  console.log(`  lessons  ${lessons.length} (3 published, 1 draft)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
