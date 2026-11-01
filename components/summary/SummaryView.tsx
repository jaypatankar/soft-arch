"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { initPersistence, useStudio } from "@/lib/store";
import type { UserNote } from "@/lib/types";

const KIND_STYLES: Record<UserNote["kind"], string> = {
  requirement: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  assumption: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  instruction: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300",
};

export function SummaryView() {
  const title = useStudio((s) => s.title);
  const history = useStudio((s) => s.history);
  const summary = useStudio((s) => s.summary);
  const summaryUpdatedAt = useStudio((s) => s.summaryUpdatedAt);
  const setSummary = useStudio((s) => s.setSummary);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    if (!useStudio.getState().hydrated) void useStudio.getState().hydrate();
    const unsub = initPersistence();
    return () => unsub();
  }, []);

  async function updateSummary() {
    if (generating) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history: useStudio.getState().history, summary: useStudio.getState().summary }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Failed to generate summary.");
      else setSummary(data.summary ?? "");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setGenerating(false);
    }
  }

  async function ask() {
    const q = question.trim();
    if (!q || asking) return;
    setAsking(true);
    setAnswer(null);
    setError(null);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: useStudio.getState().history,
          summary: useStudio.getState().summary,
          question: q,
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Failed to answer.");
      else setAnswer(data.answer ?? "");
    } catch {
      setError("Could not reach the server.");
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">User Summary</h1>
          <p className="text-sm text-zinc-500">{title}</p>
        </div>
        <Link
          href="/studio"
          className="rounded-md border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          ← Back to studio
        </Link>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      ) : null}

      {/* Summary note */}
      <section className="mb-8 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Summary note</h2>
          <button
            onClick={updateSummary}
            disabled={generating || history.length === 0}
            className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-40 dark:bg-zinc-200 dark:text-zinc-900"
          >
            {generating ? "Updating…" : "Update Summary"}
          </button>
        </div>
        {summary ? (
          <>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-800 dark:text-zinc-100">
              {summary}
            </p>
            {summaryUpdatedAt ? (
              <p className="mt-2 text-[11px] text-zinc-400">
                Updated {new Date(summaryUpdatedAt).toLocaleString()}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-zinc-400">
            {history.length === 0
              ? "No activity captured yet. Add requirements/assumptions or chat with the copilot, and your summary will build here."
              : generating
                ? "Updating your summary…"
                : "No summary yet — click Update Summary."}
          </p>
        )}
      </section>

      {/* Ask based on summary */}
      <section className="mb-8">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">Ask about your work</h2>
        <div className="flex items-end gap-2">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask();
              }
            }}
            rows={2}
            placeholder="e.g. What assumptions have I made so far? What did I decide about the database?"
            className="flex-1 resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            onClick={ask}
            disabled={asking || !question.trim()}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-indigo-500"
          >
            {asking ? "…" : "Ask"}
          </button>
        </div>
        {answer !== null ? (
          <div className="mt-3 whitespace-pre-wrap rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
            {answer}
          </div>
        ) : null}
      </section>

      {/* Raw captured history */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Captured history · {history.length}
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-zinc-400">Nothing captured yet.</p>
        ) : (
          <ul className="space-y-1.5">
            {[...history].reverse().map((h) => (
              <li
                key={h.id}
                className="flex items-start gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase ${KIND_STYLES[h.kind]}`}>
                  {h.kind}
                </span>
                <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-200">{h.text}</span>
                <span className="shrink-0 text-[10px] text-zinc-400">
                  {new Date(h.ts).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
