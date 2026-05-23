import fs from "node:fs/promises";
import path from "node:path";

import { resolveDocsDir } from "@/lib/rag/docsDir";

export type SourceDoc = {
  absolutePath: string;
  relativePath: string;
  ext: ".txt" | ".md" | ".pdf";
};

export type TextChunk = {
  id: string;
  docPath: string;
  text: string;
};

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walk(p)));
    } else if (e.isFile()) {
      out.push(p);
    }
  }
  return out;
}

function isAllowedExt(ext: string): ext is SourceDoc["ext"] {
  return ext === ".txt" || ext === ".md" || ext === ".pdf";
}

export async function listDocs(): Promise<{ docsDir: string; docs: SourceDoc[] }> {
  const docsDir = resolveDocsDir();
  await fs.mkdir(docsDir, { recursive: true });

  const files = await walk(docsDir);
  const docs: SourceDoc[] = [];

  for (const abs of files) {
    const ext = path.extname(abs).toLowerCase();
    if (!isAllowedExt(ext)) continue;
    docs.push({
      absolutePath: abs,
      relativePath: path.relative(docsDir, abs).replaceAll("\\", "/"),
      ext,
    });
  }

  docs.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  return { docsDir, docs };
}

async function readPdfText(filePath: string): Promise<string> {
  const buf = await fs.readFile(filePath);
  const mod = await import("pdf-parse");
  const modRecord = mod as unknown as Record<string, unknown>;
  const candidate = ("default" in modRecord ? modRecord.default : null) ?? modRecord;
  const fn =
    typeof candidate === "function"
      ? (candidate as (b: Buffer) => Promise<{ text: string }>)
      : (typeof modRecord.pdfParse === "function"
          ? (modRecord.pdfParse as (b: Buffer) => Promise<{ text: string }>)
          : null);
  if (!fn) return "";
  const data = await fn(Buffer.from(buf));
  return data.text || "";
}

async function readDocText(doc: SourceDoc): Promise<string> {
  if (doc.ext === ".pdf") return readPdfText(doc.absolutePath);
  const raw = await fs.readFile(doc.absolutePath, "utf8");
  return raw;
}

function normalizeText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function chunkText(docPath: string, text: string): TextChunk[] {
  const paragraphs = text.split(/\n\s*\n/g).map((p) => p.trim()).filter(Boolean);
  const chunks: TextChunk[] = [];

  let buf = "";
  let idx = 0;

  function pushChunk(t: string) {
    const cleaned = t.trim();
    if (!cleaned) return;
    chunks.push({
      id: `${docPath}#${idx++}`,
      docPath,
      text: cleaned,
    });
  }

  for (const para of paragraphs) {
    if (!buf) {
      buf = para;
      continue;
    }

    if ((buf.length + 2 + para.length) <= 1200) {
      buf = `${buf}\n\n${para}`;
      continue;
    }

    pushChunk(buf);
    buf = para;
  }

  pushChunk(buf);

  // Fallback for very short docs
  if (chunks.length === 0 && text.trim()) {
    pushChunk(text);
  }

  return chunks;
}

export async function scanAllDocs(): Promise<{ docsDir: string; docs: SourceDoc[]; chunks: TextChunk[] }> {
  const { docsDir, docs } = await listDocs();
  const chunks: TextChunk[] = [];

  for (const doc of docs) {
    const raw = await readDocText(doc);
    const normalized = normalizeText(raw);
    if (!normalized) continue;
    chunks.push(...chunkText(doc.relativePath, normalized));
  }

  return { docsDir, docs, chunks };
}

