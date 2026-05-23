"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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

export default function DocsClient() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<DocsStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
   const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
   const [isDragging, setIsDragging] = useState(false);

  const docsDirLabel = useMemo(() => status?.docsDir || "docs/", [status?.docsDir]);
  const indexedAt = status?.index?.createdAt ? new Date(status.index.createdAt).toLocaleString() : null;

  async function refresh() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/docs/status", { cache: "no-store" });
      const json = (await res.json()) as DocsStatus;
      setStatus(json);
    } catch {
      setError("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }

  async function uploadSelected() {
    setMessage(null);
    setError(null);
    const filesToUpload =
      selectedFiles.length > 0
        ? selectedFiles
        : fileInputRef.current?.files
        ? Array.from(fileInputRef.current.files)
        : [];

    if (!filesToUpload.length) {
      setError("Choose one or more files first.");
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      filesToUpload.forEach((f) => fd.append("files", f));

      const res = await fetch("/api/docs/upload", { method: "POST", body: fd });
      const json = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok) {
        setError(json?.error || "Upload failed.");
        return;
      }

      setMessage("Upload complete. Scan to index the new files.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSelectedFiles([]);
      await refresh();
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function scan() {
    setMessage(null);
    setError(null);
    setScanning(true);
    try {
      const res = await fetch("/api/docs/scan", { method: "POST" });
      if (!res.ok) {
        setError("Scan failed.");
        return;
      }
      setMessage("Scan complete. You can now ask questions.");
      await refresh();
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
        <h2 className="text-base font-semibold">Upload files</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          Supported: <code className="font-mono">.txt</code>, <code className="font-mono">.md</code>,{" "}
          <code className="font-mono">.pdf</code>. Files are saved into <code className="font-mono">{docsDirLabel}</code>.
        </p>

        <div className="mt-4 space-y-3">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
                /\.txt$|\.md$|\.pdf$/i.test(f.name),
              );
              if (!droppedFiles.length) {
                setError("Only .txt, .md, and .pdf files are supported.");
                return;
              }
              setSelectedFiles(droppedFiles);
            }}
            className={
              "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center text-sm transition " +
              (isDragging
                ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900/40"
                : "border-zinc-300 hover:border-zinc-500 dark:border-zinc-700 dark:hover:border-zinc-400")
            }
          >
            <p className="font-medium text-zinc-800 dark:text-zinc-100">
              Drag & drop files here
            </p>
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Or click below to choose files from your computer.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".txt,.md,.pdf"
            onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              setSelectedFiles(files);
            }}
            className="block w-full text-sm text-zinc-700 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-zinc-900 hover:file:bg-zinc-200 dark:text-zinc-200 dark:file:bg-zinc-900 dark:file:text-zinc-50 dark:hover:file:bg-zinc-800"
          />

          {selectedFiles.length > 0 ? (
            <div className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200">
              <div className="font-medium">Selected files ({selectedFiles.length}):</div>
              <ul className="mt-1 max-h-28 overflow-auto">
                {selectedFiles.map((f) => (
                  <li key={f.name} className="truncate">
                    {f.name}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void uploadSelected()}
            disabled={uploading}
            className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-black disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
          <button
            type="button"
            onClick={() => void scan()}
            disabled={scanning}
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            {scanning ? "Scanning…" : "Scan & index"}
          </button>
        </div>

        {message ? (
          <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-900 dark:bg-zinc-950">
        <h2 className="text-base font-semibold">Detected documents</h2>

        <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-900 dark:bg-black">
          {loading ? (
            <div className="text-zinc-600 dark:text-zinc-300">Loading…</div>
          ) : (
            <div className="grid gap-2">
              <div className="text-zinc-700 dark:text-zinc-200">
                <span className="font-medium">Docs folder:</span>{" "}
                <code className="font-mono">{docsDirLabel}</code>
              </div>
              <div className="text-zinc-700 dark:text-zinc-200">
                <span className="font-medium">Files:</span> {status?.docs.length ?? 0}
              </div>
              <div className="text-zinc-700 dark:text-zinc-200">
                <span className="font-medium">Indexed:</span> {status?.index ? "Yes" : "No"}
              </div>
              {indexedAt ? (
                <div className="text-zinc-700 dark:text-zinc-200">
                  <span className="font-medium">Last indexed:</span> {indexedAt}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div className="mt-4 max-h-[360px] overflow-auto rounded-xl border border-zinc-200 dark:border-zinc-900">
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-900">
            {(status?.docs ?? []).map((d) => (
              <li key={d.path} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{d.path}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{d.ext}</div>
                </div>
              </li>
            ))}
            {status && status.docs.length === 0 ? (
              <li className="px-4 py-6 text-sm text-zinc-600 dark:text-zinc-300">
                No documents found yet.
              </li>
            ) : null}
          </ul>
        </div>

        <button
          type="button"
          onClick={() => void refresh()}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          Refresh list
        </button>
      </section>
    </div>
  );
}

