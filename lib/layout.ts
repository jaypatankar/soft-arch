import dagre from "@dagrejs/dagre";
import type { GraphSpec } from "./types";
import { metaFor } from "./nodeCatalog";

export interface XY {
  x: number;
  y: number;
}

// Approximate rendered node box (see ArchNodeView). Generous height leaves room
// for the optional description line so dagre doesn't pack rows too tightly.
const NODE_W = 200;
const NODE_H = 96;

// Edge-aware layered layout. Ranks follow the connection graph (left→right),
// so connected components fan out instead of stacking in dense columns.
// Disconnected nodes fall back to their kind's tier for a sensible column.
export function computeLayout(graph: GraphSpec): Record<string, XY> {
  if (graph.nodes.length === 0) return {};

  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: "LR",
    ranksep: 130,
    nodesep: 55,
    marginx: 20,
    marginy: 20,
    ranker: "network-simplex",
  });
  g.setDefaultEdgeLabel(() => ({}));

  for (const node of graph.nodes) {
    g.setNode(node.id, { width: NODE_W, height: NODE_H });
  }

  const ids = new Set(graph.nodes.map((n) => n.id));
  const connected = new Set<string>();
  for (const edge of graph.edges) {
    if (ids.has(edge.source) && ids.has(edge.target)) {
      g.setEdge(edge.source, edge.target);
      connected.add(edge.source);
      connected.add(edge.target);
    }
  }

  // Anchor orphan nodes into tier-based columns so they don't all collapse to
  // rank 0; dagre still spaces them vertically.
  const orphans = graph.nodes.filter((n) => !connected.has(n.id));
  if (orphans.length > 0 && connected.size > 0) {
    const anchors = new Map<number, string>();
    for (const n of orphans) {
      const tier = metaFor(n.kind).tier;
      const anchorId = `__tier_${tier}`;
      if (!anchors.has(tier)) {
        anchors.set(tier, anchorId);
        g.setNode(anchorId, { width: 1, height: 1 });
      }
      // chain orphan after its tier anchor to push it to a matching rank
      g.setEdge(anchors.get(tier)!, n.id);
    }
  }

  dagre.layout(g);

  const positions: Record<string, XY> = {};
  for (const node of graph.nodes) {
    const p = g.node(node.id);
    if (p) positions[node.id] = { x: p.x - NODE_W / 2, y: p.y - NODE_H / 2 };
  }
  return positions;
}
