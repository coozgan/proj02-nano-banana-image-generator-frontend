import { useState } from "react";
import { api } from "../api";
import { addRecord, recordFromImage } from "../lib/historyDb";
import type { Settings } from "../components/SettingsPanel";
import type { GenerateImageRequest, ReferenceImage } from "../types";

interface UseGenerateOptions {
  onPersisted?: () => void;
  onWarnings?: (warnings: string[]) => void;
}

interface UseGenerateResult {
  generate: (req: GenerateImageRequest, refs: ReferenceImage[], settings: Settings) => Promise<void>;
  loading: boolean;
  error: string | null;
  pendingCount: number;
}

export function useGenerate({ onPersisted, onWarnings }: UseGenerateOptions = {}): UseGenerateResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  async function generate(
    req: GenerateImageRequest,
    referenceImages: ReferenceImage[],
    settings: Settings
  ): Promise<void> {
    setLoading(true);
    setError(null);
    setPendingCount(req.num_images ?? 1);
    try {
      const res = await api.generateImage(req, referenceImages);
      if (res.warnings.length > 0) onWarnings?.(res.warnings);
      await Promise.all(
        res.images.map((img) =>
          addRecord(recordFromImage(img, req.prompt, settings, res.model, req.negative_prompt))
        )
      );
      onPersisted?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      setError(msg);
    } finally {
      setLoading(false);
      setPendingCount(0);
    }
  }

  return { generate, loading, error, pendingCount };
}
