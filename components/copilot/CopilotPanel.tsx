"use client";

import { useRef, useState, useEffect } from "react";
import { nanoid } from "nanoid";
import { useStudio } from "@/lib/store";
import type { ChatMessage } from "@/lib/types";

const SAMPLE_PROMPT = `Your task is to design a production-oriented system architecture graph that supports link creation, redirection, user management, and basic analytics.

1. Functional requirements
- Users can create shortened URLs.
- Anyone can open a short link and get redirected to the original URL.
- Registered users can view and manage their links.
- Users can set an optional expiration date.
- The platform tracks how many times each short link is visited.
- Users can deactivate their links.

2. Non-functional requirements
- Registered users: 10,000
- Short links created: 100,000 per month
- Redirect requests: 1 million per day
- Redirect latency: under 150 ms at p95, excluding destination website loading
- Availability: 99.9% monthly target
- Data retention: links persist unless deleted or expired
- Deployment: single cloud region
- Budget: prefer cost-effective managed services

These are hypothetical design constraints for the exercise. Draw the architecture and explain your key choices.`;

const QUICK_ACTIONS: { label: string; prompt: string }[] = [
  {
    label: "Draw from requirements",
    prompt:
      "Based on the requirements and assumptions, design an initial architecture and draw it on the canvas. Explain your key choices.",
  },
  {
    label: "Review scalability",
    prompt:
      "Review the current architecture for scalability. Identify the top bottlenecks and failure points, and explain how they'd behave under 10x load.",
  },
  {
    label: "Suggest improvements",
    prompt:
      "Suggest concrete improvements to the current design. Where useful, update the diagram. Call out trade-offs.",
  },
  {
    label: "Risks & alternatives",
    prompt:
      "What are the main architectural risks in this design, and what are credible alternative approaches with their trade-offs?",
  },
];

export function CopilotPanel() {
  const messages = useStudio((s) => s.messages);
  const addMessage = useStudio((s) => s.addMessage);
  const logNote = useStudio((s) => s.logNote);
  const applyGraphSpec = useStudio((s) => s.applyGraphSpec);
  const toGraphSpec = useStudio((s) => s.toGraphSpec);
  const requirements = useStudio((s) => s.requirements);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const queuedPrompt = useStudio((s) => s.queuedPrompt);
  const consumeQueuedPrompt = useStudio((s) => s.consumeQueuedPrompt);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  // Pick up prompts dispatched from other panels (e.g. Requirements → clarify).
  useEffect(() => {
    if (queuedPrompt && !busy) {
      const p = queuedPrompt;
      consumeQueuedPrompt();
      void send(p);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queuedPrompt]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setError(null);
    const userMsg: ChatMessage = { id: nanoid(6), role: "user", content: trimmed };
    addMessage(userMsg);
    logNote("instruction", trimmed); // durable record for the user-summary page
    setInput("");
    setBusy(true);

    // Snapshot the conversation including the just-added user message.
    const history = [...useStudio.getState().messages];

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          graph: toGraphSpec(),
          requirements,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Request failed.");
      } else {
        addMessage({ id: nanoid(6), role: "assistant", content: data.reply });
        if (data.graph && Array.isArray(data.graph.nodes)) {
          applyGraphSpec(data.graph);
        }
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2.5 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">SOFT-ARCH Copilot</h2>
        <span className="text-[10px] uppercase tracking-wide text-zinc-400">AI</span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {messages.length === 0 ? (
          <div className="space-y-3 pt-2">
            <p className="text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
              Ask me to design an architecture, review your diagram, suggest alternatives, or explain
              a pattern. I can draw directly on the canvas.
            </p>
            <div className="flex flex-col gap-1.5">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.label}
                  onClick={() => send(a.prompt)}
                  className="rounded-lg border border-zinc-200 px-3 py-2 text-left text-xs text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
            >
              <div
                className={
                  m.role === "user"
                    ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-indigo-600 px-3 py-2 text-sm text-white"
                    : "max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-zinc-100 px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                }
              >
                {m.content}
              </div>
            </div>
          ))
        )}
        {busy ? (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-zinc-100 px-3 py-2 text-sm text-zinc-500 dark:bg-zinc-800">
              <span className="inline-flex gap-1">
                <span className="animate-pulse">Thinking</span>
                <span className="animate-bounce">…</span>
              </span>
            </div>
          </div>
        ) : null}
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        ) : null}
      </div>

      <form
        className="border-t border-zinc-200 p-3 dark:border-zinc-800"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setInput(SAMPLE_PROMPT);
              send(SAMPLE_PROMPT);
            }}
            disabled={busy}
            title="Fill and run a sample scenario (URL shortener)"
            className="rounded-md border border-indigo-200 px-2 py-1 text-[11px] font-medium text-indigo-600 disabled:opacity-40 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-950"
          >
            ✦ Sample prompt
          </button>
        </div>
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Describe your system, or ask for a review…"
            rows={2}
            className="flex-1 resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-indigo-500"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
