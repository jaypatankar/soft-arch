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
      <a
        href="https://github.com/jaypatankar/soft-arch"
        target="_blank"
        rel="noopener noreferrer"
        title="View source on GitHub"
        aria-label="GitHub repository"
        className="rounded-md p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
        </svg>
      </a>
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
