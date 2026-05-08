export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center select-none">
      {/* Decorative banana glyph */}
      <div className="w-16 h-16 mb-6 relative">
        <div className="w-16 h-16 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] flex items-center justify-center">
          <span className="text-3xl" role="img" aria-label="banana">🍌</span>
        </div>
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-[var(--banana)] to-transparent opacity-10 pointer-events-none" />
      </div>

      <h3 className="font-serif text-2xl text-zinc-300 mb-2">
        Describe an image
      </h3>
      <p className="text-sm text-[var(--text-muted)] max-w-[280px] leading-relaxed">
        Write a prompt, optionally improve it with AI, then generate.
        Images stay here for the session.
      </p>

      <div className="mt-8 flex items-center gap-4 text-xs text-[var(--text-faint)]">
        <span className="flex items-center gap-1.5">
          <span className="font-mono bg-[var(--surface-2)] border border-[var(--border)] px-1.5 py-0.5 rounded">⌘</span>
          <span>write a prompt to start</span>
        </span>
      </div>
    </div>
  );
}
