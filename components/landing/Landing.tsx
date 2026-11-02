import Link from "next/link";
import { Press_Start_2P } from "next/font/google";
import { NODE_KINDS, NODE_CATALOG, metaFor } from "@/lib/nodeCatalog";
import type { NodeKind } from "@/lib/types";

const pixel = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-pixel" });

const CREAM = "#e7e0d0";
const MUTED = "#8f897b";
const BLUE = "#7c8cdf";
const BORDER = "#38352e";
const BG = "#1a1917";
const REPO = "https://github.com/jaypatankar/soft-arch";

function GhIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block border px-2.5 py-1 text-[10px] uppercase tracking-widest"
      style={{ borderColor: BORDER, color: MUTED }}
    >
      {children}
    </span>
  );
}

// A mini, static replica of the studio canvas — real node-catalog colors and
// glyphs, drawn as an SVG so it stays crisp and responsive.
function StudioPreview() {
  const nodes: { kind: NodeKind; label: string; x: number; y: number }[] = [
    { kind: "client", label: "Client", x: 8, y: 100 },
    { kind: "gateway", label: "API Gateway", x: 156, y: 100 },
    { kind: "service", label: "Service", x: 304, y: 100 },
    { kind: "cache", label: "Redis", x: 452, y: 24 },
    { kind: "database", label: "Postgres", x: 452, y: 176 },
  ];
  const W = 124;
  const H = 50;
  const cx = (n: { x: number }) => n.x;
  const edges = [
    { from: 0, to: 1, label: "HTTPS" },
    { from: 1, to: 2, label: "REST" },
    { from: 2, to: 3, label: "cache-aside" },
    { from: 2, to: 4, label: "reads/writes" },
  ];
  const anchorRight = (n: { x: number; y: number }) => ({ x: n.x + W, y: n.y + H / 2 });
  const anchorLeft = (n: { x: number; y: number }) => ({ x: n.x, y: n.y + H / 2 });

  return (
    <svg viewBox="0 0 584 250" className="w-full" role="img" aria-label="Example architecture diagram">
      <defs>
        <marker id="arr" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
          <path d="M0,0 L7,3 L0,6 Z" fill={MUTED} />
        </marker>
      </defs>

      {edges.map((e, i) => {
        const a = anchorRight(nodes[e.from]);
        const b = anchorLeft(nodes[e.to]);
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const w = e.label.length * 5.4 + 8;
        return (
          <g key={i}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={MUTED} strokeWidth={1.5} markerEnd="url(#arr)" />
            <rect x={mx - w / 2} y={my - 8} width={w} height={14} fill={BG} />
            <text x={mx} y={my + 2} textAnchor="middle" fontSize="8" fill={MUTED} fontFamily="monospace">
              {e.label}
            </text>
          </g>
        );
      })}

      {nodes.map((n) => {
        const m = metaFor(n.kind);
        return (
          <g key={n.kind + n.label}>
            <rect x={cx(n)} y={n.y} width={W} height={H} rx={7} fill="#201e19" stroke={BORDER} />
            <rect x={n.x + 9} y={n.y + 9} width={16} height={16} rx={3} fill={m.accent} />
            <text x={n.x + 17} y={n.y + 21} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff" fontFamily="monospace">
              {m.glyph}
            </text>
            <text x={n.x + 32} y={n.y + 23} fontSize="11" fontWeight="600" fill={CREAM} fontFamily="monospace">
              {n.label}
            </text>
            <text x={n.x + 32} y={n.y + 37} fontSize="7.5" fill={MUTED} fontFamily="monospace" letterSpacing="0.5">
              {m.label.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const CAPABILITIES = [
  { t: "Prompt → diagram", d: "Describe a scenario and the copilot drafts the architecture on the canvas — nodes, connections, and labels." },
  { t: "Review & risks", d: "Ask for a scalability review: bottlenecks, failure points, trade-offs, and how it behaves under load." },
  { t: "Requirements & assumptions", d: "Capture what's confirmed and what's assumed. The copilot reads them and helps clarify the gaps." },
  { t: "Summaries & recall", d: "Everything you assume or instruct is kept. Summarise your work, then ask questions grounded in it." },
];

const PROVIDERS = ["Anthropic", "OpenAI", "NVIDIA", "Google Gemini", "DeepSeek"];

export function Landing() {
  return (
    <div className={`${pixel.variable} min-h-dvh font-mono`} style={{ background: BG, color: CREAM }}>
      {/* Nav */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center border text-sm" style={{ borderColor: BLUE, color: BLUE }}>
            ◈
          </span>
          <span className="text-sm font-semibold tracking-[0.25em]">SOFT-ARCH</span>
        </div>
        <nav className="flex items-center gap-4 text-[11px] uppercase tracking-widest sm:gap-6">
          <a href="#how" className="hidden sm:inline" style={{ color: MUTED }}>
            How it works
          </a>
          <a
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 border px-3 py-1.5"
            style={{ borderColor: BORDER, color: CREAM }}
            aria-label="GitHub repository"
          >
            <GhIcon /> GitHub
          </a>
          <Link href="/studio" className="border px-3 py-1.5" style={{ borderColor: BLUE, color: BLUE }}>
            Launch &gt;&gt;&gt;
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-2">
        <section>
          <p className="mb-6 text-[11px] uppercase tracking-[0.25em]" style={{ color: MUTED }}>
            Architecture Studio // AI Copilot
          </p>
          <h1 className="font-pixel text-[clamp(2rem,5.5vw,3.5rem)] leading-[1.25]">
            <span>YOU PROMPT.</span>
            <br />
            <span>WE </span>
            <span style={{ color: BLUE }}>DRAW.</span>
            <br />
            <span className="pixel-stroke">YOU EDIT.</span>
            <br />
            <span className="pixel-stroke">WE REVIEW.</span>
          </h1>

          <p className="mt-8 max-w-md text-sm leading-7" style={{ color: MUTED }}>
            <span style={{ color: CREAM }}>Describe a scenario and the copilot draws it</span> — or
            sketch it yourself. It keeps up as you edit: understanding, reviewing, summarising, and
            redrawing with you.{" "}
            <span style={{ color: CREAM }}>No account. Works in your browser.</span>
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Tag>No signup</Tag>
            <Tag>Local-first</Tag>
            <Tag>Shareable link</Tag>
            <Tag>5 AI providers</Tag>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/studio" className="px-6 py-3 text-sm font-semibold uppercase tracking-widest" style={{ background: BLUE, color: "#15140f" }}>
              Open the studio ↓
            </Link>
            <a href="#how" className="text-[11px] uppercase tracking-widest" style={{ color: MUTED }}>
              or see how it works
            </a>
          </div>
        </section>

        {/* Studio canvas preview */}
        <section className="lg:justify-self-end">
          <div className="w-full border p-5" style={{ borderColor: BORDER }}>
            <div className="mb-1 h-3 w-full" style={{ background: `linear-gradient(90deg, ${BLUE} 72%, ${BORDER} 72%)` }} />
            <div className="mb-4 flex items-center justify-between text-[11px] uppercase tracking-widest" style={{ color: MUTED }}>
              <span style={{ color: BLUE }}>● Canvas</span>
              <span>Tidy ✦</span>
            </div>
            <div
              className="rounded-md border p-3"
              style={{
                borderColor: BORDER,
                backgroundColor: "#1c1b17",
                backgroundImage: `radial-gradient(${BORDER} 1px, transparent 1px)`,
                backgroundSize: "16px 16px",
              }}
            >
              <StudioPreview />
            </div>
            <p className="mt-3 text-[11px]" style={{ color: MUTED }}>
              <span style={{ color: BLUE }}>copilot:</span> added a cache in front of the database.
            </p>
          </div>
        </section>
      </main>

      {/* How it works */}
      <section id="how" className="border-t" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mb-10 text-[11px] uppercase tracking-[0.25em]" style={{ color: MUTED }}>
            How it works
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              { n: "01", t: "Prompt or draw", d: "Describe your system and let the copilot draw the first cut — or drag components onto the canvas yourself." },
              { n: "02", t: "Edit together", d: "Move things around, and ask the copilot to review scalability, surface risks, or compare alternatives. It edits in place." },
              { n: "03", t: "Summarise & share", d: "It keeps a running summary of your decisions. Everything saves locally and travels in a single link." },
            ].map((s) => (
              <div key={s.n}>
                <div className="font-pixel text-sm" style={{ color: BLUE }}>
                  {s.n}
                </div>
                <h3 className="mt-3 text-sm font-semibold uppercase tracking-widest">{s.t}</h3>
                <p className="mt-2 text-sm leading-6" style={{ color: MUTED }}>
                  {s.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="border-t" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mb-10 text-[11px] uppercase tracking-[0.25em]" style={{ color: MUTED }}>
            What you get
          </p>
          <div className="grid gap-px overflow-hidden border sm:grid-cols-2" style={{ borderColor: BORDER, background: BORDER }}>
            {CAPABILITIES.map((c) => (
              <div key={c.t} className="p-6" style={{ background: BG }}>
                <h3 className="text-sm font-semibold uppercase tracking-widest" style={{ color: CREAM }}>
                  {c.t}
                </h3>
                <p className="mt-2 text-sm leading-6" style={{ color: MUTED }}>
                  {c.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Building blocks (node palette) */}
      <section className="border-t" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mb-3 text-[11px] uppercase tracking-[0.25em]" style={{ color: MUTED }}>
            Composable building blocks
          </p>
          <p className="mb-8 max-w-xl text-sm leading-6" style={{ color: MUTED }}>
            Eleven typed components the copilot reasons about — the same ones you drag onto the canvas.
          </p>
          <div className="flex flex-wrap gap-2">
            {NODE_KINDS.map((k) => {
              const m = NODE_CATALOG[k];
              return (
                <div key={k} className="flex items-center gap-2 border px-3 py-2" style={{ borderColor: BORDER }}>
                  <span className="flex h-5 w-5 items-center justify-center text-[10px] font-bold text-white" style={{ background: m.accent }}>
                    {m.glyph}
                  </span>
                  <span className="text-xs" style={{ color: CREAM }}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Providers */}
      <section className="border-t" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-6xl px-6 py-16">
          <p className="mb-3 text-[11px] uppercase tracking-[0.25em]" style={{ color: MUTED }}>
            Bring your own model
          </p>
          <p className="mb-8 max-w-xl text-sm leading-6" style={{ color: MUTED }}>
            Point the copilot at whichever provider you have a key for — configured entirely in your
            own environment. Nothing is sent to us.
          </p>
          <div className="flex flex-wrap gap-2">
            {PROVIDERS.map((p) => (
              <span key={p} className="border px-4 py-2 text-xs uppercase tracking-widest" style={{ borderColor: BLUE, color: BLUE }}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Open source / GitHub */}
      <section className="border-t" style={{ borderColor: BORDER, background: "#201e19" }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
          <div className="flex items-center gap-4">
            <span style={{ color: CREAM }}>
              <GhIcon size={32} />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest" style={{ color: CREAM }}>
                Open source
              </p>
              <p className="mt-1 text-sm leading-6" style={{ color: MUTED }}>
                SOFT-ARCH is MIT-licensed. Star it, fork it, or contribute on GitHub.
              </p>
            </div>
          </div>
          <a
            href={REPO}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-2 border px-5 py-3 text-xs font-semibold uppercase tracking-widest"
            style={{ borderColor: BLUE, color: BLUE }}
          >
            <GhIcon /> Connect on GitHub
          </a>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t" style={{ borderColor: BORDER }}>
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16">
          <h2 className="font-pixel text-[clamp(1.25rem,3.5vw,2rem)] leading-[1.4]">
            START <span style={{ color: BLUE }}>DRAWING.</span>
          </h2>
          <Link href="/studio" className="px-6 py-3 text-sm font-semibold uppercase tracking-widest" style={{ background: BLUE, color: "#15140f" }}>
            Open the studio ↓
          </Link>
        </div>
      </section>

      <footer className="border-t" style={{ borderColor: BORDER }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-[10px] uppercase tracking-widest" style={{ color: MUTED }}>
          <span>◈ SOFT-ARCH</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href="https://jaypatankar.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: MUTED }}>
              Portfolio
            </a>
            <a href={REPO} target="_blank" rel="noopener noreferrer" style={{ color: MUTED }}>
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/jaypatankar2510/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: MUTED }}
            >
              LinkedIn
            </a>
            <Link href="/terms" style={{ color: MUTED }}>
              Terms
            </Link>
            <Link href="/studio" style={{ color: BLUE }}>
              Launch &gt;&gt;&gt;
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
