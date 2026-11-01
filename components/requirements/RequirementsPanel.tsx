"use client";

import { useState } from "react";
import { useStudio } from "@/lib/store";
import type { RequirementItem } from "@/lib/types";

export function RequirementsPanel() {
  const requirements = useStudio((s) => s.requirements);
  const addRequirement = useStudio((s) => s.addRequirement);
  const updateRequirement = useStudio((s) => s.updateRequirement);
  const removeRequirement = useStudio((s) => s.removeRequirement);
  const queuePrompt = useStudio((s) => s.queuePrompt);
  const [draft, setDraft] = useState("");
  const [kind, setKind] = useState<RequirementItem["kind"]>("requirement");

  const reqs = requirements.filter((r) => r.kind === "requirement");
  const assumptions = requirements.filter((r) => r.kind === "assumption");

  function add() {
    const text = draft.trim();
    if (!text) return;
    addRequirement(text, kind);
    setDraft("");
  }

  function clarify() {
    queuePrompt(
      "Act as a requirements analyst for this system. Ask me the most important clarifying questions, and propose a concise list of explicit requirements and assumptions I should capture. If there's enough to go on, also note which assumptions you'd make by default.",
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Requirements</h2>
        <button
          onClick={clarify}
          className="rounded-md border border-indigo-200 px-2 py-1 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-950"
        >
          Clarify with AI
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-3">
        <Section
          title="Requirements"
          items={reqs}
          empty="No requirements yet."
          onEdit={(id, text) => updateRequirement(id, { text })}
          onRemove={removeRequirement}
        />
        <Section
          title="Assumptions"
          items={assumptions}
          empty="No assumptions yet."
          onEdit={(id, text) => updateRequirement(id, { text })}
          onRemove={removeRequirement}
        />
      </div>

      <div className="space-y-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
        <div className="flex gap-1 text-xs">
          {(["requirement", "assumption"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={
                kind === k
                  ? "rounded-md bg-zinc-800 px-2 py-1 capitalize text-white dark:bg-zinc-200 dark:text-zinc-900"
                  : "rounded-md border border-zinc-200 px-2 py-1 capitalize text-zinc-500 dark:border-zinc-700"
              }
            >
              {k}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                add();
              }
            }}
            rows={2}
            placeholder={kind === "requirement" ? "e.g. 100k concurrent users" : "e.g. reads dominate writes 10:1"}
            className="flex-1 resize-none rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            onClick={add}
            disabled={!draft.trim()}
            className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-200 dark:text-zinc-900"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  items,
  empty,
  onEdit,
  onRemove,
}: {
  title: string;
  items: RequirementItem[];
  empty: string;
  onEdit: (id: string, text: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        {title} · {items.length}
      </h3>
      {items.length === 0 ? (
        <p className="text-xs text-zinc-400">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((r) => (
            <li
              key={r.id}
              className="group flex items-start gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 py-1.5 dark:border-zinc-800 dark:bg-zinc-900"
            >
              <textarea
                value={r.text}
                onChange={(e) => onEdit(r.id, e.target.value)}
                rows={1}
                className="min-h-[20px] flex-1 resize-none bg-transparent text-xs text-zinc-700 outline-none dark:text-zinc-200"
              />
              <button
                onClick={() => onRemove(r.id)}
                className="shrink-0 text-xs text-zinc-300 opacity-0 group-hover:opacity-100 hover:text-red-500"
                aria-label="Remove"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
