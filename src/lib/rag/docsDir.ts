import fs from "node:fs";
import path from "node:path";

export function resolveDocsDir(): string {
  const candidates = [
    path.join(process.cwd(), "docs"),
    path.join(process.cwd(), "..", "docs"),
  ];

  for (const p of candidates) {
    try {
      if (fs.existsSync(p) && fs.statSync(p).isDirectory()) return p;
    } catch {
      // ignore
    }
  }

  return candidates[0];
}

