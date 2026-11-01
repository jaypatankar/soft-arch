import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { runAi, selectProvider } from "@/lib/ai";
import { clientIp, rateLimit, validateInput } from "@/lib/ai/guard";

// POST route handlers are never cached; this runs at request time.
export async function POST(request: Request) {
  if (!selectProvider()) {
    return Response.json(
      {
        error:
          "No AI provider key is set. Add NVIDIA_API_KEY (or ANTHROPIC_API_KEY) to .env.local and restart.",
      },
      { status: 500 },
    );
  }

  // 1. Rate limit per IP to prevent cost/volume abuse.
  const limit = rateLimit(clientIp(request));
  if (!limit.ok) {
    return Response.json(
      { error: "Too many requests. Please slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter ?? 30) } },
    );
  }

  // 2. Parse + validate/bound the payload.
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const guard = validateInput(raw);
  if (!guard.ok) {
    return Response.json({ error: guard.error }, { status: guard.status });
  }

  // 3. Call the model. Scope/injection binding lives in the system prompt.
  try {
    const result = await runAi(guard.input);
    return Response.json(result);
  } catch (err) {
    if (err instanceof Anthropic.APIError) {
      return Response.json({ error: `Claude API error (${err.status}): ${err.message}` }, { status: 502 });
    }
    if (err instanceof OpenAI.APIError) {
      return Response.json({ error: `NVIDIA API error (${err.status}): ${err.message}` }, { status: 502 });
    }
    return Response.json({ error: "Unexpected error talking to the model provider." }, { status: 500 });
  }
}
