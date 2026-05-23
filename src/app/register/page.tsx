"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error || "Registration failed.");
        return;
      }

      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/dashboard",
      });

      if (!signInRes || signInRes.error) {
        router.push("/login");
        return;
      }

      router.push(signInRes.url || "/dashboard");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-14">
      <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        This creates a local account in SQLite for this app instance.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-900 dark:bg-zinc-950"
      >
        <label className="block text-sm font-medium">
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-900 dark:bg-black dark:focus:ring-zinc-700"
          />
        </label>

        <label className="mt-4 block text-sm font-medium">
          Password (min 8 chars)
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            minLength={8}
            required
            className="mt-2 w-full rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-900 dark:bg-black dark:focus:ring-zinc-700"
          />
        </label>

        {error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-md bg-zinc-900 px-5 text-sm font-semibold text-white hover:bg-black disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {submitting ? "Creating…" : "Create account"}
        </button>

        <p className="mt-4 text-center text-sm text-zinc-600 dark:text-zinc-300">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-zinc-900 underline dark:text-white">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}

