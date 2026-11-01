import Anthropic from "@anthropic-ai/sdk";
import { NODE_KINDS } from "@/lib/nodeCatalog";
import { buildContext, coerceGraph, SYSTEM_TOOL, type AiInput, type AiResult } from "./prompt";
import { resolveModel, type ProviderDef } from "./providers";

const setDiagramTool: Anthropic.Tool = {
  name: "set_diagram",
  description:
    "Create or replace the full architecture diagram shown on the canvas. Provide the complete set of nodes and edges.",
  input_schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      rationale: { type: "string", description: "Brief explanation of the design and what changed." },
      nodes: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            id: { type: "string" },
            kind: { type: "string", enum: NODE_KINDS as unknown as string[] },
            label: { type: "string" },
            description: { type: "string" },
            tech: { type: "string", description: "Concrete technology, e.g. Postgres, Redis, Kafka" },
          },
          required: ["id", "kind", "label"],
        },
      },
      edges: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            source: { type: "string", description: "id of the source node" },
            target: { type: "string", description: "id of the target node" },
            label: { type: "string" },
          },
          required: ["source", "target"],
        },
      },
    },
    required: ["rationale", "nodes", "edges"],
  },
};

export async function runAnthropic(input: AiInput, def: ProviderDef): Promise<AiResult> {
  const client = new Anthropic();
  const contextBlock = buildContext(input.graph, input.requirements);

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: `Here is the current state of the design for context:\n\n${contextBlock}` },
    { role: "assistant", content: "Understood. I have the current design in mind." },
    ...input.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  const response = await client.messages.create({
    model: resolveModel(def),
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "high" },
    system: SYSTEM_TOOL,
    tools: [setDiagramTool],
    messages,
  });

  let text = "";
  let graph = null;
  let rationale = "";
  for (const block of response.content) {
    if (block.type === "text") {
      text += block.text;
    } else if (block.type === "tool_use" && block.name === "set_diagram") {
      const toolInput = block.input as { rationale?: string };
      rationale = toolInput.rationale ?? "";
      graph = coerceGraph(block.input);
    }
  }

  return { reply: text.trim() || rationale || "Done.", graph };
}
