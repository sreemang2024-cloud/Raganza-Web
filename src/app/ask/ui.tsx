"use client";

import Link from "next/link";
import { useState } from "react";

type AskResponse = {
  answer: string;
  sources: Array<{ document: string; snippet: string; score: number }>;
  confidence: "high" | "medium" | "low";
};

function errorFromJson(x: unknown): string | null {
  if (!x || typeof x !== "object") return null;
  const rec = x as Record<string, unknown>;
  return typeof rec.error === "string" ? rec.error : null;
}

const NOT_FOUND =
  "I could not find this in the provided documents. Can you share the relevant document?";

export default function AskClient() {
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskResponse | null>(null);

  async function ask() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const json = (await res.json().catch(() => null)) as AskResponse | { error?: string } | null;
      if (!res.ok) {
        setError(errorFromJson(json) || "Request failed.");
        return;
      }
      setResult(json as AskResponse);
    } catch {
      setError("Request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const isNotFound = result?.answer === NOT_FOUND;

  return (
    <div className="mt-8 grid gap-6">
      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-900 dark:bg-zinc-950">
        <label className="block text-sm font-medium">Question</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={4}
          placeholder="e.g. What is the refund policy for damaged items?"
          className="mt-2 w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-900 dark:bg-black dark:focus:ring-zinc-700"
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void ask()}
            disabled={submitting || !question.trim()}
            className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-black disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {submitting ? "Asking…" : "Ask"}
          </button>
          <Link
            href="/docs"
            className="inline-flex h-10 items-center justify-center rounded-md border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Add/scan documents
          </Link>
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        ) : null}
      </section>

      {result ? (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-900 dark:bg-zinc-950">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Answer</h2>
            <div className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-900 dark:bg-black dark:text-zinc-200">
              Confidence: {result.confidence}
            </div>
          </div>

          <div
            className={
              "mt-4 rounded-xl border px-4 py-3 text-sm leading-6 " +
              (isNotFound
                ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100"
                : "border-zinc-200 bg-zinc-50 text-zinc-900 dark:border-zinc-900 dark:bg-black dark:text-zinc-50")
            }
          >
            {result.answer}
          </div>

          <h3 className="mt-6 text-sm font-semibold">Sources</h3>
          {result.sources.length ? (
            <ul className="mt-3 grid gap-3">
              {result.sources.map((s, i) => (
                <li
                  key={`${s.document}-${i}`}
                  className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-900 dark:bg-zinc-950"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium">{s.document}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      score: {s.score.toFixed(3)}
                    </div>
                  </div>
                  <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-200">
                    {s.snippet}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
              No sources returned.
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}

