# SOFT-ARCH

### 🚀 [**Try the live app → soft-arch.vercel.app**](https://soft-arch.vercel.app/)

---

**An AI-assisted studio for software architects.** Sketch a system on an
interactive canvas and work alongside an AI copilot that can draw and modify the
diagram, review it for scalability and risk, suggest alternatives, and explain
the theory behind the choices.

No account, no backend storage — designs live in your browser, and you bring your own AI key.

> ⚠️ **Educational sandbox.** SOFT-ARCH is for learning and experimentation.
> Diagrams and AI suggestions are not professional advice — think, verify, and
> decide for yourself.

- **License:** MIT
- **Stack:** Next.js 16 · React 19 · Tailwind v4 · React Flow · Zustand · dagre

---

## ✨ Features

### 🎨 Interactive canvas
- **Node-based diagramming** built on [React Flow](https://reactflow.com) —
  pan, zoom, box-select, and a live minimap color-coded by component type.
- **Drag-and-drop palette** — drop any of the eleven typed components onto the
  canvas from the floating palette.
- **Click to connect** — drag from one node's handle to another to create a
  labelled connection.
- **Keyboard delete** — select a node or edge and press `Backspace`/`Delete`.
- **Dotted grid, zoom controls, and auto fit-view** that re-frames the diagram
  whenever the AI draws or you hit **Tidy**.

### 🧱 Eleven typed components
Each component carries a tier (for layout), an accent color, and a glyph. The
copilot reasons about these same kinds, so what you draw and what it draws speak
one vocabulary.

| Glyph | Component | What it represents |
| :---: | --- | --- |
| ▢ | **Client** | Browser / mobile / device |
| ☍ | **CDN** | Edge content delivery |
| ⇄ | **Load Balancer** | Traffic distribution |
| ⊟ | **API Gateway** | Routing, auth, rate limiting |
| ⚙ | **Service** | Application / microservice |
| ⚒ | **Worker** | Async / background job |
| ≋ | **Queue** | Message broker / stream |
| ⚡ | **Cache** | In-memory cache |
| ⛁ | **Database** | Primary data store |
| ⬢ | **Object Storage** | Blobs / files |
| ↗ | **External System** | 3rd-party / SaaS API |

### 🔍 Inspector
Select any node to edit its **label**, **kind**, **technology** (e.g. Postgres,
Redis, Kafka), and free-form **notes**. Select a connection to edit its label
(e.g. "reads/writes", "publishes"). Delete either from here.

### 🤖 Architect Copilot
A chat panel that reads your current graph **and** requirements, and can do four
things:

1. **Draw / modify** the diagram directly on the canvas.
2. **Review** an existing design for scalability, reliability, cost, and risk.
3. **Suggest** alternatives and trade-offs.
4. **Explain** architecture theory and patterns for your scenario.

- **Quick-action buttons** — _Draw from requirements_, _Review scalability_,
  _Suggest improvements_, _Risks & alternatives_.
- **Sample prompt** — one click loads a realistic URL-shortener brief (with
  functional + non-functional requirements) and runs it.
- **Position-preserving edits** — the AI returns the complete graph, but nodes
  keep their manual positions as long as their id is unchanged, so your layout
  survives.

### 📋 Requirements & assumptions
A dedicated panel to capture what's **confirmed** (requirements) versus what's
**assumed** (assumptions). Add, edit inline, or remove each item — the copilot
reads them on every turn. **Clarify with AI** asks the copilot to act as a
requirements analyst, interview you, and propose a list.

### 🧭 Auto layout
AI-generated diagrams are arranged with an edge-aware, tiered **dagre** layout
(left-to-right by component tier). Hit **Tidy** any time to re-arrange and
re-fit the view.

### 📝 Summary & recall
Everything you assume, require, or instruct is recorded to a durable,
append-only log. On the `/summary` page you can:
- **Generate a running summary** of your work — goal, confirmed requirements,
  stated assumptions, and key decisions.
- **Ask grounded questions** about it ("What did I decide about the database?",
  "What assumptions have I made?"), answered **only** from your logged history.
- **Browse the full captured history**, tagged by kind and timestamp.

### 💾 Local-first & shareable
- **Auto-save** to the browser via IndexedDB — reload and your design is still
  there.
- **Share via link** — the entire project (title, graph, requirements, history,
  summary) is compressed into a URL fragment (`#d=…`). No backend, no account;
  the fragment is **never sent to the server**. A shared link takes precedence
  over local state when opened.
- **Project controls** — rename the project inline, or start fresh with **New**.

### 🔌 Bring your own model (5 providers)
Point the copilot at whichever provider you have a key for — configured entirely
in your own environment. See [AI providers](#-ai-providers) below.

### 🛡️ Safety & guardrails
- **Strict scope** — the copilot is constrained to software architecture only
  and resists prompt-injection (treats diagram/requirements/chat as untrusted
  data, not instructions).
- **Input bounding** — requests are validated and capped (message count/size,
  node/edge counts) so the endpoint can't be used as a general-purpose LLM
  proxy.
- **Per-IP rate limiting** — a fixed-window limiter (20 requests/minute per IP)
  protects your key.
- **Keys stay server-side** — provider keys are read only in the `/api/ai` and
  `/api/summary` routes and never reach the browser.

### 🌓 Theme-aware
Light and dark mode throughout.

---

## 🔄 How it works

```
          ┌───────────────┐      ┌──────────────┐      ┌────────────────┐
  you ──▶ │  Requirements │ ───▶ │   Copilot    │ ───▶ │     Canvas     │
          │  & assumptions│      │  (/api/ai)   │      │  (React Flow)  │
          └───────────────┘      └──────┬───────┘      └───────┬────────┘
                 ▲                       │                      │
                 │                  reply + graph          dagre auto-layout
                 │                       │                      │
                 └───────── Summary ◀────┴──────── edits ◀──────┘
                          (/summary, /api/summary)
```

1. **Capture intent.** Add requirements and assumptions, or just describe your
   system in the copilot. Everything you state is logged for the summary.
2. **Draw.** The copilot drafts an architecture and returns the complete graph;
   the canvas applies it and the dagre layout arranges it by tier.
3. **Edit together.** Drag nodes, tweak them in the inspector, or ask the
   copilot to review scalability, surface risks, or compare alternatives — it
   edits in place while preserving your manual positions.
4. **Recall & share.** Generate a running summary and ask questions grounded in
   your history, then share the whole project as a single self-contained link.

### Request flow (under the hood)

`CopilotPanel` → `POST /api/ai` → **guard** (validate + rate-limit) →
**select provider** → Anthropic native tool-use *or* OpenAI-compatible JSON →
normalize to a `GraphSpec` → `{ reply, graph }` → `applyGraphSpec()` → dagre
layout → canvas re-fit.

---

## 🗺️ Routes

| Path | What it is |
| --- | --- |
| `/` | Landing page |
| `/studio` | The three-panel studio (requirements · canvas · copilot) |
| `/summary` | Running summary of your work + Q&A over it |
| `/terms` | Terms / "just for learning" |
| `/api/ai` | Copilot handler → `{ reply, graph }` |
| `/api/summary` | Summary generation + question answering |

---

## 🔌 AI providers

The copilot supports five providers, configured entirely by environment
variables. Enable any subset by setting the matching key(s); the registry lives
in [`lib/ai/providers.ts`](lib/ai/providers.ts). Anthropic uses its native
tool-use; the other four are OpenAI-compatible and share one runner
([`lib/ai/openaiCompat.ts`](lib/ai/openaiCompat.ts)) that returns a structured
JSON object.

| Provider | API key env | Model env (default) | Base URL env (default) |
| --- | --- | --- | --- |
| **Anthropic** | `ANTHROPIC_API_KEY` | `ANTHROPIC_MODEL` (`claude-opus-4-8`) | — |
| **OpenAI** | `OPENAI_API_KEY` | `OPENAI_MODEL` (`gpt-4o`) | `OPENAI_BASE_URL` (SDK default) |
| **NVIDIA** | `NVIDIA_API_KEY` | `NVIDIA_MODEL` (`nvidia/nemotron-3.5-lightning-30b-a3b`) | `NVIDIA_BASE_URL` (`https://integrate.api.nvidia.com/v1`) |
| **Google Gemini** | `GEMINI_API_KEY` / `GOOGLE_API_KEY` | `GEMINI_MODEL` (`gemini-2.0-flash`) | `GEMINI_BASE_URL` (`…/v1beta/openai`) |
| **DeepSeek** | `DEEPSEEK_API_KEY` | `DEEPSEEK_MODEL` (`deepseek-chat`) | `DEEPSEEK_BASE_URL` (`https://api.deepseek.com`) |

**Selection:** set `AI_PROVIDER` (`anthropic` | `openai` | `nvidia` | `gemini` |
`deepseek`) to force one. Otherwise the first configured provider in priority
order (anthropic → openai → gemini → deepseek → nvidia) is used. Model defaults
are starting points — override per provider via the model env var.

Without any key the canvas still works and the copilot returns a clear error.

---

## 🚀 Getting started

**Prerequisites:** Node.js 20+ and [pnpm](https://pnpm.io) 10+.

```bash
git clone https://github.com/jaypatankar/soft-arch.git
cd soft-arch
pnpm install
cp .env.local.example .env.local   # then add at least one provider key
```

Set one or more provider keys in `.env.local` and optionally pin the active one:

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
NVIDIA_API_KEY=nvapi-...
GEMINI_API_KEY=...
DEEPSEEK_API_KEY=...

# Force one provider (otherwise auto-selected by priority):
# AI_PROVIDER=openai
# Override a model:
# OPENAI_MODEL=gpt-4o
```

Then run it:

```bash
pnpm dev     # http://localhost:3000
pnpm build   # production build
pnpm start   # serve the production build
pnpm lint    # eslint
```

---

## 🧩 Project structure

- `app/page.tsx` → `components/landing/Landing.tsx` — marketing landing page.
- `app/studio/page.tsx` → `components/Studio.tsx` — the three-panel shell
  (requirements · canvas · copilot).
- `app/summary/page.tsx` → `components/summary/SummaryView.tsx` — summary + Q&A.
- `app/api/ai/route.ts` — thin handler that calls `runAi()` and returns
  `{ reply, graph }`.
- `app/api/summary/route.ts` — summarises logged history and answers questions
  grounded in it.
- `lib/ai/` — provider abstraction: `providers.ts` (registry + selection),
  `index.ts` (dispatch), `anthropic.ts`, `openaiCompat.ts` (OpenAI/NVIDIA/
  Gemini/DeepSeek), `text.ts` (plain-text completions for summaries),
  `prompt.ts` (shared prompts + scope policy), `guard.ts` (validation + rate
  limiting).
- `lib/store.ts` — Zustand store (graph, requirements, history, chat) +
  IndexedDB persistence.
- `lib/nodeCatalog.ts` — the typed component catalog (glyphs, colors, tiers).
- `lib/layout.ts` — dagre edge-aware layered layout.
- `lib/share.ts` — compressed URL-hash sharing.
- `components/canvas/*`, `components/copilot/*`, `components/requirements/*`,
  `components/summary/*`.

---

## 🤝 Contributing

Contributions are welcome! To propose a change:

1. Fork the repo and create a branch (`git checkout -b feat/my-change`).
2. Make your change and run `pnpm lint` and `pnpm build` to check it compiles.
3. Commit with a clear message and open a pull request describing the what and
   why.

For larger features or questions, please open an issue first to discuss the
direction.

---

## 🧭 Roadmap

Not yet built from the original vision: decision records (ADRs with
alternatives/risks as first-class artifacts) and targeted change proposals when
a requirement changes. The `DecisionRecord` type in
[`lib/types.ts`](lib/types.ts) is the seed.

---

## 📄 License

[MIT](LICENSE) © Jay Patankar
