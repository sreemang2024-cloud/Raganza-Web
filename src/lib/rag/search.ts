import { tokenize } from "@/lib/rag/tokenize";
import type { RagIndexV1 } from "@/lib/rag/indexStore";

export type SearchHit = {
  docPath: string;
  snippet: string;
  score: number;
  chunkId: string;
};

function idf(N: number, df: number): number {
  return Math.log(1 + (N - df + 0.5) / (df + 0.5));
}

export function bm25Search(index: RagIndexV1, query: string, k = 5): SearchHit[] {
  const qTokens = tokenize(query);
  if (!qTokens.length) return [];

  const N = index.totalChunks;
  const avgLen = index.avgLen || 1;
  const k1 = 1.5;
  const b = 0.75;

  const hits: SearchHit[] = [];

  for (const ch of index.chunks) {
    if (!ch.len) continue;
    let score = 0;
    for (const t of qTokens) {
      const tf = ch.tf[t] ?? 0;
      if (!tf) continue;
      const dfi = index.df[t] ?? 0;
      if (!dfi) continue;
      const termIdf = idf(N, dfi);
      const denom = tf + k1 * (1 - b + (b * ch.len) / avgLen);
      score += termIdf * (tf * (k1 + 1)) / denom;
    }

    if (score > 0) {
      const snippet = ch.text.length > 320 ? `${ch.text.slice(0, 320).trim()}…` : ch.text;
      hits.push({ docPath: ch.docPath, snippet, score, chunkId: ch.id });
    }
  }

  hits.sort((a, b) => b.score - a.score);
  return hits.slice(0, k);
}

export function confidenceFromHits(hits: SearchHit[]): "high" | "medium" | "low" {
  const top = hits[0]?.score ?? 0;
  const second = hits[1]?.score ?? 0;

  if (top >= 10 && top >= second * 1.15) return "high";
  if (top >= 4) return "medium";
  return "low";
}

export function answerFromHits(hits: SearchHit[]): string {
  if (!hits.length) {
    return "I could not find this in the provided documents. Can you share the relevant document?";
  }

  const top = hits[0];
  const second = hits[1];

  const parts: string[] = [];
  parts.push(top.snippet);

  if (second && parts.join("\n\n").length < 500) {
    parts.push(second.snippet);
  }

  const joined = parts.join("\n\n").trim();
  return joined || "I could not find this in the provided documents. Can you share the relevant document?";
}

