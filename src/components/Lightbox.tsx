import { useEffect } from "react";

interface LightboxProps {
  src: string;
  alt: string;
  prompt: string;
  onClose: () => void;
}

export function Lightbox({ src, alt, prompt, onClose }: LightboxProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-bg-base/85 flex flex-col items-center justify-center p-6 anim-fadein backdrop-blur-glass"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        className="absolute top-5 right-5 w-10 h-10 rounded-full glass-panel text-on-surface hover:text-primary hover:border-primary/40 flex items-center justify-center transition-colors"
        onClick={onClose}
        aria-label="Close"
      >
        <span className="icon text-[20px]">close</span>
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[78vh] object-contain rounded-xl shadow-2xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      />
      <p
        className="mt-5 max-w-2xl text-center text-sm text-on-variant font-display tracking-tight"
        onClick={(e) => e.stopPropagation()}
      >
        "{prompt}"
      </p>
    </div>
  );
}
