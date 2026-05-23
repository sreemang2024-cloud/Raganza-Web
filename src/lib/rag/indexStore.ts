import fs from "node:fs/promises";
import path from "node:path";

import { tokenize, termFreq } from "@/lib/rag/tokenize";
import type { TextChunk } from "@/lib/rag/scan";

export type IndexedChunk = {
  id: string;
  docPath: string;
  text: string;
  tf: Record<string, number>;
  len: number;
};

export type RagIndexV1 = {
  version: 1;
  createdAt: string;
  docsDir: string;
  totalDocs: number;
  totalChunks: number;
  avgLen: number;
  df: Record<string, number>;
  chunks: IndexedChunk[];
};

export function indexPath(): string {
  return path.join(process.cwd(), ".raganza", "rag-index.v1.json");
}

export async function buildIndex(params: {
  docsDir: string;
  totalDocs: number;
  chunks: TextChunk[];
}): Promise<RagIndexV1> {
  const df: Record<string, number> = {};
  const chunks: IndexedChunk[] = [];
  let sumLen = 0;

  for (const c of params.chunks) {
    const tokens = tokenize(c.text);
    const tf = termFreq(tokens);
    const unique = new Set(Object.keys(tf));
    for (const t of unique) df[t] = (df[t] ?? 0) + 1;
    const len = tokens.length;
    sumLen += len;
    chunks.push({ id: c.id, docPath: c.docPath, text: c.text, tf, len });
  }

  const avgLen = chunks.length ? sumLen / chunks.length : 0;

  return {
    version: 1,
    createdAt: new Date().toISOString(),
    docsDir: params.docsDir,
    totalDocs: params.totalDocs,
    totalChunks: chunks.length,
    avgLen,
    df,
    chunks,
  };
}

export async function saveIndex(index: RagIndexV1): Promise<void> {
  const dir = path.dirname(indexPath());
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(indexPath(), JSON.stringify(index, null, 2), "utf8");
}

export async function loadIndex(): Promise<RagIndexV1 | null> {
  try {
    const raw = await fs.readFile(indexPath(), "utf8");
    const parsed = JSON.parse(raw) as RagIndexV1;
    if (parsed?.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

