"use client";

import { useState } from "react";
import Link from "next/link";
import { useStudio } from "@/lib/store";
import { buildShareUrl } from "@/lib/share";

export function Toolbar({
  onToggleRequirements,
  requirementsOpen,
}: {
  onToggleRequirements: () => void;
  requirementsOpen: boolean;
}) {
  const title = useStudio((s) => s.title);
  const setTitle = useStudio((s) => s.setTitle);
  const toSnapshot = useStudio((s) => s.toSnapshot);
  const reset = useStudio((s) => s.reset);
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = buildShareUrl(toSnapshot());
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard may be blocked; still update the address bar
    }
    window.history.replaceState(null, "", url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <header className="flex items-center gap-3 border-b border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-sm font-bold text-white">
          ◈
        </span>
        <span className="hidden text-sm font-semibold tracking-wide text-zinc-800 sm:inline dark:text-zinc-100">
          SOFT-ARCH
        </span>
      </div>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-medium text-zinc-800 outline-none hover:border-zinc-200 focus:border-zinc-300 dark:text-zinc-100 dark:hover:border-zinc-700"
        aria-label="Project title"
      />
      <button
        onClick={onToggleRequirements}
        className="rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        {requirementsOpen ? "Hide" : "Show"} requirements
      </button>
      <Link
        href="/summary"
        title="Your captured history & summary"
        className="rounded-md px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
      >
        Summary
      </Link>
      <button
        onClick={() => {
          if (confirm("Clear the current design and start over?")) reset();
        }}
        className="rounded-md border border-zinc-200 px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        New
      </button>
      <button
        onClick={share}
        className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-700 dark:bg-zinc-200 dark:text-zinc-900 dark:hover:bg-white"
      >
        {copied ? "Link copied!" : "Share"}
      </button>
    </header>
  );
}
