import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { listDocs } from "@/lib/rag/scan";
import { loadIndex } from "@/lib/rag/indexStore";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [{ docsDir, docs }, index] = await Promise.all([listDocs(), loadIndex()]);

  return NextResponse.json({
    docsDir,
    docs: docs.map((d) => ({ path: d.relativePath, ext: d.ext })),
    index: index
      ? {
          version: index.version,
          createdAt: index.createdAt,
          totalDocs: index.totalDocs,
          totalChunks: index.totalChunks,
        }
      : null,
  });
}

