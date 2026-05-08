import clsx from "clsx";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
}

export function Select({ label, hint, className, children, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="label-caps">{label}</label>}
      <div className="relative">
        <select
          className={clsx(
            "w-full appearance-none cursor-pointer input-recessed",
            "text-sm px-3 py-2 pr-9 h-9",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-on-variant pointer-events-none"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
        >
          <path d="M4 6.5l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {hint && <p className="text-[10px] text-on-variant/70 leading-snug">{hint}</p>}
    </div>
  );
}
