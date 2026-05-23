import DocsClient from "@/app/docs/ui";

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        Upload documents or place files into <code className="font-mono">docs/</code>, then scan to index.
      </p>

      <DocsClient />
    </main>
  );
}

