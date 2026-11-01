import type { NodeKind } from "./types";

export interface NodeKindMeta {
  kind: NodeKind;
  label: string;
  // Tier controls the left-to-right layered auto-layout.
  tier: number;
  // Tailwind-friendly accent color (used inline so it survives theme).
  accent: string;
  glyph: string;
  blurb: string;
}

export const NODE_CATALOG: Record<NodeKind, NodeKindMeta> = {
  client: { kind: "client", label: "Client", tier: 0, accent: "#6366f1", glyph: "▢", blurb: "Browser / mobile / device" },
  cdn: { kind: "cdn", label: "CDN", tier: 1, accent: "#0ea5e9", glyph: "☍", blurb: "Edge content delivery" },
  loadbalancer: { kind: "loadbalancer", label: "Load Balancer", tier: 1, accent: "#14b8a6", glyph: "⇄", blurb: "Traffic distribution" },
  gateway: { kind: "gateway", label: "API Gateway", tier: 2, accent: "#22c55e", glyph: "⊟", blurb: "Routing, auth, rate limit" },
  service: { kind: "service", label: "Service", tier: 3, accent: "#3b82f6", glyph: "⚙", blurb: "Application / microservice" },
  worker: { kind: "worker", label: "Worker", tier: 3, accent: "#8b5cf6", glyph: "⚒", blurb: "Async / background job" },
  queue: { kind: "queue", label: "Queue", tier: 4, accent: "#f59e0b", glyph: "≋", blurb: "Message broker / stream" },
  cache: { kind: "cache", label: "Cache", tier: 4, accent: "#ef4444", glyph: "⚡", blurb: "In-memory cache" },
  database: { kind: "database", label: "Database", tier: 5, accent: "#ec4899", glyph: "⛁", blurb: "Primary data store" },
  storage: { kind: "storage", label: "Object Storage", tier: 5, accent: "#a855f7", glyph: "⬢", blurb: "Blobs / files" },
  external: { kind: "external", label: "External System", tier: 6, accent: "#64748b", glyph: "↗", blurb: "3rd-party / SaaS API" },
};

export const NODE_KINDS = Object.keys(NODE_CATALOG) as NodeKind[];

export function metaFor(kind: NodeKind): NodeKindMeta {
  return NODE_CATALOG[kind] ?? NODE_CATALOG.service;
}
