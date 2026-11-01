"use client";

import { create } from "zustand";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from "@xyflow/react";
import { get as idbGet, set as idbSet } from "idb-keyval";
import { nanoid } from "nanoid";
import type {
  ArchNodeData,
  ChatMessage,
  GraphSpec,
  NodeKind,
  ProjectSnapshot,
  RequirementItem,
  UserNote,
} from "./types";
import { metaFor } from "./nodeCatalog";
import { computeLayout } from "./layout";

export type ArchNode = Node<ArchNodeData>;

const STORAGE_KEY = "soft-arch:project";

interface StudioState {
  title: string;
  nodes: ArchNode[];
  edges: Edge[];
  requirements: RequirementItem[];
  messages: ChatMessage[];
  // Durable, append-only record of everything the user assumes or instructs.
  history: UserNote[];
  // AI-distilled summary note derived from history.
  summary: string;
  summaryUpdatedAt: number | null;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  hydrated: boolean;
  // A prompt queued by another panel for the copilot to send.
  queuedPrompt: string | null;
  // Bumped whenever the layout changes, so the canvas can re-fit the view.
  fitSignal: number;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  setTitle: (title: string) => void;
  addNode: (kind: NodeKind, position: { x: number; y: number }) => void;
  updateNodeData: (id: string, patch: Partial<ArchNodeData>) => void;
  removeNode: (id: string) => void;
  updateEdgeLabel: (id: string, label: string) => void;
  removeEdge: (id: string) => void;
  selectNode: (id: string | null) => void;
  selectEdge: (id: string | null) => void;

  addRequirement: (text: string, kind: RequirementItem["kind"]) => void;
  updateRequirement: (id: string, patch: Partial<RequirementItem>) => void;
  removeRequirement: (id: string) => void;

  addMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  queuePrompt: (text: string) => void;
  consumeQueuedPrompt: () => void;

  logNote: (kind: UserNote["kind"], text: string) => void;
  setSummary: (summary: string) => void;

  applyGraphSpec: (spec: GraphSpec) => void;
  relayout: () => void;
  toGraphSpec: () => GraphSpec;
  toSnapshot: () => ProjectSnapshot;
  loadSnapshot: (snapshot: ProjectSnapshot) => void;
  reset: () => void;
  hydrate: () => Promise<void>;
}

function toArchNode(
  spec: { id: string; kind: NodeKind; label: string; description?: string; tech?: string },
  position: { x: number; y: number },
): ArchNode {
  return {
    id: spec.id,
    type: "arch",
    position,
    data: {
      kind: spec.kind,
      label: spec.label,
      description: spec.description,
      tech: spec.tech,
    },
  };
}

