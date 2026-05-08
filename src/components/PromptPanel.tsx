import { useRef, useState } from "react";
import { Button } from "./ui/Button";
import { Tooltip } from "./ui/Tooltip";
import type { AppConfig } from "../types";

interface PromptPanelProps {
  prompt: string;
  onPromptChange: (v: string) => void;
  negativePrompt: string;
  onNegativePromptChange: (v: string) => void;
  onEnhance: () => void;
  onGenerate: () => void;
  enhancing: boolean;
  generating: boolean;
  config: AppConfig | null;
}

export function PromptPanel({
  prompt,
  onPromptChange,
  negativePrompt,
  onNegativePromptChange,
  onEnhance,
  onGenerate,
  enhancing,
  generating,
  config,
}: PromptPanelProps) {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const canGenerate = prompt.trim().length > 0;
  const isWorking = enhancing || generating;

  return (
    <div className="glass-panel p-5 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="label-caps">Prompt</span>
        <span className="font-mono text-[10px] text-on-variant/60">
          {prompt.length} / 2000
        </span>
      </div>

      {/* Positive prompt */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe what you want to see — subject, style, lighting, mood…"
          rows={5}
          disabled={isWorking}
          maxLength={2000}
          className="w-full input-recessed px-4 py-3 pr-28 text-[15px] leading-relaxed
                     resize-none disabled:opacity-60 font-sans"
        />

        {/* Floating Improve button */}
        <div className="absolute top-2.5 right-2.5">
          <Tooltip content={`Rewrite your prompt with ${config?.models?.enhance ?? "Gemini Flash"}. Returns a richer, more detailed version.`}>
            <button
              onClick={onEnhance}
              disabled={!canGenerate || isWorking}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                         bg-primary/15 text-primary border border-primary/30
                         hover:bg-primary/25 hover:border-primary/50
                         disabled:opacity-30 disabled:cursor-not-allowed
                         transition-all text-[11px] font-medium"
            >
              {enhancing ? (
                <span className="icon text-[14px] anim-spin">progress_activity</span>
              ) : (
                <span className="icon text-[14px]">auto_fix_high</span>
              )}
              Improve
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Toolbar under textarea */}
      <div className="flex items-center justify-between -mt-2">
        <button
          onClick={handleCopy}
          disabled={!prompt}
          className="flex items-center gap-1.5 label-caps
                     hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed
                     transition-colors"
        >
          {copied ? (
            <>
              <span className="icon text-[12px] text-success">check</span>
              Copied
            </>
          ) : (
            <>
              <span className="icon text-[12px]">content_copy</span>
              Copy
            </>
          )}
        </button>
        {prompt.length > 0 && (
          <button
            onClick={() => onPromptChange("")}
            disabled={isWorking}
            className="label-caps hover:text-on-surface
                       disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Negative prompt */}
      <div className="flex items-center gap-2.5 input-recessed px-3 py-2">
        <span className="label-caps shrink-0">Avoid</span>
        <input
          type="text"
          value={negativePrompt}
          onChange={(e) => onNegativePromptChange(e.target.value)}
          placeholder="blurry, watermark, text, low quality…"
          disabled={isWorking}
          maxLength={500}
          className="flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-variant/40
                     focus:outline-none disabled:opacity-60"
        />
        <Tooltip
          side="bottom"
          content={config?.unsupported?.negative_prompt ?? "Gemini has no native negative-prompt parameter. Injected as 'Avoid: ...' prefix in the prompt text."}
        >
          <span className="icon text-[14px] text-on-variant/60 cursor-help">info</span>
        </Tooltip>
      </div>

      {/* Primary action */}
      <Button
        variant="primary"
        size="lg"
        onClick={onGenerate}
        loading={generating}
        disabled={!canGenerate || isWorking}
        className="w-full"
      >
        {!generating && <span className="icon text-[18px]">auto_awesome</span>}
        <span>Generate Image</span>
        <span className="font-mono text-[10px] uppercase tracking-widest opacity-60 ml-1">⏎</span>
      </Button>
    </div>
  );
}
