import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { buildIndex, saveIndex } from "@/lib/rag/indexStore";
import { scanAllDocs } from "@/lib/rag/scan";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { docsDir, docs, chunks } = await scanAllDocs();
  const index = await buildIndex({ docsDir, totalDocs: docs.length, chunks });
  await saveIndex(index);

  return NextResponse.json({
    ok: true,
    createdAt: index.createdAt,
    docsDir: index.docsDir,
    totalDocs: index.totalDocs,
    totalChunks: index.totalChunks,
  });
}

