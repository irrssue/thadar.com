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

  // Platform super admin — signs in at admin.thadar.com to run the control panel.
  await prisma.user.upsert({
    where: { email: "admin@thadar.com" },
    update: { platformRole: "SUPER_ADMIN" },
    create: {
      email: "admin@thadar.com",
      name: "Ana Reyes",
      passwordHash,
      defaultView: "TEACHER",
      platformRole: "SUPER_ADMIN",
      teacherStatus: "VERIFIED",
      emailVerified: true,
    },
  });

  // A teacher awaiting verification + a flagged message, so the admin
  // moderation queue and the "needs review" surfaces are populated on a fresh
  // seed (alongside the pending join requests created further down).
  await prisma.user.upsert({
    where: { email: "pending.teacher@thadar.com" },
    update: { teacherStatus: "PENDING" },
    create: {
      email: "pending.teacher@thadar.com",
      name: "Dara Okafor",
      passwordHash,
      defaultView: "TEACHER",
      teacherStatus: "PENDING",
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

  // ============================================================
  // Rich dataset — fills out the redesigned student dashboard so
  // its charts, gauges and trends have real data to draw. Extra
  // classes, graded assignments spread over the term, and inbox
  // messages. Everything below is idempotent (matched on natural
  // keys) and additive — it never edits the core rows above.
  // ============================================================
  const DAY = 86_400_000;

  const teacher2 = await prisma.user.upsert({
    where: { email: "teacher2@thadar.com" },
    update: {},
    create: {
      email: "teacher2@thadar.com",
      name: "U Bo Bo",
      passwordHash,
      defaultView: "TEACHER",
      teacherStatus: "VERIFIED",
      emailVerified: true,
    },
  });

  type ASpec = { title: string; dueOffset: number; grade?: string; late?: boolean };
  type CSpec = {
    name: string;
    description: string;
    ownerId: string;
    enroll: "ACTIVE" | "PENDING";
    lessons: string[];
    assignments: ASpec[];
  };

  // dueOffset is days from now (negative = past). Past assignments with a grade
  // get a RETURNED submission dated around their due date; open ones stay open.
  const catalog: CSpec[] = [
    {
      name: "English Foundations", // reuses the class created above
      description: "Reading, writing, and conversation — built one lesson at a time.",
      ownerId: teacher.id,
      enroll: "ACTIVE",
      lessons: [],
      assignments: [
        { title: "Reading response — Ch. 1", dueOffset: -49, grade: "A-" },
        { title: "Daily routine paragraph", dueOffset: -21, grade: "90%" },
        { title: "Vocabulary quiz 2", dueOffset: -7, grade: "88" },
        { title: "Reflection journal", dueOffset: -1 },
        { title: "Essay: my village", dueOffset: 3 },
      ],
    },
    {
      name: "Mathematics",
      description: "Numbers, patterns, and problem solving — step by step.",
      ownerId: teacher.id,
      enroll: "ACTIVE",
      lessons: ["Place value", "Fractions", "Word problems"],
      assignments: [
        { title: "Times tables quiz", dueOffset: -56, grade: "92" },
        { title: "Fractions worksheet", dueOffset: -35, grade: "B+" },
        { title: "Word problems set 1", dueOffset: -14, grade: "95" },
        { title: "Decimals practice", dueOffset: -4, grade: "A" },
        { title: "Long division drills", dueOffset: 0 },
        { title: "Chapter 5 review", dueOffset: 5 },
      ],
    },
    {
      name: "General Science",
      description: "How the world works — observe, question, experiment.",
      ownerId: teacher.id,
      enroll: "ACTIVE",
      lessons: ["The water cycle", "Plants", "Forces"],
      assignments: [
        { title: "Water cycle diagram", dueOffset: -42, grade: "85" },
        { title: "Plant growth report", dueOffset: -19, grade: "A-", late: true },
        { title: "Forces worksheet", dueOffset: -6, grade: "93" },
        { title: "Lab safety quiz", dueOffset: 2 },
      ],
    },
    {
      name: "Geography",
      description: "Maps, regions, and the climate of Myanmar and beyond.",
      ownerId: teacher2.id,
      enroll: "ACTIVE",
      lessons: ["Maps & directions", "Myanmar regions"],
      assignments: [
        { title: "Map reading task", dueOffset: -30, grade: "78" },
        { title: "Regions quiz", dueOffset: -10, grade: "B" },
        { title: "Climate poster", dueOffset: 4 },
      ],
    },
    {
      name: "Art Club",
      description: "Colour, line, and imagination — an after-school studio.",
      ownerId: teacher2.id,
      enroll: "PENDING",
      lessons: ["Colour theory"],
      assignments: [],
    },
  ];

  for (const c of catalog) {
    let cls = await prisma.class.findFirst({
      where: { ownerId: c.ownerId, name: c.name },
      select: { id: true },
    });
    if (!cls) {
      cls = await prisma.class.create({
        data: { ownerId: c.ownerId, name: c.name, description: c.description },
        select: { id: true },
      });
    }

    // Owner is an active TEACHER member; student enrolls per the spec.
    await prisma.classMembership.upsert({
      where: { userId_classId: { userId: c.ownerId, classId: cls.id } },
      update: { role: "TEACHER", status: "ACTIVE" },
      create: { userId: c.ownerId, classId: cls.id, role: "TEACHER", status: "ACTIVE" },
    });
    await prisma.classMembership.upsert({
      where: { userId_classId: { userId: student.id, classId: cls.id } },
      update: { role: "STUDENT", status: c.enroll },
      create: { userId: student.id, classId: cls.id, role: "STUDENT", status: c.enroll },
    });

    // Published lessons (idempotent on classId + title).
    for (let i = 0; i < c.lessons.length; i++) {
      const title = c.lessons[i];
      const existing = await prisma.lesson.findFirst({
        where: { classId: cls.id, title },
        select: { id: true },
      });
      if (!existing) {
        await prisma.lesson.create({
          data: { classId: cls.id, title, content: `## ${title}\n\nNotes and practice.`, order: i, published: true },
        });
      }
    }

    // Published assignments + the student's graded submissions.
    for (const a of c.assignments) {
      const dueAt = new Date(Date.now() + a.dueOffset * DAY);
      let asg = await prisma.assignment.findFirst({
        where: { classId: cls.id, title: a.title },
        select: { id: true },
      });
      if (!asg) {
        asg = await prisma.assignment.create({
          data: {
            classId: cls.id,
            authorId: c.ownerId,
            title: a.title,
            instructions: "Complete the task and submit your work.",
            dueAt,
            status: "PUBLISHED",
          },
          select: { id: true },
        });
      }
      if (a.grade && c.enroll === "ACTIVE") {
        const submittedAt = new Date(dueAt.getTime() + (a.late ? 2 * DAY : -1 * DAY));
        const gradedAt = new Date(dueAt.getTime() + DAY);
        await prisma.submission.upsert({
          where: { assignmentId_studentId: { assignmentId: asg.id, studentId: student.id } },
          update: { status: "RETURNED", grade: a.grade, submittedAt, gradedAt },
          create: {
            assignmentId: asg.id,
            studentId: student.id,
            content: "My completed work.",
            status: "RETURNED",
            grade: a.grade,
            submittedAt,
            gradedAt,
          },
        });
      }
    }
  }

  // Inbox messages from teachers (idempotent on sender + recipient + subject).
  const mails: { from: { id: string }; subject: string; body: string; offset: number; unread: boolean }[] = [
    { from: teacher, subject: "Nice work on decimals practice", body: "Your decimals practice was excellent — full marks. Keep showing your steps!", offset: -0.3, unread: true },
    { from: teacher, subject: "Long division drills due today", body: "Quick reminder that the long division drills are due today. Message me if you get stuck.", offset: -1, unread: true },
    { from: teacher2, subject: "Welcome to Art Club", body: "Thanks for requesting to join Art Club — I'll approve you before our first session on colour theory.", offset: -2, unread: false },
    { from: teacher2, subject: "Geography: climate poster tips", body: "For the climate poster, compare two regions and include a simple rainfall chart.", offset: -4, unread: false },
    { from: teacher, subject: "Reading response — feedback", body: "Lovely reading response. Watch your past-tense endings and you'll be at an A.", offset: -7, unread: false },
  ];
  for (const m of mails) {
    const existing = await prisma.message.findFirst({
      where: { senderId: m.from.id, recipientId: student.id, subject: m.subject },
      select: { id: true },
    });
    if (!existing) {
      await prisma.message.create({
        data: {
          senderId: m.from.id,
          recipientId: student.id,
          subject: m.subject,
          body: m.body,
          createdAt: new Date(Date.now() + m.offset * DAY),
          readAt: m.unread ? null : new Date(),
        },
      });
    }
  }

  // ============================================================
  // Teacher cohort — enrolls a class of demo students in the main
  // teacher's classes so the redesigned teacher dashboard has real
  // data to chart: graded history with varied grades (mastery
  // distribution + support/stretch flags), a few ungraded
  // submissions (a real grading queue), pending join requests, and
  // inbox messages addressed to the teacher. Each student joins one
  // section (round-robin). Idempotent + additive.
  // ============================================================
  const teacherClasses = await prisma.class.findMany({
    where: { ownerId: teacher.id },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      assignments: {
        where: { status: "PUBLISHED" },
        orderBy: { dueAt: "asc" },
        select: { id: true, title: true, dueAt: true },
      },
    },
  });

  const clampPct = (n: number) => Math.max(35, Math.min(100, Math.round(n)));

  // band = each student's target mastery; grades jitter ±5 around it. Each
  // student is pinned to one section by name (stable across reseeds — no index
  // drift if the class set changes).
  const cohort = [
    { slug: "hnin", name: "Hnin Wai", band: 93, className: "Mathematics" },
    { slug: "kyaw", name: "Kyaw Zin Oo", band: 96, className: "Mathematics" },
    { slug: "nanda", name: "Nanda Aung", band: 56, className: "Mathematics" },
    { slug: "sulatt", name: "Su Latt", band: 85, className: "English Foundations" },
    { slug: "eimon", name: "Ei Mon", band: 74, className: "English Foundations" },
    { slug: "thiri", name: "Thiri Kyaw", band: 48, className: "English Foundations" },
    { slug: "minthant", name: "Min Thant", band: 79, className: "General Science" },
    { slug: "zawlin", name: "Zaw Lin", band: 67, className: "General Science" },
  ];

  const cohortUsers = new Map<string, string>();
  for (const s of cohort) {
    const u = await prisma.user.upsert({
      where: { email: `student.${s.slug}@thadar.com` },
      update: {},
      create: {
        email: `student.${s.slug}@thadar.com`,
        name: s.name,
        passwordHash,
        defaultView: "STUDENT",
        emailVerified: true,
      },
      select: { id: true },
    });
    cohortUsers.set(s.slug, u.id);
  }

  if (teacherClasses.length > 0) {
    for (let si = 0; si < cohort.length; si++) {
      const uid = cohortUsers.get(cohort[si].slug)!;
      const cls = teacherClasses.find((c) => c.name === cohort[si].className) ?? teacherClasses[si % teacherClasses.length];
      await prisma.classMembership.upsert({
        where: { userId_classId: { userId: uid, classId: cls.id } },
        update: { role: "STUDENT", status: "ACTIVE" },
        create: { userId: uid, classId: cls.id, role: "STUDENT", status: "ACTIVE" },
      });

      for (let ai = 0; ai < cls.assignments.length; ai++) {
        const a = cls.assignments[ai];
        if (!a.dueAt) continue;
        const offset = Math.round((a.dueAt.getTime() - Date.now()) / DAY);
        const late = (si + ai) % 5 === 0;
        if (offset <= -3) {
          // graded history → RETURNED with a grade near the student's band
          const grade = String(clampPct(cohort[si].band + (((si * 7 + ai * 13) % 11) - 5)));
          const submittedAt = new Date(a.dueAt.getTime() + (late ? 2 * DAY : -(1 + (ai % 2)) * DAY));
          const gradedAt = new Date(a.dueAt.getTime() + (1 + (si % 3)) * DAY);
          await prisma.submission.upsert({
            where: { assignmentId_studentId: { assignmentId: a.id, studentId: uid } },
            update: { status: "RETURNED", grade, submittedAt, gradedAt },
            create: { assignmentId: a.id, studentId: uid, content: "My completed work.", status: "RETURNED", grade, submittedAt, gradedAt },
          });
        } else if (offset <= 2 && (si + ai) % 3 !== 0) {
          // recent/open → SUBMITTED, awaiting a grade (feeds the grading queue)
          const submittedAt = new Date(Math.min(Date.now(), a.dueAt.getTime()) - (ai % 2) * DAY);
          await prisma.submission.upsert({
            where: { assignmentId_studentId: { assignmentId: a.id, studentId: uid } },
            update: { status: "SUBMITTED", grade: null, gradedAt: null, submittedAt },
            create: { assignmentId: a.id, studentId: uid, content: "Submitted for review.", status: "SUBMITTED", submittedAt },
          });
        }
      }
    }
  }

  // Pending join requests (teacher's approvals queue).
  const pendingStudents = [
    { slug: "ayechan", name: "Aye Chan", className: "Mathematics" },
    { slug: "bonaing", name: "Bo Bo Naing", className: "English Foundations" },
  ];
  for (const p of pendingStudents) {
    const u = await prisma.user.upsert({
      where: { email: `student.${p.slug}@thadar.com` },
      update: {},
      create: { email: `student.${p.slug}@thadar.com`, name: p.name, passwordHash, defaultView: "STUDENT", emailVerified: true },
      select: { id: true },
    });
    const cls = teacherClasses.find((c) => c.name === p.className) ?? teacherClasses[0];
    if (cls) {
      await prisma.classMembership.upsert({
        where: { userId_classId: { userId: u.id, classId: cls.id } },
        update: { role: "STUDENT", status: "PENDING" },
        create: { userId: u.id, classId: cls.id, role: "STUDENT", status: "PENDING" },
      });
    }
  }

  // Inbox messages addressed to the teacher (idempotent on sender + recipient + subject).
  const teacherMail: { fromId: string; subject: string; body: string; offset: number; unread: boolean }[] = [
    { fromId: cohortUsers.get("nanda")!, subject: "Help with fractions?", body: "Hi Daw Hla — I'm stuck on the fractions worksheet, question 4. Could you explain it again before the next class?", offset: -0.2, unread: true },
    { fromId: cohortUsers.get("thiri")!, subject: "My reflection will be late", body: "I wasn't well this week, so my reflection journal will be a day late. Thank you for understanding.", offset: -0.8, unread: true },
    { fromId: teacher2.id, subject: "Department meeting Friday", body: "Still on for Friday's department meeting? I'll bring the assessment plan to review together.", offset: -1.5, unread: false },
    { fromId: cohortUsers.get("kyaw")!, subject: "Bonus problem?", body: "Can I try the bonus problem on the Chapter 5 review for extra credit?", offset: -3, unread: false },
  ];
  for (const m of teacherMail) {
    const existing = await prisma.message.findFirst({
      where: { senderId: m.fromId, recipientId: teacher.id, subject: m.subject },
      select: { id: true },
    });
    if (!existing) {
      await prisma.message.create({
        data: {
          senderId: m.fromId,
          recipientId: teacher.id,
          subject: m.subject,
          body: m.body,
          createdAt: new Date(Date.now() + m.offset * DAY),
          readAt: m.unread ? null : new Date(),
        },
      });
    }
  }

  // Flag one unresolved message so the admin content-moderation queue has a
  // real item to action on a fresh seed.
  const toFlag = await prisma.message.findFirst({
    where: { recipientId: teacher.id, flagged: false, resolvedAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (toFlag) {
    await prisma.message.update({
      where: { id: toFlag.id },
      data: { flagged: true, flagReason: "auto-filter" },
    });
  }

  console.log("Seed complete:");
  console.log(`  admin    admin@thadar.com / ${PASSWORD}  (super admin · admin.thadar.com)`);
  console.log(`  teacher  teacher@thadar.com / ${PASSWORD}`);
  console.log(`  teacher  teacher2@thadar.com / ${PASSWORD}`);
  console.log(`  student  student@thadar.com / ${PASSWORD}`);
  console.log(`  class    "${klass.name}"  invite code: ${INVITE_CODE}`);
  console.log(`  classes  ${catalog.length + 1} total for the student (incl. 1 pending)`);
  console.log(`  lessons  ${lessons.length} in English (3 published, 1 draft) + extras`);
  console.log(`  cohort   ${cohort.length} demo students + ${pendingStudents.length} pending across the teacher's classes`);
  console.log(`  data     graded history, grading queue + inbox for populated student & teacher dashboards`);
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
