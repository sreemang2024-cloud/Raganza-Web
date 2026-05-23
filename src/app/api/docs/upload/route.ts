import fs from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { resolveDocsDir } from "@/lib/rag/docsDir";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function sanitizeFilename(name: string): string {
  const base = name.replaceAll("\\", "/").split("/").pop() || "document";
  return base.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

function isAllowedExt(ext: string): boolean {
  return ext === ".txt" || ext === ".md" || ext === ".pdf";
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const files = form.getAll("files");
  if (!files.length) {
    return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
  }

  const docsDir = resolveDocsDir();
  await fs.mkdir(docsDir, { recursive: true });

  const saved: Array<{ filename: string; path: string }> = [];

  for (const f of files) {
    if (!(f instanceof File)) continue;
    const filename = sanitizeFilename(f.name);
    const ext = path.extname(filename).toLowerCase();
    if (!isAllowedExt(ext)) continue;

    let target = path.join(docsDir, filename);
    try {
      await fs.access(target);
      const stamp = new Date().toISOString().replaceAll(":", "").replaceAll(".", "");
      target = path.join(docsDir, `${path.basename(filename, ext)}_${stamp}${ext}`);
    } catch {
      // ok
    }

    const buf = Buffer.from(await f.arrayBuffer());
    await fs.writeFile(target, buf);
    saved.push({ filename: path.basename(target), path: path.relative(docsDir, target).replaceAll("\\", "/") });
  }

  if (!saved.length) {
    return NextResponse.json(
      { error: "No supported files were uploaded. Use .txt, .md, or .pdf" },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true, docsDir, saved });
}