export const useStudio = create<StudioState>((set, store) => ({
  title: "Untitled architecture",
  nodes: [],
  edges: [],
  requirements: [],
  messages: [],
  history: [],
  summary: "",
  summaryUpdatedAt: null,
  selectedNodeId: null,
  selectedEdgeId: null,
  hydrated: false,
  queuedPrompt: null,
  fitSignal: 0,

  onNodesChange: (changes) =>
    set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) as ArchNode[] })),

  onEdgesChange: (changes) =>
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),

  onConnect: (connection) =>
    set((s) => ({
      edges: addEdge({ ...connection, label: "" }, s.edges),
    })),

  setTitle: (title) => set({ title }),

  addNode: (kind, position) =>
    set((s) => {
      const id = `n_${nanoid(6)}`;
      const meta = metaFor(kind);
      return {
        nodes: [...s.nodes, toArchNode({ id, kind, label: meta.label }, position)],
        selectedNodeId: id,
      };
    }),

  updateNodeData: (id, patch) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
    })),

  removeNode: (id) =>
    set((s) => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
    })),

  updateEdgeLabel: (id, label) =>
    set((s) => ({
      edges: s.edges.map((e) => (e.id === id ? { ...e, label } : e)),
    })),

  removeEdge: (id) =>
    set((s) => ({
      edges: s.edges.filter((e) => e.id !== id),
      selectedEdgeId: s.selectedEdgeId === id ? null : s.selectedEdgeId,
    })),

  selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),

  addRequirement: (text, kind) =>
    set((s) => ({
      requirements: [...s.requirements, { id: `r_${nanoid(6)}`, text, kind }],
      // Capture it in the durable history (task 1).
      history: [...s.history, { id: `h_${nanoid(6)}`, ts: Date.now(), kind, text }],
    })),

  updateRequirement: (id, patch) =>
    set((s) => ({
      requirements: s.requirements.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    })),

  removeRequirement: (id) =>
    set((s) => ({ requirements: s.requirements.filter((r) => r.id !== id) })),

  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  clearChat: () => set({ messages: [] }),
  queuePrompt: (text) => set({ queuedPrompt: text }),
  consumeQueuedPrompt: () => set({ queuedPrompt: null }),

  logNote: (kind, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    set((s) => ({
      history: [...s.history, { id: `h_${nanoid(6)}`, ts: Date.now(), kind, text: trimmed }],
    }));
  },

  setSummary: (summary) => set({ summary, summaryUpdatedAt: Date.now() }),

  // Reconcile an AI-proposed graph against the current canvas: keep positions
  // for nodes that already exist, auto-place brand-new nodes.
  applyGraphSpec: (spec) =>
    set((s) => {
      const existing = new Map(s.nodes.map((n) => [n.id, n]));
      const layout = computeLayout(spec);
      const nodes: ArchNode[] = spec.nodes.map((ns) => {
        const prior = existing.get(ns.id);
        const position = prior ? prior.position : layout[ns.id] ?? { x: 0, y: 0 };
        return toArchNode(ns, position);
      });
      const edges: Edge[] = spec.edges.map((es) => ({
        id: es.id ?? `e_${nanoid(6)}`,
        source: es.source,
        target: es.target,
        label: es.label ?? "",
      }));
      return { nodes, edges, fitSignal: s.fitSignal + 1 };
    }),

  // Re-run the layered layout over the entire graph (ignores manual positions).
  relayout: () =>
    set((s) => {
      const spec: GraphSpec = {
        nodes: s.nodes.map((n) => ({ id: n.id, kind: n.data.kind, label: n.data.label })),
        edges: s.edges.map((e) => ({ source: e.source, target: e.target })),
      };
      const layout = computeLayout(spec);
      return {
        nodes: s.nodes.map((n) => (layout[n.id] ? { ...n, position: layout[n.id] } : n)),
        fitSignal: s.fitSignal + 1,
      };
    }),

  toGraphSpec: () => {
    const s = store();
    return {
      nodes: s.nodes.map((n) => ({
        id: n.id,
        kind: n.data.kind,
        label: n.data.label,
        description: n.data.description,
        tech: n.data.tech,
      })),
      edges: s.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: (e.label as string) ?? "",
      })),
    };
  },

  toSnapshot: () => {
    const s = store();
    return {
      version: 1,
      title: s.title,
      graph: s.toGraphSpec(),
      requirements: s.requirements,
      history: s.history,
      summary: s.summary,
    };
  },

  loadSnapshot: (snapshot) => {
    store().applyGraphSpec(snapshot.graph);
    set({
      title: snapshot.title,
      requirements: snapshot.requirements ?? [],
      history: snapshot.history ?? [],
      summary: snapshot.summary ?? "",
    });
  },

  reset: () =>
    set({
      title: "Untitled architecture",
      nodes: [],
      edges: [],
      requirements: [],
      messages: [],
      history: [],
      summary: "",
      summaryUpdatedAt: null,
      selectedNodeId: null,
    }),

  hydrate: async () => {
    try {
      const saved = await idbGet<ProjectSnapshot>(STORAGE_KEY);
      if (saved) store().loadSnapshot(saved);
    } catch {
      // ignore corrupt local state
    }
    set({ hydrated: true });
  },
}));

// Debounced local persistence. Called once on the client.
let persistTimer: ReturnType<typeof setTimeout> | null = null;
export function initPersistence() {
  return useStudio.subscribe((state) => {
    if (!state.hydrated) return;
    if (persistTimer) clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
      void idbSet(STORAGE_KEY, state.toSnapshot());
    }, 500);
  });
}
