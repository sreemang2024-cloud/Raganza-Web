"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function AuthButtons({ signedIn }: { signedIn: boolean }) {
  if (!signedIn) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-white"
        >
          Sign in
        </Link>
        <Link
          href="/register"
          className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Create account
        </Link>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-900 dark:hover:text-white"
    >
      Sign out
    </button>
  );
}

