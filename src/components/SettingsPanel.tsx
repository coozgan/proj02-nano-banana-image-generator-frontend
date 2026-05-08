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

const RATIO_DIMS: Record<string, { w: number; h: number; label: string }> = {
  "1:1":  { w: 14, h: 14, label: "Square" },
  "16:9": { w: 22, h: 12, label: "Wide" },
  "9:16": { w: 10, h: 18, label: "Tall" },
  "4:3":  { w: 18, h: 14, label: "Classic" },
  "2:3":  { w: 12, h: 18, label: "Portrait" },
  "21:9": { w: 24, h: 10, label: "Cinema" },
};

export function SettingsPanel({ settings, onChange, config, disabled }: SettingsPanelProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const maxImages = config?.max_num_images ?? 4;
  const ratios = config?.aspect_ratios ?? Object.keys(RATIO_DIMS);

  return (
    <div className="flex flex-col gap-6">
      {/* Aspect ratio picker */}
      <div className="flex flex-col gap-2.5">
        <label className="label-caps">Aspect</label>
        <div className="grid grid-cols-3 gap-1.5">
          {ratios.map((r) => {
            const dim = RATIO_DIMS[r] ?? { w: 16, h: 16, label: r };
            const active = settings.aspectRatio === r;
            return (
              <button
                key={r}
                onClick={() => onChange({ ...settings, aspectRatio: r as AspectRatio })}
                disabled={disabled}
                title={`${r} — ${dim.label}`}
                className={`group relative h-14 rounded-lg flex flex-col items-center justify-center gap-1
                  transition-all duration-150 border
                  ${active
                    ? "border-primary bg-primary/15 shadow-glow"
                    : "glass-overlay hover:border-primary/40 hover:bg-bg-surface-high/60"}
                  disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <div
                  className={`border ${active ? "border-primary bg-primary/20" : "border-on-variant/50 bg-transparent"}`}
                  style={{ width: dim.w, height: dim.h, borderRadius: 1.5 }}
                />
                <span className={`font-mono text-[9px] tracking-wider ${active ? "text-primary" : "text-on-variant/70"}`}>
                  {r}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Variations */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label className="label-caps">Variations</label>
          <Tooltip
            side="bottom"
            content="Generates N independent images via parallel API calls. Not a single batched call — each is a separate generation."
          >
            <span className="icon text-[14px] text-on-variant/60 cursor-help">info</span>
          </Tooltip>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: maxImages }, (_, i) => i + 1).map((n) => {
            const active = settings.numImages === n;
            return (
              <button
                key={n}
                onClick={() => onChange({ ...settings, numImages: n })}
                disabled={disabled}
                className={`h-10 rounded-lg text-sm font-medium transition-all duration-150 border
                  ${active
                    ? "border-primary bg-primary text-primary-on shadow-glow-lg"
                    : "glass-overlay text-on-variant hover:border-primary/40 hover:text-on-surface"}
                  disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resolution */}
      <Select
        label="Resolution"
        value={settings.imageSize}
        onChange={(e) => onChange({ ...settings, imageSize: e.target.value as ImageSize })}
        disabled={disabled}
      >
        <option value="auto">Auto · model default</option>
        <option value="1k">1K · faster</option>
        <option value="2k">2K · sharper</option>
      </Select>

      <div className="h-px bg-outline-variant/30" />

      {/* Advanced */}
      <div>
        <button
          className="flex items-center gap-2 label-caps hover:text-on-surface transition-colors w-full text-left"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <span className={`icon text-[14px] transition-transform duration-200 ${showAdvanced ? "rotate-90" : ""}`}>
            chevron_right
          </span>
          Advanced
        </button>

        {showAdvanced && (
          <div className="mt-4 flex flex-col gap-4 anim-fadein">
            {/* Caption toggle */}
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <span className={`relative w-9 h-[20px] rounded-full transition-colors duration-150 shrink-0 mt-0.5 ${
                settings.includeCaption ? "bg-primary shadow-glow" : "bg-outline-variant"
              }`}>
                <input
                  type="checkbox"
                  checked={settings.includeCaption}
                  onChange={(e) => onChange({ ...settings, includeCaption: e.target.checked })}
                  disabled={disabled}
                  className="sr-only"
                />
                <span
                  className={`absolute top-[2px] w-4 h-4 rounded-full bg-bg-base transition-all duration-200 ${
                    settings.includeCaption ? "left-[18px]" : "left-[2px]"
                  }`}
                />
              </span>
              <span className="text-xs text-on-variant group-hover:text-on-surface transition-colors leading-snug">
                Include caption
                <span className="block text-on-variant/60 text-[10px] mt-0.5">
                  Adds <code className="font-mono">TEXT</code> response modality
                </span>
              </span>
            </label>

            {/* Honest disclosure */}
            {config && (
              <div className="p-3 rounded-lg glass-overlay border-dashed">
                <p className="label-caps mb-2">Not in this API</p>
                <ul className="space-y-1.5">
                  {Object.entries(config.unsupported).map(([k, v]) => (
                    <li key={k} className="flex items-start gap-2">
                      <span className="font-mono text-[10px] text-on-variant/50 mt-0.5 shrink-0">—</span>
                      <span className="text-[10px] text-on-variant/75 leading-relaxed">
                        <code className="text-secondary font-mono">{k}</code> · {v}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
