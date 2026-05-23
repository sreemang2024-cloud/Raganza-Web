import { NextResponse } from "next/server";
import { z } from "zod";

import { createUser, getUserByEmail } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = RegisterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const existing = getUserByEmail(parsed.data.email);
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const user = createUser(parsed.data.email, parsed.data.password);
  return NextResponse.json({ id: user.id, email: user.email });
}

