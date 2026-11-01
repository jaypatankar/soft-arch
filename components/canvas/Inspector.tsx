"use client";

import { useStudio } from "@/lib/store";
import { NODE_KINDS, NODE_CATALOG } from "@/lib/nodeCatalog";
import type { NodeKind } from "@/lib/types";

const fieldClass =
  "w-full rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";
const labelClass = "mb-1 block text-[11px] font-medium uppercase tracking-wide text-zinc-400";

export function Inspector() {
  const selectedNodeId = useStudio((s) => s.selectedNodeId);
  const selectedEdgeId = useStudio((s) => s.selectedEdgeId);
  const node = useStudio((s) => s.nodes.find((n) => n.id === s.selectedNodeId));
  const edge = useStudio((s) => s.edges.find((e) => e.id === s.selectedEdgeId));
  const updateNodeData = useStudio((s) => s.updateNodeData);
  const removeNode = useStudio((s) => s.removeNode);
  const updateEdgeLabel = useStudio((s) => s.updateEdgeLabel);
  const removeEdge = useStudio((s) => s.removeEdge);

  if (selectedNodeId && node) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Node</h3>
          <button
            onClick={() => removeNode(node.id)}
            className="rounded px-2 py-0.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
          >
            Delete
          </button>
        </div>
        <div>
          <label className={labelClass}>Label</label>
          <input
            className={fieldClass}
            value={node.data.label}
            onChange={(e) => updateNodeData(node.id, { label: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Kind</label>
          <select
            className={fieldClass}
            value={node.data.kind}
            onChange={(e) => updateNodeData(node.id, { kind: e.target.value as NodeKind })}
          >
            {NODE_KINDS.map((k) => (
              <option key={k} value={k}>
                {NODE_CATALOG[k].label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Technology</label>
          <input
            className={fieldClass}
            placeholder="e.g. Postgres, Redis, Kafka"
            value={node.data.tech ?? ""}
            onChange={(e) => updateNodeData(node.id, { tech: e.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            className={`${fieldClass} min-h-[70px] resize-y`}
            placeholder="Responsibilities, scaling notes…"
            value={node.data.description ?? ""}
            onChange={(e) => updateNodeData(node.id, { description: e.target.value })}
          />
        </div>
      </div>
    );
  }

  if (selectedEdgeId && edge) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Connection</h3>
          <button
            onClick={() => removeEdge(edge.id)}
            className="rounded px-2 py-0.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
          >
            Delete
          </button>
        </div>
        <div>
          <label className={labelClass}>Label</label>
          <input
            className={fieldClass}
            placeholder="e.g. reads/writes, publishes"
            value={(edge.label as string) ?? ""}
            onChange={(e) => updateEdgeLabel(edge.id, e.target.value)}
          />
        </div>
      </div>
    );
  }

  return (
    <p className="text-xs leading-relaxed text-zinc-400">
      Drag a component from the palette onto the canvas, or ask the copilot to draw one. Select a
      node or connection to edit it here.
    </p>
  );
}
