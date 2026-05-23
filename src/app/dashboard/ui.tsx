"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type DocsStatus = {
  docsDir: string;
  docs: Array<{ path: string; ext: string }>;
  index:
    | null
    | {
        version: number;
        createdAt: string;
        totalDocs: number;
        totalChunks: number;
      };
};

export default function DashboardClient() {
  const router = useRouter();
  const [status, setStatus] = useState<DocsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const indexed = Boolean(status?.index);

  const docsCount = status?.docs?.length ?? 0;
  const indexedAt = status?.index?.createdAt ? new Date(status.index.createdAt).toLocaleString() : null;

  const docsDirLabel = useMemo(() => status?.docsDir || "docs/", [status?.docsDir]);

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/docs/status", { cache: "no-store" });
      const json = (await res.json()) as DocsStatus;
      setStatus(json);
    } catch {
      setError("Failed to load document status.");
    } finally {
      setLoading(false);
    }
  }

  async function scan() {
    setError(null);
    setScanning(true);
    try {
      const res = await fetch("/api/docs/scan", { method: "POST" });
      if (!res.ok) {
        setError("Scan failed.");
        return;
      }
      await refresh();
      router.push("/ask");
    } catch {
      setError("Scan failed.");
    } finally {
      setScanning(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-900 dark:bg-zinc-950">
        <h2 className="text-base font-semibold">1) Documents</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Place your <code className="font-mono">.txt</code>,{" "}
          <code className="font-mono">.md</code>, and{" "}
          <code className="font-mono">.pdf</code> files in{" "}
          <code className="font-mono">{docsDirLabel}</code>.
        </p>

        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-900 dark:bg-black">
          {loading ? (
            <div className="text-zinc-600 dark:text-zinc-300">Loading…</div>
          ) : (
            <div className="grid gap-1">
              <div>
                <span className="font-medium">Found files:</span> {docsCount}
              </div>
              <div>
                <span className="font-medium">Indexed:</span>{" "}
                {indexed ? "Yes" : "No"}
              </div>
              {indexedAt ? (
                <div>
                  <span className="font-medium">Last indexed:</span> {indexedAt}
                </div>
              ) : null}
              {status?.index ? (
                <div>
                  <span className="font-medium">Chunks:</span> {status.index.totalChunks}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/docs"
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Manage documents
          </Link>
          <button
            type="button"
            onClick={() => void scan()}
            disabled={scanning}
            className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-black disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {scanning ? "Scanning…" : "Scan & index now"}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-900 dark:bg-zinc-950">
        <h2 className="text-base font-semibold">2) Ask a question</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Ask via the UI or call the API directly. Answers are generated using only
          retrieved content and always include sources.
        </p>

        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-900 dark:bg-black dark:text-zinc-200">
          <div className="font-medium">POST</div>
          <div className="mt-1 font-mono">/api/ask</div>
          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Body: {"{ \"question\": \"...\" }"}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/ask"
            className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Open Q&A
          </Link>
          <button
            type="button"
            onClick={() => void refresh()}
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Refresh status
          </button>
        </div>

        {error ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        ) : null}
      </section>
    </div>
  );
}

