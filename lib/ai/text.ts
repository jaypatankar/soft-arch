import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { providerKey, resolveBaseUrl, resolveModel, selectProvider } from "./providers";

export interface TextMessage {
  role: "user" | "assistant";
  content: string;
}

// Provider-agnostic plain-text completion (no tools, no graph). Used by the
// user-summary feature. Dispatches to whichever provider is configured.
export async function runText(system: string, messages: TextMessage[]): Promise<string> {
  const def = selectProvider();
  if (!def) throw new Error("no-provider");

  if (def.kind === "anthropic") {
    const client = new Anthropic();
    const res = await client.messages.create({
      model: resolveModel(def),
      max_tokens: 4000,
      thinking: { type: "adaptive" },
      output_config: { effort: "medium" },
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    return res.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
  }

  const client = new OpenAI({ apiKey: providerKey(def), baseURL: resolveBaseUrl(def) });
  const completion = await client.chat.completions.create({
    model: resolveModel(def),
    max_tokens: 4000,
    temperature: 0.3,
    messages: [{ role: "system", content: system }, ...messages],
  });
  return (completion.choices[0]?.message?.content ?? "").trim();
}
