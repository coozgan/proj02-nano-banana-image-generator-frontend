import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { PromptPanel } from "./components/PromptPanel";
import { SettingsPanel, type Settings } from "./components/SettingsPanel";
import { ResultGallery } from "./components/ResultGallery";
import { ModelBadge } from "./components/ModelBadge";
import { ToastContainer, type ToastMessage } from "./components/ui/Toast";
import { useEnhance } from "./hooks/useEnhance";
import { useGenerate } from "./hooks/useGenerate";
import type { AppConfig, GalleryItem } from "./types";

const DEFAULT_SETTINGS: Settings = {
  aspectRatio: "1:1",
  imageSize: "auto",
  numImages: 1,
  includeCaption: false,
};

export default function App() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: ToastMessage["type"] = "error") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load config on mount
  useEffect(() => {
    api.getConfig()
      .then(setConfig)
      .catch(() => {}); // non-fatal; UI uses sensible defaults
  }, []);

  const { enhance, loading: enhancing, error: enhanceError } = useEnhance();
  const { generate, loading: generating, error: generateError, pendingCount } = useGenerate(
    (items) => setGallery((prev) => [...prev, ...items]),
    (warnings) => warnings.forEach((w) => addToast(w, "warning"))
  );

  // Surface errors as toasts
  useEffect(() => {
    if (enhanceError) addToast(enhanceError, "error");
  }, [enhanceError, addToast]);

  useEffect(() => {
    if (generateError) addToast(generateError, "error");
  }, [generateError, addToast]);

  const handleEnhance = async () => {
    const enhanced = await enhance(prompt);
    if (enhanced) {
      setPrompt(enhanced);
      addToast("Prompt improved!", "success");
    }
  };

  const handleGenerate = () => {
    generate({
      prompt,
      negative_prompt: negativePrompt || undefined,
      aspect_ratio: settings.aspectRatio,
      image_size: settings.imageSize,
      num_images: settings.numImages,
      include_caption: settings.includeCaption,
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--surface-0)]/90 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl" role="img" aria-label="banana">🍌</span>
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-xl text-zinc-100 leading-none">Nano Banana</span>
              <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-widest uppercase">
                Image Generator
              </span>
            </div>
          </div>
          <ModelBadge config={config} />
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 max-w-screen-xl mx-auto w-full px-6 py-8">
        <div className="flex gap-8 items-start">

          {/* Left sidebar — settings */}
          <aside className="w-64 shrink-0 sticky top-[4.5rem]">
            <div className="card p-5">
              <SettingsPanel
                settings={settings}
                onChange={setSettings}
                config={config}
                disabled={enhancing || generating}
              />
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 flex flex-col gap-6">
            {/* Prompt area */}
            <section>
              <PromptPanel
                prompt={prompt}
                onPromptChange={setPrompt}
                negativePrompt={negativePrompt}
                onNegativePromptChange={setNegativePrompt}
                onEnhance={handleEnhance}
                onGenerate={handleGenerate}
                enhancing={enhancing}
                generating={generating}
                config={config}
              />
            </section>

            {/* Divider */}
            {(gallery.length > 0 || pendingCount > 0) && (
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="font-mono text-[10px] text-[var(--text-faint)] uppercase tracking-widest">
                  Results
                </span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>
            )}

            {/* Gallery */}
            <section>
              <ResultGallery
                items={gallery}
                pendingCount={pendingCount}
                onClearAll={() => setGallery([])}
              />
            </section>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-auto">
        <div className="max-w-screen-xl mx-auto px-6 h-10 flex items-center justify-between">
          <span className="font-mono text-[10px] text-[var(--text-faint)]">
            Internal use only · {gallery.length} image{gallery.length !== 1 ? "s" : ""} this session
          </span>
          {config && (
            <span className="font-mono text-[10px] text-[var(--text-faint)]">
              enhance: {config.models.enhance}
            </span>
          )}
        </div>
      </footer>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
