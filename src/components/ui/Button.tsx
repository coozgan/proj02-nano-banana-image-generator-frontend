import { forwardRef } from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, children, className, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 rounded-lg select-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--banana)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-0)]",
          "disabled:opacity-40 disabled:cursor-not-allowed",

          variant === "primary" && [
            "bg-[var(--banana)] text-zinc-900 hover:bg-[var(--banana-dim)]",
            "active:scale-[0.97]",
            !disabled && !loading && "shadow-[0_1px_0_rgba(255,255,255,0.15)_inset,0_0_0_1px_rgba(245,197,24,0.4)]",
          ],
          variant === "secondary" && [
            "bg-[var(--surface-3)] text-zinc-200 border border-[var(--border)]",
            "hover:bg-zinc-700 active:scale-[0.97]",
          ],
          variant === "ghost" && [
            "text-zinc-400 hover:text-zinc-100 hover:bg-[var(--surface-2)]",
            "active:scale-[0.97]",
          ],
          variant === "danger" && [
            "bg-red-500/10 text-red-400 border border-red-500/20",
            "hover:bg-red-500/20",
          ],

          size === "sm" && "text-xs px-2.5 py-1.5 h-7",
          size === "md" && "text-sm px-3.5 py-2 h-9",
          size === "lg" && "text-sm px-5 py-2.5 h-10",

          className
        )}
        {...props}
      >
        {loading ? (
          <svg
            className="w-4 h-4 animate-spin-slow"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
