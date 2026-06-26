export type ApiResponse<T> = { success: true; data: T } | { success: false; error: string };

export type ClassDetail = {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string | null;
  inviteCodeEnabled: boolean;
  createdAt: string;
  _count: { memberships: number };
};

export type Member = { id: string; status: string; joinedAt: string; user: { id: string; name: string | null; email: string } };

export type Lesson = { id: string; title: string; content: string; videoUrl: string; order: number; published: boolean; _count: { views: number } };

export type TAssignment = { id: string; title: string; instructions: string; dueAt: string | null; status: string; _count: { submissions: number } };

export type SubRow = { id: string; content: string; status: string; grade: string | null; feedback: string | null; submittedAt: string; student: { id: string; name: string | null; email: string } };

export type GradebookSub = { assignmentId: string; status: string; grade: string | null };
export type GradebookRow = { id: string; name: string | null; email: string; lessonsViewed: number; submissions: GradebookSub[] };
export type Gradebook = { totalLessons: number; assignments: { id: string; title: string }[]; students: GradebookRow[] };
