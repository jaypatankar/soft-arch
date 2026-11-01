"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { metaFor } from "@/lib/nodeCatalog";
import type { ArchNodeData } from "@/lib/types";

function ArchNodeViewImpl({ data, selected }: NodeProps) {
  const d = data as ArchNodeData;
  const meta = metaFor(d.kind);
  return (
    <div
      className="rounded-xl border bg-white px-3 py-2 shadow-sm transition dark:bg-zinc-900"
      style={{
        borderColor: selected ? meta.accent : "var(--node-border)",
        borderWidth: selected ? 2 : 1,
        minWidth: 160,
        boxShadow: selected ? `0 0 0 3px ${meta.accent}22` : undefined,
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: meta.accent }} />
      <div className="flex items-center gap-2">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-sm font-bold text-white"
          style={{ background: meta.accent }}
          aria-hidden
        >
          {meta.glyph}
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
            {d.label}
          </div>
          <div className="text-[10px] uppercase tracking-wide text-zinc-400">
            {meta.label}
            {d.tech ? ` · ${d.tech}` : ""}
          </div>
        </div>
      </div>
      {d.description ? (
        <p className="mt-1.5 line-clamp-2 text-[11px] leading-snug text-zinc-500 dark:text-zinc-400">
          {d.description}
        </p>
      ) : null}
      <Handle type="source" position={Position.Right} style={{ background: meta.accent }} />
    </div>
  );
}

export const ArchNodeView = memo(ArchNodeViewImpl);
