import { useState } from "react";
import { Select } from "./ui/Select";
import { Tooltip } from "./ui/Tooltip";
import type { AppConfig, AspectRatio, ImageSize } from "../types";

export interface Settings {
  aspectRatio: AspectRatio;
  imageSize: ImageSize;
  numImages: number;
  includeCaption: boolean;
}

interface SettingsPanelProps {
  settings: Settings;
  onChange: (s: Settings) => void;
  config: AppConfig | null;
  disabled?: boolean;
}

const ASPECT_LABELS: Record<string, string> = {
  "1:1":  "1 : 1  — Square",
  "16:9": "16 : 9 — Landscape",
  "9:16": "9 : 16 — Portrait",
  "4:3":  "4 : 3  — Classic",
  "2:3":  "2 : 3  — Tall",
  "21:9": "21 : 9 — Ultrawide",
};

export function SettingsPanel({ settings, onChange, config, disabled }: SettingsPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const maxImages = config?.max_num_images ?? 4;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-3">
          Settings
        </p>

        <div className="flex flex-col gap-4">
          <Select
            label="Aspect Ratio"
            value={settings.aspectRatio}
            onChange={(e) => onChange({ ...settings, aspectRatio: e.target.value as AspectRatio })}
            disabled={disabled}
          >
            {(config?.aspect_ratios ?? ["1:1", "16:9", "9:16", "4:3", "2:3", "21:9"]).map((r) => (
              <option key={r} value={r}>
                {ASPECT_LABELS[r] ?? r}
              </option>
            ))}
          </Select>

          <Select
            label="Image Size"
            value={settings.imageSize}
            onChange={(e) => onChange({ ...settings, imageSize: e.target.value as ImageSize })}
            disabled={disabled}
          >
            <option value="auto">Auto (default)</option>
            <option value="1k">1K</option>
            <option value="2k">2K</option>
          </Select>

          {/* Number of images — N parallel generations */}
          <div className="flex flex-col gap-2">
            <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
              Variations
              <Tooltip content="Generates N independent images via parallel API calls. Not a single batched call — each is a separate generation.">
                <span className="ml-1.5 text-[var(--text-faint)] cursor-help">(?)</span>
              </Tooltip>
            </label>
            <div className="flex gap-1.5">
              {Array.from({ length: maxImages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => onChange({ ...settings, numImages: n })}
                  disabled={disabled}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-all duration-150 border
                    ${settings.numImages === n
                      ? "bg-[var(--banana)] text-zinc-900 border-[var(--banana)] shadow-[0_0_12px_rgba(245,197,24,0.25)]"
                      : "bg-[var(--surface-2)] text-zinc-400 border-[var(--border)] hover:text-zinc-100 hover:border-zinc-500"
                    } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Advanced */}
      <div>
        <button
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] hover:text-zinc-100 transition-colors w-full text-left"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <svg
            className={`w-3 h-3 transition-transform ${showAdvanced ? "rotate-90" : ""}`}
            viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Advanced
        </button>

        {showAdvanced && (
          <div className="mt-3 flex flex-col gap-3 pl-2 border-l border-[var(--border)]">
            {/* Include caption */}
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={settings.includeCaption}
                onChange={(e) => onChange({ ...settings, includeCaption: e.target.checked })}
                disabled={disabled}
                className="mt-0.5 w-4 h-4 rounded border-zinc-600 accent-[var(--banana)] cursor-pointer"
              />
              <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors leading-snug">
                Include caption
                <span className="block text-[var(--text-faint)] text-[10px] mt-0.5">
                  Requests a text description alongside the image
                </span>
              </span>
            </label>

            {/* Unsupported params — honest disclosure */}
            <div className="mt-1 p-3 bg-[var(--surface-2)] rounded-lg border border-dashed border-[var(--border)]">
              <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">
                Not supported by this API
              </p>
              {config && Object.entries(config.unsupported).map(([k, v]) => (
                <div key={k} className="flex items-start gap-2 mb-1.5 last:mb-0">
                  <span className="font-mono text-[10px] text-[var(--text-faint)] mt-0.5 shrink-0">—</span>
                  <div>
                    <span className="font-mono text-[10px] text-zinc-500">{k}: </span>
                    <span className="text-[10px] text-[var(--text-faint)]">{v}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
