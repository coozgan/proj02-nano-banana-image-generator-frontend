import type { AppConfig } from "../types";

interface ModelBadgeProps {
  config: AppConfig | null;
}

export function ModelBadge({ config }: ModelBadgeProps) {
  if (!config) return null;
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-full px-2.5 py-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono text-[10px] text-[var(--text-muted)] truncate max-w-[180px]">
          {config.models.image}
        </span>
      </div>
    </div>
  );
}
