// Registry of supported AI providers. Everything is configured via env so the
// user can enable any subset by setting the matching key(s). Anthropic uses its
// own SDK; the rest are OpenAI-compatible and share one runner.

export type ProviderId = "anthropic" | "openai" | "nvidia" | "gemini" | "deepseek";
export type ProviderKind = "anthropic" | "openai-compatible";

export interface ProviderDef {
  id: ProviderId;
  label: string;
  kind: ProviderKind;
  // Env var names that supply the API key (first one set wins).
  keyEnvs: string[];
  // Env var to override the model, and the default if unset.
  modelEnv: string;
  defaultModel: string;
  // For OpenAI-compatible providers: base URL + optional env override.
  baseUrl?: string;
  baseUrlEnv?: string;
}

export const PROVIDERS: Record<ProviderId, ProviderDef> = {
  anthropic: {
    id: "anthropic",
    label: "Anthropic",
    kind: "anthropic",
    keyEnvs: ["ANTHROPIC_API_KEY"],
    modelEnv: "ANTHROPIC_MODEL",
    defaultModel: "claude-opus-4-8",
  },
  openai: {
    id: "openai",
    label: "OpenAI",
    kind: "openai-compatible",
    keyEnvs: ["OPENAI_API_KEY"],
    modelEnv: "OPENAI_MODEL",
    defaultModel: "gpt-4o",
    baseUrlEnv: "OPENAI_BASE_URL", // undefined baseUrl → SDK default api.openai.com/v1
  },
  nvidia: {
    id: "nvidia",
    label: "NVIDIA",
    kind: "openai-compatible",
    keyEnvs: ["NVIDIA_API_KEY", "NVDIA_API_KEY"], // tolerate the earlier misspelling
    modelEnv: "NVIDIA_MODEL",
    defaultModel: "nvidia/nemotron-3.5-lightning-30b-a3b",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    baseUrlEnv: "NVIDIA_BASE_URL",
  },
  gemini: {
    id: "gemini",
    label: "Google Gemini",
    kind: "openai-compatible",
    keyEnvs: ["GEMINI_API_KEY", "GOOGLE_API_KEY"],
    modelEnv: "GEMINI_MODEL",
    defaultModel: "gemini-2.0-flash",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/openai",
    baseUrlEnv: "GEMINI_BASE_URL",
  },
  deepseek: {
    id: "deepseek",
    label: "DeepSeek",
    kind: "openai-compatible",
    keyEnvs: ["DEEPSEEK_API_KEY"],
    modelEnv: "DEEPSEEK_MODEL",
    defaultModel: "deepseek-chat",
    baseUrl: "https://api.deepseek.com",
    baseUrlEnv: "DEEPSEEK_BASE_URL",
  },
};

// Priority order for auto-selection when AI_PROVIDER isn't set: first provider
// with a configured key wins.
export const PROVIDER_ORDER: ProviderId[] = ["anthropic", "openai", "gemini", "deepseek", "nvidia"];

export function providerKey(def: ProviderDef): string | undefined {
  for (const name of def.keyEnvs) {
    const v = process.env[name];
    if (v) return v;
  }
  return undefined;
}

export function hasKey(def: ProviderDef): boolean {
  return Boolean(providerKey(def));
}

export function resolveModel(def: ProviderDef): string {
  return process.env[def.modelEnv] || def.defaultModel;
}

export function resolveBaseUrl(def: ProviderDef): string | undefined {
  if (def.baseUrlEnv && process.env[def.baseUrlEnv]) return process.env[def.baseUrlEnv];
  return def.baseUrl;
}

function isProviderId(v: string): v is ProviderId {
  return v in PROVIDERS;
}

// Pick the active provider: explicit AI_PROVIDER wins (if its key is set),
// otherwise the first configured provider in PROVIDER_ORDER.
export function selectProvider(): ProviderDef | null {
  const override = process.env.AI_PROVIDER?.toLowerCase().trim();
  if (override && isProviderId(override)) {
    const def = PROVIDERS[override];
    return hasKey(def) ? def : null;
  }
  for (const id of PROVIDER_ORDER) {
    const def = PROVIDERS[id];
    if (hasKey(def)) return def;
  }
  return null;
}
