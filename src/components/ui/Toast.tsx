import { useEffect, useState } from "react";
import clsx from "clsx";

export interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "warning";
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 4000);
    return () => clearTimeout(t);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={clsx(
        "flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl transition-all duration-300 card",
        !visible && "opacity-0 translate-y-2",
        toast.type === "error" && "border-red-500/30",
        toast.type === "warning" && "border-amber-500/30",
        toast.type === "success" && "border-emerald-500/30"
      )}
    >
      <span className="text-base mt-0.5 shrink-0">
        {toast.type === "error" ? "✕" : toast.type === "warning" ? "⚠" : "✓"}
      </span>
      <p className="text-sm text-zinc-200 leading-snug flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-[var(--text-muted)] hover:text-zinc-100 transition-colors shrink-0 mt-0.5 text-xs"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}
