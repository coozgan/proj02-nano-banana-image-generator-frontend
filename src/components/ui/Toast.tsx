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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
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

  const accent =
    toast.type === "error"   ? "border-error/40" :
    toast.type === "warning" ? "border-tertiary/40" :
                               "border-success/40";

  const iconColor =
    toast.type === "error"   ? "text-error" :
    toast.type === "warning" ? "text-tertiary" :
                               "text-success";

  const iconName =
    toast.type === "error"   ? "error" :
    toast.type === "warning" ? "warning" :
                               "check_circle";

  return (
    <div
      className={clsx(
        "pointer-events-auto flex items-start gap-3 px-4 py-3 glass-panel",
        accent,
        "transition-all duration-300 ease-out",
        !visible && "opacity-0 translate-x-2"
      )}
    >
      <span className={clsx("icon shrink-0 mt-0.5 text-[18px]", iconColor)}>{iconName}</span>
      <p className="text-sm text-on-surface leading-snug flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-on-variant/70 hover:text-on-surface transition-colors shrink-0 mt-0.5"
        aria-label="Dismiss"
      >
        <span className="icon text-[16px]">close</span>
      </button>
    </div>
  );
}
