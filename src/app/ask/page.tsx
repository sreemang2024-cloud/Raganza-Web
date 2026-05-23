import AskClient from "@/app/ask/ui";

export default function AskPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Ask</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        Ask a question about the documents. The answer will be built only from retrieved snippets.
      </p>

      <AskClient />
    </main>
  );
}

