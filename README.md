# SOFT-ARCH

**An AI-assisted studio for software architects.** Sketch a system on an
interactive canvas and work alongside an AI copilot that can draw and modify the
diagram, review it for scalability and risk, suggest alternatives, and explain
the theory behind the choices.

No account, no backend storage — designs live in your browser, and you bring
your own AI key.

> ⚠️ **Educational sandbox.** SOFT-ARCH is for learning and experimentation.
> Diagrams and AI suggestions are not professional advice — think, verify, and
> decide for yourself.

- **License:** MIT
- **Stack:** Next.js 16 · React 19 · Tailwind v4 · React Flow · Zustand · dagre

## Features

- **Canvas** — node-based diagram (React Flow) with eleven typed components
  (client, CDN, load balancer, gateway, service, worker, queue, cache, database,
  object storage, external). Drag from the palette, connect nodes, and label
  edges. Edit any node or connection in the inspector.
- **Architect Copilot** — a chat that reads the current graph + requirements and
  can _draw/modify_ the diagram, _review_ it, _suggest_ improvements, and
  _explain_ patterns. Quick-action buttons cover the common asks.
- **Requirements** — capture explicit requirements and assumptions; the copilot
  reads them, and "Clarify with AI" asks it to interview you and propose a list.
- **Summary & recall** — everything you assume or instruct is logged. Generate a
  running summary of your work on the `/summary` page, then ask grounded
  questions about it ("What did I decide about the database?").
- **Auto layout** — the AI's diagrams are arranged with an edge-aware layered
  layout (dagre). Hit **Tidy** any time to re-arrange and re-fit the view.
- **Local-first + shareable** — designs auto-save to the browser (IndexedDB) and
  can be shared via a self-contained URL (no account, no backend storage).

## Routes

| Path | What it is |
| --- | --- |
| `/` | Landing page |
| `/studio` | The three-panel studio (requirements · canvas · copilot) |
| `/summary` | Running summary of your work + Q&A over it |
| `/terms` | Terms / "just for learning" |
| `/api/ai` | Copilot handler → `{ reply, graph }` |
| `/api/summary` | Summary generation + question answering |

## AI providers

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

Keys are read only server-side by the `/api/ai` and `/api/summary` routes and
never reach the browser. Without any key the canvas still works and the copilot
returns a clear error.

## Getting started

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

## Architecture

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
- `lib/nodeCatalog.ts` — the typed component catalog (glyphs, colors, labels).
- `lib/layout.ts` — dagre edge-aware layered layout.
- `lib/share.ts` — compressed URL-hash sharing.
- `components/canvas/*`, `components/copilot/*`, `components/requirements/*`,
  `components/summary/*`.

## Contributing

Contributions are welcome! To propose a change:

1. Fork the repo and create a branch (`git checkout -b feat/my-change`).
2. Make your change and run `pnpm lint` and `pnpm build` to check it compiles.
3. Commit with a clear message and open a pull request describing the what and
   why.

For larger features or questions, please open an issue first to discuss the
direction.

## Roadmap

Not yet built from the original vision: decision records (ADRs with
alternatives/risks as first-class artifacts) and targeted change proposals when
a requirement changes. The `DecisionRecord` type in
[`lib/types.ts`](lib/types.ts) is the seed.

## License

[MIT](LICENSE) © Jay Patankar
