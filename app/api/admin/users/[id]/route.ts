import { z } from "zod";
import { ok, fail, requireAdmin, readJson } from "@/server/api";
import { setUserStatus, setTeacherStatus, setPlatformRole, deleteUser } from "@/server/admin";

export const runtime = "nodejs";

const patchSchema = z.discriminatedUnion("op", [
  z.object({ op: z.literal("status"), value: z.enum(["ACTIVE", "PENDING", "SUSPENDED"]) }),
  z.object({ op: z.literal("teacher"), value: z.enum(["UNVERIFIED", "PENDING", "VERIFIED"]) }),
  z.object({ op: z.literal("role"), value: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]) }),
]);

/** Admin control over a single account: status, teacher verification, role. */
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  const { id } = await params;

  const body = await readJson(req);
  if (body === undefined) return fail("Invalid JSON body");
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return fail("Invalid request");

  try {
    if (parsed.data.op === "status") {
      await setUserStatus(gate.userId, id, parsed.data.value);
    } else if (parsed.data.op === "teacher") {
      await setTeacherStatus(gate.userId, id, parsed.data.value);
    } else {
      // Only a super admin may grant or revoke platform roles.
      if (gate.role !== "SUPER_ADMIN") return fail("Forbidden", 403);
      await setPlatformRole(gate.userId, id, parsed.data.value);
    }
    return ok({ id });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Action failed");
  }
}

/** Permanently delete an account (super admin only). */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.response;
  if (gate.role !== "SUPER_ADMIN") return fail("Forbidden", 403);
  const { id } = await params;
  try {
    await deleteUser(gate.userId, id);
    return ok({ id });
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Delete failed");
  }
}
