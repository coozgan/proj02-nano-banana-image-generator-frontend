interface EmptyStateProps {
  onPromptSelect?: (prompt: string) => void;
}

const EXAMPLE_PROMPTS = [
  "Editorial portrait of a botanist in a glass conservatory, golden hour, 35mm film",
  "Minimalist product shot of a ceramic vase on travertine, soft window light",
  "Cinematic still: empty Tokyo subway platform at 2am, neon signage, anamorphic",
  "Architectural rendering of a modernist cabin in fog, brutalist concrete",
];

export function EmptyState({ onPromptSelect }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center anim-mount">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl glass-panel flex items-center justify-center">
          <span className="icon text-[32px] text-primary">auto_awesome</span>
        </div>
        <div className="absolute -inset-3 rounded-3xl bg-primary/10 blur-2xl -z-10" />
      </div>

      <h3 className="font-display text-2xl text-on-surface mb-2 tracking-tight">
        A blank canvas awaits
      </h3>
      <p className="text-sm text-on-variant max-w-[440px] leading-relaxed mb-8">
        Describe what you'd like to see, optionally improve the prompt with AI, then generate.
        Try one of these to start —
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl w-full">
        {EXAMPLE_PROMPTS.map((p, i) => (
          <button
            key={i}
            onClick={() => onPromptSelect?.(p)}
            className="group text-left text-xs text-on-variant leading-relaxed
                       glass-overlay rounded-lg px-3.5 py-3
                       hover:border-primary/40 hover:text-on-surface hover:bg-bg-surface-high/60
                       transition-all duration-150"
          >
            <span className="block label-caps text-on-variant/60 group-hover:text-primary mb-1.5 transition-colors">
              {String(i + 1).padStart(2, "0")} · try
            </span>
            "{p}"
          </button>
        ))}
      </div>
    </div>
  );
}
