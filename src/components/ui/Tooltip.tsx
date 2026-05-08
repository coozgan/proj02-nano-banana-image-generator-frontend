import { useState, useRef } from "react";
import clsx from "clsx";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
  side?: "top" | "bottom";
}

export function Tooltip({ content, children, className, side = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = () => { timer.current = setTimeout(() => setVisible(true), 350); };
  const hide = () => { clearTimeout(timer.current); setVisible(false); };

  return (
    <div
      className={clsx("relative inline-flex", className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={clsx(
            "absolute z-50 w-64 pointer-events-none anim-fadein",
            side === "top" ? "bottom-full mb-2 left-0" : "top-full mt-2 left-0"
          )}
        >
          <div className="glass-panel px-3 py-2 shadow-2xl">
            <p className="text-xs text-on-variant leading-relaxed">{content}</p>
          </div>
        </div>
      )}
    </div>
  );
}
