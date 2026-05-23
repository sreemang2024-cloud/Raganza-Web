import Link from "next/link";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const signedIn = Boolean(session?.user?.email);

  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Answers with citations. No hallucinations.
          </div>
          <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Ask questions from your policies, FAQs, manuals, and SOPs.
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-lg leading-7 text-zinc-600 dark:text-zinc-300">
            Raganza RAG scans your <code className="font-mono">docs/</code>{" "}
            folder, retrieves the most relevant passages, and answers using only
            retrieved content—always with citations and a confidence level.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={signedIn ? "/dashboard" : "/register"}
              className="inline-flex h-11 items-center justify-center rounded-md bg-zinc-900 px-5 text-sm font-semibold text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {signedIn ? "Open dashboard" : "Get started"}
            </Link>
            <Link
              href={signedIn ? "/docs" : "/login"}
              className="inline-flex h-11 items-center justify-center rounded-md border border-zinc-200 bg-white px-5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              {signedIn ? "Manage documents" : "Sign in"}
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-900 dark:bg-zinc-950">
          <div className="grid gap-4">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-900 dark:bg-black dark:text-zinc-200">
              <div className="font-semibold">Workflow</div>
              <ol className="mt-2 list-decimal space-y-1 pl-5">
                <li>Add files to <code className="font-mono">docs/</code> (.txt, .md, .pdf)</li>
                <li>Scan & index documents</li>
                <li>Ask a question</li>
                <li>Get an answer with sources + confidence</li>
              </ol>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-900">
                <div className="text-sm font-semibold">Strict grounding</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  The answer is built only from retrieved snippets.
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-900">
                <div className="text-sm font-semibold">Citations</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  Every result returns document + snippet + score.
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-900">
                <div className="text-sm font-semibold">API-first</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  Ask via POST; the UI is just a friendly wrapper.
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-900">
                <div className="text-sm font-semibold">Not found policy</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  If missing, it prompts for the relevant document.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
