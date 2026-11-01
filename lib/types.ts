// Core domain types for the architecture studio.

export type NodeKind =
  | "client"
  | "cdn"
  | "loadbalancer"
  | "gateway"
  | "service"
  | "worker"
  | "queue"
  | "cache"
  | "database"
  | "storage"
  | "external";

export interface ArchNodeData {
  kind: NodeKind;
  label: string;
  description?: string;
  // Free-form technology hint, e.g. "Postgres", "Redis", "Kafka".
  tech?: string;
  [key: string]: unknown;
}

// A node as the AI describes it (no React Flow position required).
export interface GraphNodeSpec {
  id: string;
  kind: NodeKind;
  label: string;
  description?: string;
  tech?: string;
}

export interface GraphEdgeSpec {
  id?: string;
  source: string;
  target: string;
  label?: string;
}

// The portable, serializable representation of a design.
export interface GraphSpec {
  nodes: GraphNodeSpec[];
  edges: GraphEdgeSpec[];
}

export interface RequirementItem {
  id: string;
  text: string;
  // Whether this is a confirmed requirement or an AI/working assumption.
  kind: "requirement" | "assumption";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

// A design decision / ADR-style record the AI can surface.
export interface DecisionRecord {
  id: string;
  title: string;
  choice: string;
  alternatives: string[];
  risks: string[];
}

// A durable, append-only record of a user input (assumption, requirement, or
// instruction) — the raw material for the user-summary page.
export interface UserNote {
  id: string;
  ts: number;
  kind: "requirement" | "assumption" | "instruction";
  text: string;
}

// The full shareable project snapshot.
export interface ProjectSnapshot {
  version: 1;
  title: string;
  graph: GraphSpec;
  requirements: RequirementItem[];
  // Optional for back-compat with older shared links.
  history?: UserNote[];
  summary?: string;
}
