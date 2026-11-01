"use client";

import { NODE_KINDS, NODE_CATALOG } from "@/lib/nodeCatalog";
import { useStudio } from "@/lib/store";
import type { NodeKind } from "@/lib/types";

export function Palette() {
  const relayout = useStudio((s) => s.relayout);

  const onDragStart = (event: React.DragEvent, kind: NodeKind) => {
    event.dataTransfer.setData("application/archnode", kind);
    event.dataTransfer.effectAllowed = "move";
  };

  // relayout bumps fitSignal, which the canvas watches to re-fit the view.
  const tidy = () => relayout();

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        onClick={tidy}
        title="Auto-arrange the diagram"
        className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600"
      >
        ✦ Tidy
      </button>
      <span className="mx-0.5 h-5 w-px bg-zinc-200 dark:bg-zinc-700" aria-hidden />
      {NODE_KINDS.map((kind) => {
        const meta = NODE_CATALOG[kind];
        return (
          <button
            key={kind}
            draggable
            onDragStart={(e) => onDragStart(e, kind)}
            title={meta.blurb}
            className="group flex cursor-grab items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs active:cursor-grabbing hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
          >
            <span
              className="flex h-4 w-4 items-center justify-center rounded text-[10px] font-bold text-white"
              style={{ background: meta.accent }}
              aria-hidden
            >
              {meta.glyph}
            </span>
            <span className="text-zinc-700 dark:text-zinc-200">{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}
