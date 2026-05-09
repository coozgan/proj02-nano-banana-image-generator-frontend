import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { PromptPanel } from "./components/PromptPanel";
import { SettingsPanel, type Settings } from "./components/SettingsPanel";
import { ReferenceImagesPanel } from "./components/ReferenceImagesPanel";
import { ResultGallery } from "./components/ResultGallery";
import { ModelBadge } from "./components/ModelBadge";
import { Logo } from "./components/ui/Logo";
import { ToastContainer, type ToastMessage } from "./components/ui/Toast";
import { useEnhance } from "./hooks/useEnhance";
import { useGenerate } from "./hooks/useGenerate";
import { useGenerationHistory } from "./hooks/useGenerationHistory";
import type { AppConfig, ReferenceImage } from "./types";

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
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const history = useGenerationHistory();

  const addToast = useCallback((message: string, type: ToastMessage["type"] = "error") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    api.getConfig().then(setConfig).catch(() => {});
  }, []);

  const { enhance, loading: enhancing, error: enhanceError } = useEnhance();
  const { generate, loading: generating, error: generateError, pendingCount } = useGenerate({
    onPersisted: history.refresh,
    onWarnings: (warnings) => warnings.forEach((w) => addToast(w, "warning")),
  });

  useEffect(() => { if (enhanceError) addToast(enhanceError, "error"); }, [enhanceError, addToast]);
  useEffect(() => { if (generateError) addToast(generateError, "error"); }, [generateError, addToast]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const handleEnhance = async () => {
    const invalid = referenceImages.find((img) => img.error);
    if (invalid) {
      addToast(`Fix or remove "${invalid.file.name}" before improving`, "error");
      return;
    }
    const enhanced = await enhance(prompt, undefined, referenceImages);
    if (enhanced) {
      setPrompt(enhanced);
      const note = referenceImages.length > 0
        ? `Prompt improved using ${referenceImages.length} reference image${referenceImages.length === 1 ? "" : "s"}`
        : "Prompt improved";
      addToast(note, "success");
    }
  };

  const handleGenerate = () => {
    const invalid = referenceImages.find((img) => img.error);
    if (invalid) {
      addToast(`Fix or remove "${invalid.file.name}" before generating`, "error");
      return;
    }
    generate(
      {
        prompt,
        negative_prompt: negativePrompt || undefined,
        aspect_ratio: settings.aspectRatio,
        image_size: settings.imageSize,
        num_images: settings.numImages,
        include_caption: settings.includeCaption,
      },
      referenceImages,
      settings
    );
  };

  const handleClearHistory = () => {
    if (history.total === 0) return;
    if (window.confirm(`Delete all ${history.total} saved generations? This can't be undone.`)) {
      void history.clearHistory();
      addToast("History cleared", "success");
    }
  };

  const settingsContent = (
    <SettingsPanel
      settings={settings}
      onChange={setSettings}
      config={config}
      disabled={enhancing || generating}
    />
  );

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg-base/70 backdrop-blur-glass border-b border-outline-variant/40">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5 group">
            <Logo size={22} className="text-primary group-hover:text-primary-container transition-colors" />
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-[19px] tracking-tight text-on-surface leading-none">
                Nano Banana
              </span>
              <span className="hidden sm:inline-block w-px h-3 bg-outline-variant" aria-hidden />
              <span className="hidden sm:inline-block label-caps">Image Studio</span>
            </div>
          </a>

          <div className="flex items-center gap-3">
            <ModelBadge config={config} />
            <button
              onClick={() => setDrawerOpen(true)}
              className="lg:hidden w-9 h-9 rounded-lg glass-overlay text-on-surface hover:border-primary/40 flex items-center justify-center transition-colors"
              aria-label="Open settings"
            >
              <span className="icon text-[18px]">tune</span>
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 relative z-10">
        <div className="flex gap-6 lg:gap-10 items-start">
          {/* Desktop sidebar — settings */}
          <aside className="hidden lg:block w-[280px] shrink-0 sticky top-[80px] anim-mount anim-delay-100">
            <div className="glass-panel p-5">
              <div className="flex items-center justify-between mb-5">
                <span className="label-caps">Settings</span>
              </div>
              {settingsContent}
            </div>

            <div className="mt-4 px-4 py-3 rounded-xl glass-overlay">
              <p className="label-caps mb-1.5">Tip</p>
              <p className="text-[11px] text-on-variant leading-relaxed">
                Use <span className="text-primary">Improve</span> for vague ideas — it adds composition, lighting, and stylistic details.
              </p>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 flex flex-col gap-6 sm:gap-8">
            <section className="anim-mount anim-delay-200">
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

            <section className="anim-mount anim-delay-300">
              <ReferenceImagesPanel
                images={referenceImages}
                onChange={setReferenceImages}
                disabled={enhancing || generating}
              />
            </section>

            <section className="anim-mount anim-delay-400">
              <ResultGallery
                items={history.items}
                pendingCount={pendingCount}
                hasMore={history.hasMore}
                loadingMore={history.loadingMore}
                onLoadMore={history.loadMore}
                onClearAll={handleClearHistory}
                onPromptSelect={setPrompt}
                onDelete={history.remove}
              />
            </section>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-outline-variant/40 mt-12 relative z-10">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo size={14} className="text-on-variant/60" />
            <span className="label-caps">Nano Banana · Internal Use</span>
          </div>
          {config && (
            <div className="flex items-center gap-3 text-[10px] font-mono text-on-variant/55">
              <span>image · <span className="text-on-variant/80">{config.models.image}</span></span>
              <span className="w-1 h-1 rounded-full bg-on-variant/30" />
              <span>enhance · <span className="text-on-variant/80">{config.models.enhance}</span></span>
            </div>
          )}
        </div>
      </footer>

      {/* Mobile settings drawer */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-bg-base/70 backdrop-blur-sm anim-fadein"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="absolute inset-y-0 right-0 w-[88%] max-w-[360px] glass-panel border-l border-white/10 rounded-none rounded-l-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-bg-surface/80 backdrop-blur-glass border-b border-outline-variant/40">
              <span className="label-caps">Settings</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 rounded-lg glass-overlay text-on-surface hover:border-primary/40 flex items-center justify-center"
                aria-label="Close settings"
              >
                <span className="icon text-[18px]">close</span>
              </button>
            </div>
            <div className="p-5">{settingsContent}</div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
