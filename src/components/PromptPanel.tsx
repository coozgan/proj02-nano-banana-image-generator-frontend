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
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const canGenerate = prompt.trim().length > 0;
  const isWorking = enhancing || generating;

  return (
    <div className="flex flex-col gap-3">
      {/* Main prompt */}
      <div className="card overflow-hidden focus-within:border-[var(--banana)] focus-within:banana-glow transition-all duration-200">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe the image you want to generate…"
          rows={5}
          disabled={isWorking}
          className="w-full bg-transparent px-4 py-3.5 text-sm text-zinc-100 placeholder:text-[var(--text-faint)] resize-none focus:outline-none disabled:opacity-60 leading-relaxed"
        />

        {/* Prompt toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-[var(--border)] bg-[var(--surface-2)]">
          <span className="font-mono text-[10px] text-[var(--text-faint)]">
            {prompt.length} / 2000
          </span>
          <div className="flex items-center gap-1">
            <Tooltip content="Copy prompt text">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                disabled={!prompt || isWorking}
                className="text-[10px] gap-1"
              >
                {copied ? (
                  <>
                    <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 8l3.5 3.5L13 4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Copied
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="5" y="5" width="9" height="9" rx="1.5"/>
                      <path d="M11 5V3.5A1.5 1.5 0 009.5 2h-6A1.5 1.5 0 002 3.5v6A1.5 1.5 0 003.5 11H5"/>
                    </svg>
                    Copy
                  </>
                )}
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Negative prompt */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
            Negative Prompt
          </label>
          <Tooltip content={config?.unsupported?.negative_prompt ?? "Injected as 'Avoid: …' prefix in the prompt. Gemini has no native negative-prompt parameter."}>
            <span className="font-mono text-[10px] text-[var(--text-faint)] cursor-help">(?)</span>
          </Tooltip>
        </div>
        <input
          type="text"
          value={negativePrompt}
          onChange={(e) => onNegativePromptChange(e.target.value)}
          placeholder="blurry, watermark, text, low quality…"
          disabled={isWorking}
          maxLength={500}
          className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-1 focus:ring-[var(--banana)] focus:border-[var(--banana)] transition-colors disabled:opacity-60"
        />
      </div>

      {/* Action row */}
      <div className="flex items-center gap-2 pt-1">
        <Tooltip content={`Rewrite your prompt using ${config?.models?.enhance ?? "Gemini Flash Lite"} for richer, more detailed output`}>
          <Button
            variant="secondary"
            size="md"
            onClick={onEnhance}
            loading={enhancing}
            disabled={!canGenerate || isWorking}
            className="flex-shrink-0"
          >
            {!enhancing && (
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 8h3M8 2v3M14 8h-3M8 14v-3" strokeLinecap="round"/>
                <circle cx="8" cy="8" r="2.5"/>
              </svg>
            )}
            Improve Prompt
          </Button>
        </Tooltip>

        <Button
          variant="primary"
          size="md"
          onClick={onGenerate}
          loading={generating}
          disabled={!canGenerate || isWorking}
          className="flex-1"
        >
          {!generating && (
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M2 13L8 3l6 10H2z" strokeLinejoin="round"/>
            </svg>
          )}
          Generate
        </Button>
      </div>
    </div>
  );
}
