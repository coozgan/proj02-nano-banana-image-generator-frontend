import { useState } from "react";
import { api } from "../api";

interface UseEnhanceResult {
  enhance: (prompt: string, style?: string) => Promise<string | null>;
  loading: boolean;
  error: string | null;
}

export function useEnhance(): UseEnhanceResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enhance(prompt: string, style?: string): Promise<string | null> {
    setLoading(true);
    setError(null);
    try {
      const res = await api.enhancePrompt(prompt, style);
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
