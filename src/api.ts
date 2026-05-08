import type {
  GenerateImageRequest,
  GenerateImageResponse,
  EnhancePromptResponse,
  AppConfig,
  ApiError,
  ReferenceImage,
} from "./types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const TOKEN = import.meta.env.VITE_INTERNAL_TOKEN ?? "";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
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
      headers: { "Content-Type": "application/json" },
    });
  },

  generateImage(
    req: GenerateImageRequest,
    referenceImages: ReferenceImage[] = []
  ): Promise<GenerateImageResponse> {
    if (referenceImages.length === 0) {
      // No reference images — send as plain JSON (simpler, easier to debug)
      return apiFetch<GenerateImageResponse>("/api/generate-image", {
        method: "POST",
        body: JSON.stringify(req),
        headers: { "Content-Type": "application/json" },
      });
    }

    // Reference images present — send as multipart/form-data.
    // Files are streamed from the browser's File objects; no client-side base64 encoding needed.
    // Do NOT set Content-Type manually — browser sets it with the correct boundary.
    const form = new FormData();
    form.append("prompt", req.prompt);
    if (req.negative_prompt) form.append("negative_prompt", req.negative_prompt);
    if (req.aspect_ratio) form.append("aspect_ratio", req.aspect_ratio);
    if (req.image_size) form.append("image_size", req.image_size);
    if (req.num_images != null) form.append("num_images", String(req.num_images));
    if (req.include_caption != null) form.append("include_caption", String(req.include_caption));

    // Append files in user-supplied order — order is preserved in FormData iteration
    for (const ref of referenceImages) {
      form.append("reference_image", ref.file, ref.file.name);
    }

    return apiFetch<GenerateImageResponse>("/api/generate-image", {
      method: "POST",
      body: form,
      // No Content-Type header — browser sets multipart/form-data with boundary automatically
    });
  },
};
