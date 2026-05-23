import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";

import { loadIndex } from "@/lib/rag/indexStore";
import { answerFromHits, bm25Search, confidenceFromHits } from "@/lib/rag/search";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AskSchema = z.object({
  question: z.string().min(1),
});

const NOT_FOUND =
  "I could not find this in the provided documents. Can you share the relevant document?";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = AskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
  }

  const index = await loadIndex();
  if (!index || !index.totalChunks) {
    return NextResponse.json({
      answer: NOT_FOUND,
      sources: [],
      confidence: "low" as const,
    });
  }

  const hits = bm25Search(index, parsed.data.question, 5);
  const topScore = hits[0]?.score ?? 0;
  const MIN_FOUND_SCORE = 2.5;

  if (!hits.length || topScore < MIN_FOUND_SCORE) {
    return NextResponse.json({
      answer: NOT_FOUND,
      sources: [],
      confidence: "low" as const,
    });
  }

  return NextResponse.json({
    answer: answerFromHits(hits),
    sources: hits.map((h) => ({
      document: h.docPath,
      snippet: h.snippet,
      score: h.score,
    })),
    confidence: confidenceFromHits(hits),
  });
}

