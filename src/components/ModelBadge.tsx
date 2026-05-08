import type { AppConfig } from "../types";

interface ModelBadgeProps {
  config: AppConfig | null;
}

export function ModelBadge({ config }: ModelBadgeProps) {
  if (!config) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-overlay">
        <span className="w-1.5 h-1.5 rounded-full bg-on-variant anim-pulse" />
        <span className="font-mono text-[10px] text-on-variant">connecting</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full glass-overlay backdrop-blur-glass">
      <span className="relative flex w-1.5 h-1.5">
        <span className="absolute inline-flex w-full h-full rounded-full bg-secondary opacity-60 anim-pulse" />
        <span className="relative inline-flex w-1.5 h-1.5 rounded-full bg-secondary shadow-glow-cyan" />
      </span>
      <span className="font-mono text-[10px] tracking-wide text-on-surface/85">
        {config.models.image}
      </span>
    </div>
  );
}
