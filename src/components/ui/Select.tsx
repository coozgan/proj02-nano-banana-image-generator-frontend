import clsx from "clsx";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export function Select({ label, className, children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={clsx(
            "w-full appearance-none bg-[var(--surface-2)] border border-[var(--border)] rounded-lg",
            "text-sm text-zinc-100 px-3 py-2 pr-8",
            "focus:outline-none focus:ring-1 focus:ring-[var(--banana)] focus:border-[var(--banana)]",
            "transition-colors cursor-pointer",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
