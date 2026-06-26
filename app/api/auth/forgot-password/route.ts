import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/server/db";
import { sendEmail, emailLayout, esc } from "@/server/email";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email().toLowerCase().max(200),
});

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

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

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Invalid input" },
      { status: 400 },
    );
  }

  const { email } = parsed.data;

  // Always return the same response regardless of whether the email exists,
  // so this endpoint cannot be used to enumerate registered addresses.
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return NextResponse.json<ApiResponse<{ sent: boolean }>>(
      { success: true, data: { sent: false } },
    );
  }

  // Delete any existing tokens for this user before creating a new one.
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const baseUrl = process.env.AUTH_URL ?? "https://thadar.com";
  const resetUrl = `${baseUrl}/reset-password?token=${rawToken}`;

  await sendEmail({
    to: email,
    subject: "Reset your Thadar password",
    from: "support",
    html: emailLayout({
      heading: "Reset your password",
      body: `<p>Hi ${esc(user.name ?? "there")},</p>
<p>We received a request to reset the password for your Thadar account (<strong>${esc(email)}</strong>).</p>
<p>Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
<p style="margin-top:20px;font-size:13px;color:#6f6c66">If you didn't request this, you can safely ignore this email — your password won't change.</p>`,
      cta: { label: "Reset password", url: resetUrl },
    }),
    text: `Reset your Thadar password\n\nHi ${user.name ?? "there"},\n\nOpen this link to set a new password (expires in 1 hour):\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
  });

  return NextResponse.json<ApiResponse<{ sent: boolean }>>(
    { success: true, data: { sent: true } },
  );
}
