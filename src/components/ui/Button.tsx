import { forwardRef } from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
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
          "relative inline-flex items-center justify-center gap-2 font-medium select-none",
          "transition-all duration-200 ease-out whitespace-nowrap",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:shadow-glow",
          "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",

          variant === "primary" && [
            "bg-primary text-primary-on rounded-lg",
            "hover:bg-primary-container hover:text-on-surface",
            "active:scale-[0.98]",
            !disabled && !loading && "shadow-glow-lg",
          ],
          variant === "secondary" && [
            "rounded-lg glass-overlay text-on-surface",
            "hover:border-primary/40 hover:bg-bg-surface-high/70",
            "active:scale-[0.98]",
          ],
          variant === "ghost" && [
            "rounded-lg text-on-variant border border-transparent",
            "hover:text-on-surface hover:bg-white/5 hover:border-white/10",
            "active:scale-[0.98]",
          ],
          variant === "danger" && [
            "rounded-lg bg-error/10 text-error border border-error/30",
            "hover:bg-error/20 hover:border-error/50",
          ],

          size === "sm" && "text-xs px-2.5 py-1 h-7 tracking-tight",
          size === "md" && "text-sm px-4 py-2 h-9 tracking-tight",
          size === "lg" && "text-sm px-5 py-2.5 h-11 tracking-tight font-semibold",

          className
        )}
        {...props}
      >
        {loading && (
          <svg className="w-3.5 h-3.5 anim-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
            <path
              d="M12 3 a 9 9 0 0 1 9 9"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
