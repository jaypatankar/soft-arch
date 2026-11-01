import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import type { ProjectSnapshot } from "./types";

// Projects are shared via a compressed fragment in the URL (#d=...), so no
// backend or auth is needed. The fragment is never sent to the server.
const HASH_KEY = "d";

export function encodeSnapshot(snapshot: ProjectSnapshot): string {
  return compressToEncodedURIComponent(JSON.stringify(snapshot));
}

export function decodeSnapshot(encoded: string): ProjectSnapshot | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (parsed && parsed.version === 1 && parsed.graph) return parsed as ProjectSnapshot;
    return null;
  } catch {
    return null;
  }
}

export function buildShareUrl(snapshot: ProjectSnapshot): string {
  const base = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "";
  return `${base}#${HASH_KEY}=${encodeSnapshot(snapshot)}`;
}

export function readSnapshotFromHash(): ProjectSnapshot | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.replace(/^#/, "");
  const params = new URLSearchParams(hash);
  const encoded = params.get(HASH_KEY);
  if (!encoded) return null;
  return decodeSnapshot(encoded);
}
