import { useState } from "react";
import { api } from "../api";
import type { ReferenceImage } from "../types";

interface UseEnhanceResult {
  enhance: (
    prompt: string,
    style?: string,
    referenceImages?: ReferenceImage[]
  ) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export function useEnhance(): UseEnhanceResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enhance(
    prompt: string,
    style?: string,
    referenceImages?: ReferenceImage[]
  ): Promise<string | null> {
    setLoading(true);
    setError(null);
    try {
      const valid = (referenceImages ?? []).filter((img) => !img.error);
      const res = await api.enhancePrompt(prompt, style, valid);
      return res.enhanced_prompt;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Enhance failed";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { enhance, loading, error };
}
