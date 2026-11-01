import type { AiInput, AiResult } from "./prompt";
import { runAnthropic } from "./anthropic";
import { runOpenAiCompatible } from "./openaiCompat";
import { selectProvider } from "./providers";

export type { AiInput, AiResult } from "./prompt";
export { selectProvider, PROVIDERS, PROVIDER_ORDER } from "./providers";
export type { ProviderId, ProviderDef } from "./providers";

export async function runAi(input: AiInput): Promise<AiResult> {
  const def = selectProvider();
  if (!def) throw new Error("no-provider");
  if (def.kind === "anthropic") return runAnthropic(input, def);
  return runOpenAiCompatible(input, def);
}
