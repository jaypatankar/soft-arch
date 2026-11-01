import type { AiInput } from "./prompt";

// Hard limits that keep the endpoint from being used as a general-purpose /
// high-volume LLM proxy. Tuned for realistic architecture conversations.
export const LIMITS = {
  maxMessages: 24,
  maxMessageChars: 6000,
  maxTotalChars: 24000,
  maxNodes: 120,
  maxEdges: 240,
  // Per-IP fixed-window rate limit.
  windowMs: 60_000,
  maxRequestsPerWindow: 20,
};

export type GuardResult =
  | { ok: true; input: AiInput }
  | { ok: false; status: number; error: string; retryAfter?: number };

function isRole(v: unknown): v is "user" | "assistant" {
  return v === "user" || v === "assistant";
}

// Validate and bound the request body. Rejects anything malformed or oversized
// so a caller can't smuggle a huge/arbitrary prompt through our key.
export function validateInput(body: unknown): GuardResult {
  if (!body || typeof body !== "object") {
    return { ok: false, status: 400, error: "Invalid request body." };
  }
  const b = body as Partial<AiInput>;

  if (!Array.isArray(b.messages) || b.messages.length === 0) {
    return { ok: false, status: 400, error: "messages must be a non-empty array." };
  }
  if (b.messages.length > LIMITS.maxMessages) {
    return { ok: false, status: 400, error: `Conversation too long (max ${LIMITS.maxMessages} messages).` };
  }

  let total = 0;
  for (const m of b.messages) {
    if (!m || typeof m !== "object" || !isRole((m as { role?: unknown }).role) || typeof (m as { content?: unknown }).content !== "string") {
      return { ok: false, status: 400, error: "Each message needs a role ('user'|'assistant') and string content." };
    }
    const len = (m as { content: string }).content.length;
    if (len > LIMITS.maxMessageChars) {
      return { ok: false, status: 400, error: `A message is too long (max ${LIMITS.maxMessageChars} chars).` };
    }
    total += len;
  }
  if (total > LIMITS.maxTotalChars) {
    return { ok: false, status: 400, error: `Conversation payload too large (max ${LIMITS.maxTotalChars} chars).` };
  }

  const graph = b.graph ?? { nodes: [], edges: [] };
  if (!graph || typeof graph !== "object" || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
    return { ok: false, status: 400, error: "graph must have nodes[] and edges[]." };
  }
  if (graph.nodes.length > LIMITS.maxNodes || graph.edges.length > LIMITS.maxEdges) {
    return { ok: false, status: 400, error: "Diagram is too large to process." };
  }

  const requirements = Array.isArray(b.requirements) ? b.requirements : [];

  return { ok: true, input: { messages: b.messages, graph, requirements } };
}

// In-memory fixed-window rate limiter. Per server instance only — fine for a
// single-node deployment; swap for a shared store (Redis/KV) if you scale out.
const hits = new Map<string, { count: number; windowStart: number }>();

export function rateLimit(ip: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();

  // Opportunistic prune so the map can't grow without bound.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (now - v.windowStart > LIMITS.windowMs) hits.delete(k);
    }
  }

  const entry = hits.get(ip);
  if (!entry || now - entry.windowStart > LIMITS.windowMs) {
    hits.set(ip, { count: 1, windowStart: now });
    return { ok: true };
  }
  if (entry.count >= LIMITS.maxRequestsPerWindow) {
    return { ok: false, retryAfter: Math.ceil((LIMITS.windowMs - (now - entry.windowStart)) / 1000) };
  }
  entry.count += 1;
  return { ok: true };
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
