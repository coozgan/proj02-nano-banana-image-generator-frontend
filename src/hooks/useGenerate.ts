import { useState } from "react";
import { api } from "../api";
import type { GalleryItem, GenerateImageRequest } from "../types";

interface UseGenerateResult {
  generate: (req: GenerateImageRequest) => Promise<void>;
  loading: boolean;
  error: string | null;
  pendingCount: number;
}

export function useGenerate(
  onImages: (items: GalleryItem[]) => void,
  onWarnings: (warnings: string[]) => void
): UseGenerateResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  async function generate(req: GenerateImageRequest): Promise<void> {
    setLoading(true);
    setError(null);
    setPendingCount(req.num_images ?? 1);
    try {
      const res = await api.generateImage(req);
      if (res.warnings.length > 0) onWarnings(res.warnings);
      const items: GalleryItem[] = res.images.map((img) => ({
        id: crypto.randomUUID(),
        image: img,
        prompt: req.prompt,
        timestamp: new Date(),
      }));
      onImages(items);
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
