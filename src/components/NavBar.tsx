import Link from "next/link";
import type { Session } from "next-auth";

import { AuthButtons } from "@/components/AuthButtons";

export function NavBar({ session }: { session: Session | null }) {
  const signedIn = Boolean(session?.user?.email);

  return (
    <header className="border-b border-zinc-200 bg-white/70 backdrop-blur dark:border-zinc-900 dark:bg-black/40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold tracking-tight">
            Raganza RAG
          </Link>
          {signedIn ? (
            <nav className="hidden items-center gap-2 sm:flex">
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-white"
              >
                Dashboard
              </Link>
              <Link
                href="/docs"
                className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-white"
              >
                Documents
              </Link>
              <Link
                href="/ask"
                className="rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-white"
              >
                Ask
              </Link>
            </nav>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {signedIn ? (
            <span className="hidden text-sm text-zinc-500 dark:text-zinc-400 sm:block">
              {session?.user?.email}
            </span>
          ) : null}
          <AuthButtons signedIn={signedIn} />
        </div>
      </div>
    </header>
  );
}

