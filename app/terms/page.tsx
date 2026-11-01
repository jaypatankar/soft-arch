import Link from "next/link";
import { Press_Start_2P } from "next/font/google";

const pixel = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-pixel" });

const CREAM = "#e7e0d0";
const MUTED = "#8f897b";
const BLUE = "#7c8cdf";
const BORDER = "#38352e";
const BG = "#1a1917";

export const metadata = {
  title: "Terms · SOFT-ARCH",
};

const POINTS = [
  "Just for learning. SOFT-ARCH is an educational sandbox — a place to sketch, experiment, and reason about system design.",
  "No guarantees. Diagrams and AI suggestions are for learning, not production or professional advice. Think, verify, decide for yourself.",
  "Your stuff stays yours. Projects live in your browser; you bring your own AI key. We don't store your designs.",
  "Be cool. Don't abuse the AI endpoint or use it for anything outside software architecture.",
];

export default function TermsPage() {
  return (
    <div className={`${pixel.variable} min-h-dvh font-mono`} style={{ background: BG, color: CREAM }}>
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center border text-sm" style={{ borderColor: BLUE, color: BLUE }}>
            ◈
          </span>
          <span className="text-sm font-semibold tracking-[0.25em]">SOFT-ARCH</span>
        </Link>
        <Link href="/studio" className="border px-3 py-1.5 text-[11px] uppercase tracking-widest" style={{ borderColor: BLUE, color: BLUE }}>
          Launch &gt;&gt;&gt;
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="mb-4 text-[11px] uppercase tracking-[0.25em]" style={{ color: MUTED }}>
          Terms
        </p>
        <h1 className="font-pixel text-[clamp(1.5rem,4vw,2.25rem)] leading-[1.4]">
          JUST FOR <span style={{ color: BLUE }}>LEARNING.</span>
        </h1>

        <ul className="mt-10 space-y-5">
          {POINTS.map((p, i) => (
            <li key={i} className="flex gap-3 text-sm leading-7">
              <span className="font-pixel text-xs" style={{ color: BLUE }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ color: MUTED }}>{p}</span>
            </li>
          ))}
        </ul>

        <div className="mt-12 border-t pt-8" style={{ borderColor: BORDER }}>
          <p className="text-sm uppercase tracking-widest" style={{ color: CREAM }}>
            Learn. Implement. Build scalable solutions.
          </p>
          <p className="mt-3 text-sm" style={{ color: MUTED }}>
            Happy to have you here 👋
          </p>
          <Link
            href="/studio"
            className="mt-8 inline-block px-6 py-3 text-sm font-semibold uppercase tracking-widest"
            style={{ background: BLUE, color: "#15140f" }}
          >
            Open the studio ↓
          </Link>
        </div>
      </main>
    </div>
  );
}
