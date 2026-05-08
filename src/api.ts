import type {
  GenerateImageRequest,
  GenerateImageResponse,
  EnhancePromptResponse,
  AppConfig,
  ApiError,
} from "./types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const TOKEN = import.meta.env.VITE_INTERNAL_TOKEN ?? "";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Internal-Token": TOKEN,
      ...(options?.headers ?? {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = data as ApiError;
    throw Object.assign(new Error(err.message ?? `HTTP ${res.status}`), {
      code: err.code ?? "UNKNOWN",
      request_id: err.request_id,
      status: res.status,
    });
  }

  return data as T;
}

export const api = {
  getConfig(): Promise<AppConfig> {
    return apiFetch<AppConfig>("/config");
  },

  enhancePrompt(prompt: string, style?: string): Promise<EnhancePromptResponse> {
    return apiFetch<EnhancePromptResponse>("/api/enhance-prompt", {
      method: "POST",
      body: JSON.stringify({ prompt, style }),
    });
  },

  generateImage(req: GenerateImageRequest): Promise<GenerateImageResponse> {
    return apiFetch<GenerateImageResponse>("/api/generate-image", {
      method: "POST",
      body: JSON.stringify(req),
    });
  },
};
