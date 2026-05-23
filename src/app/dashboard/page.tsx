import { getServerSession } from "next-auth";

import DashboardClient from "@/app/dashboard/ui";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        Signed in as <span className="font-medium">{session?.user?.email}</span>
      </p>

      <DashboardClient />
    </main>
  );
}

