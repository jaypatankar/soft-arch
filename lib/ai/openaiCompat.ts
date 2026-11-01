import OpenAI from "openai";
import { buildContext, coerceGraph, SYSTEM_JSON, type AiInput, type AiResult } from "./prompt";
import { providerKey, resolveBaseUrl, resolveModel, type ProviderDef } from "./providers";

// Drives any OpenAI-compatible provider (OpenAI, NVIDIA, Gemini, DeepSeek).
// Asks for a single JSON object rather than function-calling, which is the most
// portable contract across these endpoints.
function extractJson(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    const candidate = fence ? fence[1] : trimmed.slice(trimmed.indexOf("{"), trimmed.lastIndexOf("}") + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }
}

export async function runOpenAiCompatible(input: AiInput, def: ProviderDef): Promise<AiResult> {
  const client = new OpenAI({
    apiKey: providerKey(def),
    baseURL: resolveBaseUrl(def),
  });

  const contextBlock = buildContext(input.graph, input.requirements);

  const completion = await client.chat.completions.create({
    model: resolveModel(def),
    max_tokens: 16384,
    temperature: 0.4,
    messages: [
      { role: "system", content: SYSTEM_JSON },
      { role: "system", content: `Current state of the design:\n\n${contextBlock}` },
      ...input.messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  });

  const content = completion.choices[0]?.message?.content ?? "";
  const parsed = extractJson(content) as { reply?: unknown; graph?: unknown } | null;

  if (!parsed || typeof parsed !== "object") {
    return { reply: content.trim() || "Done.", graph: null };
  }

  const reply = typeof parsed.reply === "string" && parsed.reply.trim() ? parsed.reply.trim() : "Done.";
  return { reply, graph: coerceGraph(parsed.graph) };
}
