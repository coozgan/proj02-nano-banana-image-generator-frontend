import { useState, useRef } from "react";
import clsx from "clsx";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = () => {
    timer.current = setTimeout(() => setVisible(true), 400);
  };
  const hide = () => {
    clearTimeout(timer.current);
    setVisible(false);
  };

  return (
    <div
      className={clsx("relative inline-flex", className)}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className="absolute bottom-full left-0 mb-2 z-50 w-64 pointer-events-none"
        >
          <div className="bg-zinc-800 border border-[var(--border)] rounded-lg px-3 py-2 shadow-xl">
            <p className="text-xs text-zinc-300 leading-relaxed">{content}</p>
          </div>
          <div className="w-2 h-2 bg-zinc-800 border-r border-b border-[var(--border)] rotate-45 absolute left-4 -bottom-1" />
        </div>
      )}
    </div>
  );
}
