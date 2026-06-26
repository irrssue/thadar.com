/* ---------------- API shapes ---------------- */
export type SubStatus = "SUBMITTED" | "GRADED" | "RETURNED";
export type Sub = {
  studentId: string;
  status: SubStatus;
  grade: string | null;
  submittedAt: string;
  gradedAt: string | null;
};
export type Asg = {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  dueAt: string | null;
  createdAt: string;
  submissions: Sub[];
  _count: { submissions: number };
};
export type Person = { id: string; name: string | null; email: string };
export type Member = { id: string; status: string; user: Person };
export type OClass = {
  id: string;
  name: string;
  assignments: Asg[];
  students: Member[];
  pending: Member[];
  activeCount: number;
  pendingCount: number;
};
export type Totals = {
  classes: number;
  students: number;
  pending: number;
  assignments: number;
  needsGrading: number;
  toGrade: number;
  graded: number;
};
export type Overview = { totals: Totals; classes: OClass[] };
